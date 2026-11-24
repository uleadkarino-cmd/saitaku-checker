import { AlertTriangle, ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: '1. この規約について',
    body: 'この利用規約は、「サイタク！補助金書類チェッカー」（以下「本サービス」）の利用条件を定めるものです。本サービスを利用する方は、この規約と個人情報・データの取扱いに同意したうえで利用してください。',
  },
  {
    title: '2. サービスの目的',
    body: '本サービスは、補助金申請書類の記載漏れや確認ポイントを整理し、申請者自身の提出前確認を支援するためのものです。行政機関、補助金事務局、商工会、商工会議所その他の公的機関が提供・運営するサービスではありません。',
  },
  {
    title: '3. チェック結果の位置づけ',
    body: 'チェック結果は自動判定を含む参考情報であり、内容の正確性、最新性、完全性、採択、交付決定、補助対象性または不備がないことを保証するものではありません。利用者は、最新の公募要領、公式資料および事務局の案内を必ず確認し、自らの責任で申請してください。',
  },
  {
    title: '4. 利用回数と提供内容',
    body: '無料版は、ログインした利用者1人につき合計10回まで利用できます。解析に失敗した場合は原則として回数を消費しません。対象となる補助金、公募回、確認項目および回数は、画面上の案内に従います。',
  },
  {
    title: '5. PDFと入力データ',
    body: '現在の無料チェックでは、選択したPDFを利用者の端末内で読み取ります。一時保存を選択した場合は、PDF以外の入力内容の一部がブラウザ内に保存されます。保存内容、問い合わせ情報、利用回数の取扱いは「個人情報・データの取扱い」で説明します。',
  },
  {
    title: '6. 禁止事項',
    body: '法令に違反する行為、本サービスや第三者への不正アクセス、過度な負荷をかける行為、利用回数制限の回避、他人になりすます行為、第三者の権利や秘密を侵害する行為、サービスの解析・複製・転売を目的とする不正利用を禁止します。',
  },
  {
    title: '7. 知的財産',
    body: '本サービスの名称、ロゴ、画面、文章、チェック方法、プログラムその他のコンテンツに関する権利は、運営者または正当な権利者に帰属します。利用者が作成または添付した申請書類の権利は、利用者または各権利者に留保されます。',
  },
  {
    title: '8. サービスの変更・停止',
    body: '保守、障害、セキュリティ対応、公募要領の変更その他必要な場合、本サービスの全部または一部を変更・停止することがあります。可能な範囲で事前に案内しますが、緊急時は予告なく実施する場合があります。',
  },
  {
    title: '9. 責任について',
    body: '運営者は、本サービスに故意または重大な過失がある場合を除き、本サービスの利用により生じた損害について、適用法令で認められる範囲で責任を負います。法令上無効となる免責を定めるものではありません。有料版の責任範囲は、料金・返金条件とともに正式提供前に別途明示します。',
  },
  {
    title: '10. 規約の変更',
    body: 'サービス内容や法令の変更に応じて、この規約を変更する場合があります。重要な変更は、効力が生じる前に本サービス上で分かりやすく案内します。',
  },
  {
    title: '11. 準拠法・お問い合わせ',
    body: 'この規約は日本法に準拠します。サービスや規約に関するお問い合わせは、本サービス内のお問い合わせページから受け付けます。紛争が生じた場合は、まず当事者間で誠実に協議します。',
  },
];

export default function TermsPage() {
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
        <article className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_rgb(7_47_95/7%)] sm:p-9">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">利用規約</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            サイタク！補助金書類チェッカーを安心して利用いただくための条件です。
          </p>

          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            <AlertTriangle className="mt-1 size-5 shrink-0" />
            <div>
              <p className="font-bold">現在はベータ版向けの規約草案です</p>
              <p>
                正式公開前に、運営者情報、有料版の料金・解約・返金条件、紛争時の管轄裁判所を確定し、専門家による最終確認を行います。
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-border p-5"
              >
                <h2 className="font-bold">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs leading-6 text-emerald-950">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="size-4" />
              関連する確認ページ
            </h2>
            <div className="mt-3 flex flex-wrap gap-4">
              <a
                href="/faq"
                className="font-bold underline underline-offset-4"
              >
                よくある質問
              </a>
              <a
                href="/privacy"
                className="font-bold underline underline-offset-4"
              >
                個人情報・データの取扱い
              </a>
              <a
                href="/coverage"
                className="font-bold underline underline-offset-4"
              >
                現在の対応範囲
              </a>
              <a
                href="/commercial-transactions"
                className="font-bold underline underline-offset-4"
              >
                特定商取引法に基づく表記
              </a>
              <a
                href="/contact"
                className="font-bold underline underline-offset-4"
              >
                お問い合わせ
              </a>
            </div>
          </section>

          <p className="mt-6 text-xs text-muted-foreground">
            草案作成日：2026年9月4日
          </p>
          <p className="mt-2 text-[11px] leading-6 text-muted-foreground">
            本草案は、消費者庁の消費者契約法に関する資料および個人情報保護委員会のガイドラインを参考にしています。
          </p>
        </article>
      </div>
    </main>
  );
}
