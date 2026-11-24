import { ArrowLeft, Check, LockKeyhole, Sparkles } from 'lucide-react';

const rows = [
  ['チェック回数', '合計10回', '正式決定後に掲載'],
  ['事業計画書の基本チェック', '利用できます', '利用できます'],
  ['経費明細・見積書の基本チェック', '利用できます', '利用できます'],
  ['必要書類の種類・不足チェック', '利用できます', '利用できます'],
  ['書類間の整合性チェック', '対象外', '利用予定'],
  ['詳しい改善アドバイス', '基本的な助言', 'より詳しく確認予定'],
  ['結果レポートのPDF保存', '対象外', '利用予定'],
];

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          チェッカーに戻る
        </a>
        <header className="mt-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-800">
            <Sparkles className="size-6" />
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            無料版と有料版の違い
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            まずは無料で基本的な不備を確認できます。書類をさらに詳しく仕上げたい方向けに、有料版を準備しています。
          </p>
        </header>

        <section className="mt-9 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_40px_rgb(52_64_58/6%)]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border bg-muted/30 text-xs font-bold sm:text-sm">
            <div className="p-4 sm:p-5">確認できること</div>
            <div className="border-l border-border p-4 text-center sm:p-5">
              無料版
            </div>
            <div className="border-l border-border bg-amber-50 p-4 text-center text-amber-950 sm:p-5">
              有料版
            </div>
          </div>
          {rows.map(([label, free, paid]) => (
            <div
              key={label}
              className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border text-[11px] last:border-b-0 sm:text-sm"
            >
              <div className="p-4 font-bold sm:p-5">{label}</div>
              <div className="border-l border-border p-4 text-center text-muted-foreground sm:p-5">
                {free}
              </div>
              <div className="border-l border-border bg-amber-50/40 p-4 text-center font-bold text-amber-950 sm:p-5">
                {paid}
              </div>
            </div>
          ))}
        </section>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <Check className="size-6 text-emerald-700" />
            <h2 className="mt-4 text-xl font-bold text-emerald-950">無料版</h2>
            <p className="mt-2 text-sm leading-7 text-emerald-900">
              申請前の基本確認を合計10回まで利用できます。解析に失敗した場合は回数を消費しません。
            </p>
            <a
              href="/"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              無料でチェックする
            </a>
          </section>
          <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
            <LockKeyhole className="size-6 text-amber-800" />
            <h2 className="mt-4 text-xl font-bold text-amber-950">
              有料版（準備中）
            </h2>
            <p className="mt-2 text-sm leading-7 text-amber-900">
              料金と提供回数は、機能完成後に決定します。希望する機能や利用場面をお知らせいただけます。
            </p>
            <a
              href="/contact?subject=paid-plan"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-amber-400 px-5 text-sm font-bold text-amber-950 hover:bg-amber-300"
            >
              有料版の案内を受け取る
            </a>
          </section>
        </div>

        <p className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
          本サービスは補助金の採択を保証するものではありません。最終確認は最新の公募要領と事務局の案内に従ってください。
        </p>
        <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-muted-foreground">
          <a href="/faq" className="hover:text-primary">よくある質問</a>
          <a href="/terms" className="hover:text-primary">利用規約</a>
          <a href="/commercial-transactions" className="hover:text-primary">
            特定商取引法に基づく表記
          </a>
          <a href="/privacy" className="hover:text-primary">個人情報・データの取扱い</a>
          <a href="/contact" className="hover:text-primary">お問い合わせ</a>
        </nav>
      </div>
    </main>
  );
}
