import { env } from 'cloudflare:workers';
import { ArrowLeft, MessagesSquare, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { OperationsChecklist } from './operations-checklist';

export const dynamic = 'force-dynamic';

export default async function OperationsPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  return <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8"><div className="mx-auto max-w-4xl">
    <a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a>
    <header className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8"><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900"><ShieldCheck className="size-4" />運営者専用</span><div className="mt-4 flex items-start gap-3"><MessagesSquare className="mt-1 size-7 shrink-0 text-blue-700" /><div><h1 className="text-3xl font-bold sm:text-4xl">お問い合わせ運用テスト</h1><p className="mt-3 text-sm leading-7 text-blue-950/70">利用者からの送信を受け取り、返信済みにするまでを1件通して確認します。</p></div></div><p className="mt-5 rounded-2xl border border-blue-200 bg-white p-4 text-xs leading-6 text-blue-950/70">テスト送信であることが分かる件名・本文を使い、実在する第三者の個人情報は入力しないでください。</p></header>
    <OperationsChecklist />
  </div></main>;
}
