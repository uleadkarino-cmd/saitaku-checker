import { env } from 'cloudflare:workers';
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { QualityTracker, type TestCase } from './quality-tracker';

export const dynamic = 'force-dynamic';

const testCases: TestCase[] = [
  {
    area: '事業計画',
    title: '十分な文章を正しく評価できる',
    input: '14項目へ、数値・理由・根拠を含む実際の計画文を貼り付ける',
    pass: '記載済みの内容を「不足」と誤判定せず、評価できる点を具体的に表示する',
    target: 'plan',
  },
  {
    area: '事業計画',
    title: '言い換え表現を読み取れる',
    input: '「課題」という単語を使わず、問題・原因・影響を具体的に記載する',
    pass: '特定の単語だけに依存せず、課題の内容と背景を確認できる',
    target: 'plan',
  },
  {
    area: '事業計画',
    title: '市場データの出典を確認できる',
    input: '資料名、発表主体、調査年、URLなど表記の異なる出典を記載する',
    pass: '出典がある文章を「出典なし」と誤判定しない',
    target: 'plan',
  },
  {
    area: '経費明細',
    title: '見積書と経費明細を読み分けられる',
    input: '文字情報のある見積書PDFと経費明細PDFをそれぞれ添付する',
    pass: '品名・金額・発行元・日付を確認し、別分野の不足結果を混ぜない',
    target: 'expense',
  },
  {
    area: '必要書類',
    title: '書類ごとの添付不足を正しく示す',
    input: '様式4、決算書などを一部だけ添付してチェックする',
    pass: '未添付の書類だけを不足として表示し、添付済み書類と区別する',
    target: 'documents',
  },
  {
    area: '安全性',
    title: '個人情報を保存・表示しない',
    input: '個人情報を含まない黒塗り版を使い、実書類テストモードで確認する',
    pass: 'PDF本体を送信せず、結果にも住所・電話番号などを表示しない',
    target: 'safe-mode',
  },
  {
    area: 'エラー',
    title: '読めないPDFを安全に案内する',
    input: '画像だけのPDF、パスワード付きPDF、破損PDFを選択する',
    pass: '原因候補と次の対応を表示し、無料回数を消費しない',
    target: 'expense',
  },
  {
    area: '画面',
    title: 'スマートフォンでも修正まで進める',
    input: '小さい画面で採点、絞り込み、例文コピー、項目修正を行う',
    pass: '横にはみ出さず、対象入力欄へ戻って再編集できる',
    target: 'plan',
  },
];

export default async function QualityChecklistPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders
    .get('oai-authenticated-user-email')
    ?.trim()
    .toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          管理画面に戻る
        </a>

        <header className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900">
            <ShieldCheck className="size-4" />
            運営者専用
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">実書類テスト項目</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-950/70">
            匿名化した書類で、誤判定・読み取り失敗・個人情報の扱いを確認します。1件の書類だけで合格とせず、異なる事業者の例で繰り返します。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-white p-4"><p className="text-xs font-bold text-blue-700">テスト項目</p><p className="mt-1 text-2xl font-bold text-blue-950">{testCases.length}件</p></div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4"><p className="text-xs font-bold text-blue-700">推奨する実例</p><p className="mt-1 text-2xl font-bold text-blue-950">3事業者以上</p></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-800">現在の判定</p><p className="mt-1 text-lg font-bold text-amber-950">継続確認中</p></div>
          </div>
        </header>

        <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <h2 className="flex items-center gap-2 font-bold"><TriangleAlert className="size-5" />テスト時の注意</h2>
          <p className="mt-1">必ず黒塗り版を使用し、氏名・住所・電話番号・メールアドレス・口座・マイナンバーが残っていないことを確認してください。原本は添付しません。</p>
        </section>

        <QualityTracker testCases={testCases} />

        <p className="mt-7 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
          <ClipboardCheck className="mt-0.5 size-4 shrink-0" />
          判定が合わない場合は、結果画面の「この判定を報告する」から項目名と判定を記録します。書類本文は問い合わせに含めません。
        </p>
      </div>
    </main>
  );
}
