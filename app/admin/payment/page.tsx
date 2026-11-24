import { env } from 'cloudflare:workers';
import { ArrowLeft, ShieldCheck, WalletCards } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PaymentChecklist } from './payment-checklist';

export const dynamic = 'force-dynamic';

export default async function PaymentPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();
  return <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8"><div className="mx-auto max-w-4xl"><a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a><header className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8"><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-900"><ShieldCheck className="size-4" />運営者専用</span><div className="mt-4 flex items-start gap-3"><WalletCards className="mt-1 size-7 shrink-0 text-amber-700" /><div><h1 className="text-3xl font-bold sm:text-4xl">決済導入チェック</h1><p className="mt-3 text-sm leading-7 text-amber-950/70">有料版の購入から利用権付与、返金まで、安全に提供するための確認項目です。</p></div></div><p className="mt-5 rounded-2xl border border-amber-200 bg-white p-4 text-xs leading-6 text-amber-950/70">この画面は決済を実装するものではありません。決済サービスの契約・接続は、料金と販売条件を正式決定した後に行います。</p></header><PaymentChecklist /></div></main>;
}
