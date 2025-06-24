// lib/torito-stack.ts (修正・改善後)

import {
  aws_ec2 as ec2,
  aws_rds as rds,
  aws_s3 as s3,
  aws_cognito as cognito,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_secretsmanager as secretsmanager, // Secrets Managerを追加
  aws_iam as iam,
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
} from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import { Construct } from 'constructs';

export class ToritoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- 1. ネットワーク (VPC) ---
    const vpc = new ec2.Vpc(this, 'ToritoVpc', {
      maxAzs: 2,
      natGateways: 1,
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

    // --- 2. データベース (Amazon RDS) ---
    // (A) DBの認証情報をSecrets Managerで安全に管理
    const dbCredentialsSecret = new secretsmanager.Secret(this, 'DbCredentialsSecret', {
      secretName: 'torito/db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'api_user' }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
      removalPolicy: RemovalPolicy.DESTROY, // 開発用
    });
    
    const dbSg = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Security group for the RDS database',
    });

    const dbInstance = new rds.DatabaseInstance(this, 'ToritoDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.of('16.9', '16') }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSg],
      databaseName: 'torito_db',
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret), // (B) Secrets Managerから認証情報を取得
      allocatedStorage: 20,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // --- 3. 認証 (Amazon Cognito) ---
    const userPool = new cognito.UserPool(this, 'ToritoUserPool', {
      userPoolName: 'torito-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient('ToritoAppClient', {
      readAttributes: new cognito.ClientAttributes().withStandardAttributes({
        email: true,
        emailVerified: true,
      }),
      
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:5173'],
        logoutUrls: ['http://localhost:5173'],
      },
    });

    // --- 4. バックエンド (AWS App Runner) ---
    const appRunnerSg = new ec2.SecurityGroup(this, 'AppRunnerSecurityGroup', {
      vpc,
      description: 'Security group for App Runner',
    });

    dbSg.addIngressRule(
      appRunnerSg,
      ec2.Port.tcp(5432),
      'Allow App Runner to access the database'
    );

    const appRunnerService = new apprunner.Service(this, 'ToritoAppRunnerService', {
      source: apprunner.Source.fromEcrPublic({
        imageConfiguration: {
          port: 8080,
          environmentVariables: {
            'ASPNETCORE_ENVIRONMENT': 'Production',
            // Secrets Managerから取得するSecretの名前を環境変数として渡す
            'DB_CREDENTIALS_SECRET_ARN': dbCredentialsSecret.secretArn, 
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
    
    // App Runnerの実行ロールにSecrets Managerの読み取り権限を付与
    appRunnerService.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [dbCredentialsSecret.secretArn]
    }));

    // --- 5. フロントエンド (S3 + CloudFront) ---
    const frontendBucket = new s3.Bucket(this, 'ToritoFrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    frontendBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, 'ToritoDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // --- 6. スタックの出力 (Outputs) ---
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
    // (E) Secrets ManagerのARNも出力しておくとデバッグに便利
    new CfnOutput(this, 'DbCredentialsSecretArn', {
        value: dbCredentialsSecret.secretArn,
        description: 'ARN of the DB credentials secret in Secrets Manager'
    });
  }
}