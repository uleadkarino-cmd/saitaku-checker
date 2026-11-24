import { env } from 'cloudflare:workers';
import { ArrowLeft, BadgeJapaneseYen, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PricingOptions } from './pricing-options';
import { CostCalculator } from './cost-calculator';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();
  return <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8"><div className="mx-auto max-w-6xl">
    <a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a>
    <header className="mt-8 rounded-3xl border border-violet-200 bg-violet-50 p-6 sm:p-8"><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-900"><ShieldCheck className="size-4" />運営者専用・利用者には非公開</span><div className="mt-4 flex items-start gap-3"><BadgeJapaneseYen className="mt-1 size-7 shrink-0 text-violet-700" /><div><h1 className="text-3xl font-bold sm:text-4xl">有料版の料金案を比較</h1><p className="mt-3 text-sm leading-7 text-violet-950/70">無料10回から有料版へ進みやすく、運営費も管理しやすい3案を比較します。</p></div></div><p className="mt-5 rounded-2xl border border-violet-200 bg-white p-4 text-xs leading-6 text-violet-950/70">表示金額と回数は検討用の仮案です。「候補として保存」しても、利用者向け料金ページや決済には反映されません。</p></header>
    <PricingOptions />
    <CostCalculator />
    <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950"><h2 className="font-bold">現在のおすすめ</h2><p className="mt-1">初期は「1申請パック」が分かりやすく、無料版との差も説明しやすい案です。ただし正式決定前に、1回あたりの解析原価・決済手数料・問い合わせ対応時間を確認してください。</p><a href="/admin/decisions" className="mt-3 inline-flex rounded-xl bg-amber-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-950">正式な決定事項を入力する</a></section>
  </div></main>;
}
