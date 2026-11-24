import { ArrowLeft, Check, Database, ShieldCheck, Trash2 } from 'lucide-react';

const sections = [
  {
    icon: ShieldCheck,
    title: 'PDFファイルの処理',
    body: '無料チェックで選択したPDFは、お使いの端末内で読み取ります。PDFファイルそのものを本サービスのサーバーへ保存・送信する処理は行いません。',
  },
  {
    icon: Database,
    title: 'ログイン情報と無料利用回数',
    body: '無料10回を利用者ごとに管理するため、ログインした利用者の識別ID、メールアドレス、利用回数、初回・最終利用日時をサーバーに保存します。申請書の本文やPDFファイルは、この回数管理には保存しません。',
  },
  {
    icon: Database,
    title: '一時保存される内容',
    body: '「一時保存」を押した場合だけ、入力した文章・経費金額・選択内容をブラウザ内に最長30日間保存します。PDFファイル、申請者名、事業者名は保存しません。共有端末では一時保存を使わないでください。',
  },
  {
    icon: Database,
    title: 'お問い合わせ内容',
    body: '利用者が確認後に「この内容で送信する」を押した場合だけ、氏名（任意）、返信先メールアドレス、お問い合わせ種別・本文、選択した希望機能を保存します。不具合調査用の端末情報は、利用者が添付に同意した場合だけ保存します。申請書やPDFは問い合わせに添付できません。',
  },
  {
    icon: Trash2,
    title: 'データの削除',
    body: '「保存を削除」でブラウザ内の一時保存データを削除できます。実書類テスト後は「結果を保存せず終了」を押すと、その画面で読み取った内容を消去します。',
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">個人情報・データの取扱い</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            実在する申請書類を確認する前に、データがどこで処理され、何が保存されるかをご確認ください。
          </p>
          <div className="mt-7 space-y-4">
            {sections.map(({ icon: Icon, title, body }) => (
              <section
                key={title}
                className="rounded-2xl border border-border p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h2 className="font-bold">{title}</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {body}
                </p>
              </section>
            ))}
          </div>
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <h2 className="font-bold">実書類テストモード</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {[
                'PDFを端末内だけで解析します',
                '一時保存を無効にします',
                'AI詳細チェックへの送信を無効にします',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-emerald-700" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-950">
            <h2 className="text-sm font-bold">AI詳細チェックについて</h2>
            <p className="mt-2">
              現在のベータ版では、AIへの送信や購入処理は行いません。正式版で提供する場合は、送信する情報、利用目的、提供先、保存期間を利用前の確認画面に明示し、同意を得てから送信します。
            </p>
          </section>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            本ページは現在のベータ版の実装内容を説明するものです。正式公開前に、運営者情報・問い合わせ先・保存期間などを確定し、正式なプライバシーポリシーとして更新します。
          </p>
        </div>
      </div>
    </main>
  );
}
