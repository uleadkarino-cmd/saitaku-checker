import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
} from 'lucide-react';

export default function CoveragePage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          チェッカーに戻る
        </a>
        <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_rgb(7_47_95/7%)] sm:p-9">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <FileCheck2 className="size-5" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">対応範囲・根拠資料</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            現在のチェックが、どの制度・公募回・資料を基準にしているかを確認できます。
          </p>
          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-700" />
              <h2 className="font-bold">小規模事業者持続化補助金</h2>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-emerald-800">対象</dt>
                <dd className="mt-1 font-bold">一般型・通常枠 第20回</dd>
              </div>
              <div>
                <dt className="text-xs text-emerald-800">公募要領</dt>
                <dd className="mt-1 font-bold">第8版</dd>
              </div>
              <div>
                <dt className="text-xs text-emerald-800">確認段階</dt>
                <dd className="mt-1 font-bold">申請前の書類チェック</dd>
              </div>
              <div>
                <dt className="text-xs text-emerald-800">最終確認日</dt>
                <dd className="mt-1 font-bold">2026年9月2日</dd>
              </div>
            </dl>
          </div>
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <div className="flex items-center gap-2">
              <Clock3 className="size-5" />
              <h2 className="font-bold">現在は暫定チェックです</h2>
            </div>
            <p className="mt-3 text-sm leading-7">
              第20回の公募要領第8版は反映していますが、申請受付開始前のため、参考資料・申請時によくある質問・申請システム操作手引きなどが未公開または準備中です。公開後にチェックルールを更新します。
            </p>
          </section>
          <section className="mt-5 rounded-2xl border border-border p-5">
            <h2 className="font-bold">公式の確認先</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href="https://official.jizokukanb.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-bold hover:border-primary hover:text-primary"
              >
                商工会地区 公式サイト
                <ExternalLink className="size-4" />
              </a>
              <a
                href="https://r6.jizokukahojokin.info/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-bold hover:border-primary hover:text-primary"
              >
                商工会議所地区 公式サイト
                <ExternalLink className="size-4" />
              </a>
            </div>
          </section>
          <section className="mt-5 rounded-2xl border border-border p-5">
            <h2 className="font-bold">そのほかの補助金</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              新事業進出・ものづくり商業サービス補助金は、現在は画面と基本項目の試作段階です。正式な提出可否の判断には使わず、制度ごとの最新公募要領を確認してください。
            </p>
          </section>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
            <strong>判定できないこと：</strong>
            採択の可否、事務局独自の運用判断、原本の真正性、画像だけのPDFに書かれた内容。最終提出前は公式資料と事務局案内を必ず確認してください。
          </div>
        </div>
      </div>
    </main>
  );
}
