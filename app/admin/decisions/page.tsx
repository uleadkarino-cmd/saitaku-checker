import { env } from 'cloudflare:workers';
import { ArrowLeft, ClipboardList, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DecisionManager } from './decision-manager';

export const dynamic = 'force-dynamic';

export default async function DecisionsPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a>
        <header className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-900"><ShieldCheck className="size-4" />運営者専用</span>
          <div className="mt-4 flex items-start gap-3"><ClipboardList className="mt-1 size-7 shrink-0 text-indigo-700" /><div><h1 className="text-3xl font-bold sm:text-4xl">公開前に決めること</h1><p className="mt-3 text-sm leading-7 text-indigo-950/70">有料販売と法務確認に必要な情報を、決まったものから記録できます。</p></div></div>
          <p className="mt-5 rounded-2xl border border-indigo-200 bg-white p-4 text-xs leading-6 text-indigo-950/70">入力内容はこの端末のブラウザ内だけに保存され、サイト運営側のデータベースには送信されません。正式掲載前に専門家へ確認してください。</p>
        </header>
        <DecisionManager />
      </div>
    </main>
  );
}
