import { AlertTriangle, ArrowLeft, BadgeJapaneseYen, CheckCircle2 } from 'lucide-react';

const disclosureItems = [
  ['販売事業者', '正式公開前に、戸籍上の氏名または登記された商号を掲載します。'],
  ['運営責任者', '正式公開前に確定して掲載します。'],
  ['所在地', '正式公開前に、事業を行う正確な住所を掲載します。'],
  ['電話番号', '正式公開前に、確実に連絡できる番号を掲載します。'],
  ['お問い合わせ先', '現在はサイト内のお問い合わせフォームで受け付けています。'],
  ['販売価格', '有料版の機能・利用回数とともに、税込価格を購入前に明示します。'],
  ['販売価格以外の負担', 'インターネット接続料金・通信料金は利用者の負担です。その他の費用が生じる場合は購入前に明示します。'],
  ['支払方法・支払時期', '決済方法の決定後、利用可能な支払方法と請求時期を購入前に明示します。'],
  ['サービスの提供時期', '決済完了後に利用可能となる時期を、購入前に明示します。'],
  ['解約・キャンセル・返金', '有料版の提供方式に合わせ、解約方法、期限、返金の可否と条件を購入前に明示します。'],
  ['動作環境・提供条件', '対応する端末・ブラウザ・PDF条件・利用回数・有効期間を購入前に明示します。'],
];

export default function CommercialTransactionsPage() {
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
          <span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-900">
            <BadgeJapaneseYen className="size-5" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">特定商取引法に基づく表記</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            有料版を安心して申し込めるよう、販売条件と運営者情報を掲載するためのページです。
          </p>

          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            <AlertTriangle className="mt-1 size-5 shrink-0" />
            <div>
              <p className="font-bold">現在、有料版の販売は開始していません</p>
              <p>
                下記は正式販売前の準備項目です。未確定の運営者情報や料金を仮情報で表示せず、販売開始前に正確な内容へ更新します。
              </p>
            </div>
          </div>

          <dl className="mt-7 overflow-hidden rounded-2xl border border-border">
            {disclosureItems.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-2 border-b border-border p-5 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-5"
              >
                <dt className="text-sm font-bold">{label}</dt>
                <dd className="text-sm leading-7 text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
            <h2 className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="size-5" />
              販売開始前に行うこと
            </h2>
            <p className="mt-2">
              このページの全項目を確定し、購入の最終確認画面でも価格、利用回数・期間、支払時期、提供時期、解約・返金条件を一覧で確認できるようにします。
            </p>
          </section>

          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold">
            <a href="/plans" className="text-primary underline underline-offset-4">
              プラン比較
            </a>
            <a href="/terms" className="text-primary underline underline-offset-4">
              利用規約
            </a>
            <a href="/privacy" className="text-primary underline underline-offset-4">
              個人情報・データの取扱い
            </a>
            <a href="/contact" className="text-primary underline underline-offset-4">
              お問い合わせ
            </a>
          </nav>

          <p className="mt-6 text-xs text-muted-foreground">準備ページ更新日：2026年9月4日</p>
        </article>
      </div>
    </main>
  );
}
