import { env } from 'cloudflare:workers';
import { ArrowLeft, CheckCircle2, CircleDashed, Clock3, Globe2, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DomainManager } from './domain-manager';

export const dynamic = 'force-dynamic';

const steps = [
  { phase: '今できる', title: '本番ドメインを決めて取得', note: '候補を決め、第三者に取得される前に確保します。取得しても、まだ一般公開にはなりません。', status: 'ready' },
  { phase: '今できる', title: '運営者情報と連絡先を確定', note: '利用規約・プライバシーポリシー・特定商取引法表記に掲載する内容を揃えます。', status: 'review' },
  { phase: '公開前', title: '実書類テストを完了', note: '品質テスト8項目を、それぞれ3事業者以上の実例で確認します。', status: 'review' },
  { phase: '公開前', title: '法務・料金・決済を確定', note: '専門家確認、料金、利用期間、返金条件、購入後の利用権を確定します。', status: 'todo' },
  { phase: '最後', title: 'ドメイン接続と公開確認', note: 'DNSとSSLを接続し、主要ページ・フォーム・決済を確認して一般公開します。', status: 'todo' },
] as const;

export default async function DomainPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a>

        <header className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-900"><ShieldCheck className="size-4" />運営者専用</span>
          <div className="mt-4 flex items-start gap-3">
            <Globe2 className="mt-1 size-7 shrink-0 text-sky-700" />
            <div><h1 className="text-3xl font-bold sm:text-4xl">本番ドメイン移行の準備</h1><p className="mt-3 text-sm leading-7 text-sky-950/70">取得から一般公開までの順序と、現在の目安を確認できます。</p></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-200 bg-white p-4"><p className="text-xs font-bold text-sky-700">ドメイン接続まで</p><p className="mt-1 text-2xl font-bold text-sky-950">約5〜10日</p><p className="mt-1 text-xs text-muted-foreground">外部確認の日数により変動します</p></div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-4"><p className="text-xs font-bold text-emerald-700">ドメイン取得</p><p className="mt-1 text-2xl font-bold text-emerald-900">今から可能</p><p className="mt-1 text-xs text-muted-foreground">取得だけでは公開されません</p></div>
          </div>
        </header>

        <DomainManager />

        <section className="mt-7 space-y-4" aria-label="本番ドメイン移行手順">
          {steps.map((step, index) => {
            const Icon = step.status === 'ready' ? CheckCircle2 : step.status === 'review' ? Clock3 : CircleDashed;
            const style = step.status === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : step.status === 'review' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-100 text-slate-700';
            return (
              <article key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white p-5 sm:p-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-700 text-sm font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style}`}><Icon className="size-3.5" />{step.phase}</span><h2 className="font-bold">{step.title}</h2></div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.note}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <h2 className="font-bold">現在の判断</h2>
          <p className="mt-1">希望する名前が決まっている場合は、ドメインだけ先に取得するのがおすすめです。接続と一般公開は、実書類テスト・法務確認・料金と決済の準備が整ってから行います。</p>
        </section>
      </div>
    </main>
  );
}
