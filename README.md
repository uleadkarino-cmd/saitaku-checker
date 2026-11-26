# 補助金チェック

React・TypeScript・Vinextを使用したWebアプリです。公開先はCloudflare Workers、データベースはD1です。

公開サイト：https://saitaku-checker.saitaku-karino.workers.dev/

## ローカル起動

Node.js 22.13以上が必要です。プロジェクトのフォルダーで実行してください。

```powershell
npm.cmd ci --include=dev --include=optional
npm.cmd run dev -- --host 127.0.0.1
```

ローカルで認証が必要な場合は `/signin-with-chatgpt` を開いてください。

## 検証

```powershell
node --test tests/private-worker.test.mjs tests/plan-scoring.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

## Cloudflareへの反映

実行すると本番サイトが更新されます。`cloudflare.deploy.json` は現在の公開先の設定です。別のアカウントへ移す場合は、アカウントID・D1の接続先・管理者メール・公開URLを変更してください。

```powershell
node node_modules/wrangler/bin/wrangler.js login
$env:DEPLOY_TARGET='cloudflare'
$env:SITE_ORIGIN='https://saitaku-checker.saitaku-karino.workers.dev'
npm.cmd run build
node node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.json
```

管理者認証とブラウザー利用者の識別には、Cloudflareのシークレット `PRIVATE_MEMBERS` が必要です。値はリポジトリに含めません。既存のシークレットは通常のデプロイで保持されます。

## アクセスログ

```powershell
node node_modules/wrangler/bin/wrangler.js tail saitaku-checker --config cloudflare.deploy.json --format pretty
```

終了はCtrl+Cです。

## 共有対象

ソースコードと設定、および `dist` のビルド結果とルートの `node_modules` の依存パッケージ、`outputs` の開発サーバーログを共有します。管理者パスワード・ログイン情報（`outputs/cloudflare-private`）・ローカルDB・アップロード書類・実行時キャッシュは含めません。これらは `.gitignore` で除外しています。`d1-crud-api` のサンプルプロジェクトもソースコードと設定を共有します。


## AI詳細チェック（ローカル）

メール認証・決済は不要です。OpenAI Responses APIへ接続して計画の根拠・経費・数値の整合性を確認します。正式な公募要領の照合や採択可否の判定ではありません。

1. https://platform.openai.com/api-keys でAPIキーを作成し、APIの利用可能残高・利用上限を確認してください。
2. プロジェクト直下で `.dev.vars.example` を `.dev.vars` にコピーし、`OPENAI_API_KEY` にキーを設定してください。キーはチャットやGitHubへ貼らないでください。`.dev.vars` はGitの対象外です。
3. 開発サーバーを停止し、`npm.cmd run dev -- --host 127.0.0.1` で再起動してください。
4. 計画を入力して結果画面へ進み、「詳細チェックを見る」で送信内容を確認し、同意して実行してください。実書類テストモードでは送信を無効にしています。
5. 結果の「結果をPDF保存・印刷」から「PDFに保存」を選べます。

APIの利用料はキーの所有者に発生します。サーバーでは本文・結果を永続保存せず、OpenAIへは `store: false` で送信します。本文・経費に含まれる個人情報も送信対象となるため、送信前のプレビューを確認してください。接続キーはブラウザーへ返しません。

接続テスト（外部APIを呼ばないモックテスト）：

```powershell
node --test tests/ai-review.test.mjs
```

本番へ反映する場合は、別途Cloudflareのシークレット `OPENAI_API_KEY` の設定とデプロイが必要です。この変更はローカルでのみ検証しています。
