# --- ステージ1: ビルド環境 ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# プロジェクトファイル(.csproj)を先にコピーし、依存関係を復元する
# これにより、ソースコードの変更時にもライブラリの再ダウンロードが不要になり、ビルドが高速化される
COPY ["Torito.API.csproj", "."]
RUN dotnet restore "./Torito.API.csproj"

# プロジェクトの全ソースコードをコピー
COPY . .

# アプリケーションをビルド・発行
RUN dotnet build "Torito.API.csproj" -c Release -o /app/build
RUN dotnet publish "Torito.API.csproj" -c Release -o /app/publish

# --- ステージ2: 実行環境 ---
# ビルド環境よりも軽量なランタイムイメージをベースにする
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# ビルドステージから発行されたファイルのみをコピー
COPY --from=build /app/publish .

# コンテナが8080ポートでリッスンするように設定
EXPOSE 8080

# コンテナ起動時に実行するコマンド
ENTRYPOINT ["dotnet", "Torito.API.dll"]