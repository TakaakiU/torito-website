// lib/torito-stack.ts

// 必要なライブラリやモジュールをインポートします。
// CDK v2の作法に則り、安定版のモジュールは 'aws-cdk-lib' からまとめてインポートします。
import {
  aws_ec2 as ec2,
  aws_rds as rds,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_cognito as cognito,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
  Stack,
  StackProps,
  RemovalPolicy, // リソースの削除ポリシー
  CfnOutput,      // デプロイ後の出力
  Duration,
} from 'aws-cdk-lib';
// App Runnerなど、まだアルファ版のモジュールは個別にインポートします。
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import { Construct } from 'constructs';

export class ToritoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- 1. ネットワーク (VPC) の定義 ---
    // RDSやApp Runnerなど、セキュアなリソースを配置するためのプライベートなネットワーク空間を作成します。
    const vpc = new ec2.Vpc(this, 'ToritoVpc', {
      maxAzs: 2, // 可用性を高めるため、2つのアベイラビリティゾーンにまたがるように設定
      natGateways: 1, // プライベートサブネットからインターネットへのアウトバウンド通信を可能にする
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // --- 2. データベース (Amazon RDS) の定義 ---
    // 宿情報やクチコミを保存するPostgreSQLデータベースを作成します。
    
    // データベースへのアクセスを許可するためのセキュリティグループ
    const dbSg = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Security group for the RDS database',
    });

    // AWSアカウント作成後12ヶ月間無料枠が利用できるインスタンスタイプとストレージサイズを指定
    const dbInstance = new rds.DatabaseInstance(this, 'ToritoDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.of('16.9', '16') }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // 無料枠対象
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // プライベートサブネットに配置
      },
      securityGroups: [dbSg],
      databaseName: 'torito_db', // データベース名
      allocatedStorage: 20, // ストレージサイズ (GB)
      // ↓↓↓ 重要 ↓↓↓
      // この設定により `cdk destroy` でDBが削除されます。開発中は便利ですが、
      // 本番環境では `RemovalPolicy.RETAIN` や `RemovalPolicy.SNAPSHOT` に変更してください。
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // --- 3. 認証 (Amazon Cognito) の定義 ---
    // ユーザー登録・ログイン機能を担当します。
    const userPool = new cognito.UserPool(this, 'ToritoUserPool', {
      userPoolName: 'torito-user-pool',
      selfSignUpEnabled: true, // ユーザー自身がサインアップできる
      signInAliases: { email: true }, // Eメールをユーザー名として使用
      autoVerify: { email: true }, // Eメールで本人確認を行う
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: false,
      },
      removalPolicy: RemovalPolicy.DESTROY, // 開発用。本番ではRETAIN
    });

    // アプリケーション（フロントエンド）がCognitoと通信するためのクライアント
    const userPoolClient = userPool.addClient('ToritoAppClient', {
      oAuth: {
        flows: {
          authorizationCodeGrant: true, // Googleログインなどで使用
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:3000'], // 開発中のReactアプリのURL。後で本番URLを追加
        logoutUrls: ['http://localhost:3000'],
      },
    });

    // --- 4. バックエンド (AWS App Runner) の定義 ---
    // ASP.NET Core Web APIをホストします。
    
    // App RunnerがDBにアクセスするためのセキュリティグループを作成
    const appRunnerSg = new ec2.SecurityGroup(this, 'AppRunnerSecurityGroup', {
      vpc,
      description: 'Security group for App Runner',
    });

    // DBのセキュリティグループに、App Runnerからのアクセスを許可するルールを追加
    dbSg.addIngressRule(
      appRunnerSg,
      ec2.Port.tcp(5432), // PostgreSQLのポート
      'Allow App Runner to access the database'
    );

    // App Runnerサービスを定義
    const appRunnerService = new apprunner.Service(this, 'ToritoAppRunnerService', {
      source: apprunner.Source.fromEcrPublic({
        imageConfiguration: {
          port: 8080,
          // ↓↓↓ ここに移動する ↓↓↓
          environmentVariables: {
            'ASPNETCORE_ENVIRONMENT': 'Production',
            'DB_HOST': dbInstance.dbInstanceEndpointAddress,
          },
        },
        imageIdentifier: 'public.ecr.aws/aws-containers/hello-app-runner:latest',
      }),
      vpcConnector: new apprunner.VpcConnector(this, 'VpcConnector', {
        vpc,
        vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
        securityGroups: [appRunnerSg],
      }),
    });
    // App RunnerがDBの認証情報を安全に取得するためのIAMロール設定
    dbInstance.grantConnect(appRunnerService, 'api_user');


    // --- 5. フロントエンド (S3 + CloudFront) の定義 ---
    // Reactで作成した静的サイトをホスティングします。

    // 5.1. ファイルを格納するS3バケット
    const frontendBucket = new s3.Bucket(this, 'ToritoFrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false, // CloudFrontからのみアクセスを許可するため、パブリックアクセスはOFF
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // cdk destroyでバケットと中身を自動削除
    });

    // 5.2. S3バケットへのアクセスを制御するID
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    frontendBucket.grantRead(originAccessIdentity);

    // 5.3. 高速配信とHTTPS化のためのCloudFrontディストリビューション
    const distribution = new cloudfront.Distribution(this, 'ToritoDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // --- 6. スタックの出力 (Outputs) ---
    // デプロイ完了後、ターミナルに表示される情報。フロントエンドの設定などで使います。
    new CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });
    new CfnOutput(this, 'CognitoUserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'The ID of the Cognito User Pool Client',
    });
    new CfnOutput(this, 'AppRunnerServiceUrl', {
      value: appRunnerService.serviceUrl,
      description: 'The URL of the App Runner service',
    });
    new CfnOutput(this, 'CloudFrontDistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the CloudFront distribution',
    });
  }
}