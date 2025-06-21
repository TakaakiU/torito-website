var builder = WebApplication.CreateBuilder(args);

// CORS(Cross-Origin Resource Sharing)設定を追加
// これにより、localhost:3000(Reactアプリ)からlocalhost:8000(API)へのアクセスが許可される
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// APIがControllersベースで動作するようにサービスを登録
builder.Services.AddControllers();

// Swagger (APIドキュメント) を生成するためのサービスを登録
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 開発環境 (ASPNETCORE_ENVIRONMENT=Development) の場合のみSwaggerを有効にする
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Dockerコンテナ内ではHTTPSリダイレクトは複雑になるため、一旦無効化する
// app.UseHttpsRedirection();

// 登録したCORSポリシーを有効にする
app.UseCors("AllowReactApp");

app.UseAuthorization();

// リクエストを適切なControllerのアクションに振り分ける
app.MapControllers();

app.Run();