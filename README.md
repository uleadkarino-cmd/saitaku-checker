# サイタク！補助金書類チェッカー

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

ソースコードと設定、および `dist` のビルド結果を共有します。管理者パスワード・ログイン情報・ローカルDB・アクセスログ・アップロード書類・依存パッケージは含めません。これらは `.gitignore` で除外しています。`d1-crud-api` のサンプルプロジェクトもソースコードと設定を共有します。
