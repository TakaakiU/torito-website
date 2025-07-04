using Microsoft.EntityFrameworkCore; // usingを追加
using Torito.API.Data; // usingを追加
using Microsoft.AspNetCore.Authentication.JwtBearer; // usingを追加
using Microsoft.IdentityModel.Tokens; // usingを追加

var builder = WebApplication.CreateBuilder(args);

// 1. データベース接続文字列を環境変数から取得
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. DbContextをDIコンテナに登録
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString) // PostgreSQLを使うことを指定
);

var cognitoConfig = builder.Configuration.GetSection("Cognito");
var userPoolId = cognitoConfig["UserPoolId"];
var region = cognitoConfig["Region"];

// JWT認証サービスをDIコンテナに登録
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://cognito-idp.{region}.amazonaws.com/{userPoolId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://cognito-idp.{region}.amazonaws.com/{userPoolId}",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidateAudience = false // ClientIdの検証はここでは不要
        };
    });

// --- サービスの登録 (DIコンテナへの登録) ---

// CORS(Cross-Origin Resource Sharing)設定を追加
// これにより、指定したオリジン(Reactアプリ)からこのAPIへのWebブラウザ経由のアクセスが許可される
builder.Services.AddCors(options =>
{
    // "AllowReactApp" という名前のポリシーを定義
    options.AddPolicy("AllowReactApp", policy =>
    {
        // 開発用のReactアプリ(Vite)が動作するオリジンを許可
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader() // 全てのHTTPヘッダーを許可
              .AllowAnyMethod(); // 全てのHTTPメソッド(GET, POST, PUT, DELETEなど)を許可
    });
});

// APIがControllersベースで動作するようにサービスを登録
builder.Services.AddControllers();

// Swagger (OpenAPI) ドキュメントを生成するためのサービスを登録
// AddEndpointsApiExplorerは、Minimal APIとController APIのエンドポイント情報を収集する
builder.Services.AddEndpointsApiExplorer();
// AddSwaggerGenは、収集された情報をもとにSwagger/OpenAPIの仕様(JSON)を生成する
builder.Services.AddSwaggerGen();

// --- アプリケーションの構築 ---
var app = builder.Build();

// --- HTTPリクエストパイプラインの構成 (ミドルウェアの登録) ---
// ここに登録したミドルウェアは、リクエスト毎に上から順に実行される

// 開発環境 (ASPNETCORE_ENVIRONMENT=Development) の場合のみSwagger UIを有効にする
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // SwaggerのJSONエンドポイントを有効化 (/swagger/v1/swagger.json)
    app.UseSwaggerUI(); // SwaggerのUIを有効化 (/swagger)
}

// 本番環境(App Runnerなど)のリバースプロキシ配下ではHTTPSリダイレクトは不要な場合が多い
// app.UseHttpsRedirection();

// ルーティングミドルウェアを最初に配置
app.UseRouting();

// CORSミドルウェアを配置
app.UseCors("AllowReactApp");

// 認証ミドルウェアを配置
app.UseAuthentication();

// 認可ミドルウェアを配置
app.UseAuthorization();

// エンドポイントをマッピング
app.MapControllers();

// SeedData呼び出し
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        SeedData.Initialize(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

// アプリケーションを実行
app.Run();
