import { env } from 'cloudflare:workers';
import { ArrowLeft, BookOpenCheck, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const sources = [
  { name: '公募要領', status: 'reflected', version: '第8版', published: '2026年7月21日', note: '第20回の基本チェックルールへ反映済みです。' },
  { name: '参考資料', status: 'waiting', version: '—', published: '—', note: '第20回版の公式公開を待っています。' },
  { name: '申請時によくある質問', status: 'waiting', version: '—', published: '—', note: '第20回版の公式公開を待っています。' },
  { name: '申請システム操作手引き', status: 'waiting', version: '—', published: '—', note: '第20回版の公式公開を待っています。' },
  { name: 'ガイドブック', status: 'waiting', version: '—', published: '—', note: '第20回版の公式公開を待っています。' },
] as const;

export default async function SourcesPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  const reflected = sources.filter((source) => source.status === 'reflected').length;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />管理画面に戻る
        </a>

        <header className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-900">
            <ShieldCheck className="size-4" />運営者専用
          </span>
          <div className="mt-4 flex items-start gap-3">
            <BookOpenCheck className="mt-1 size-7 shrink-0 text-teal-700" />
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">第20回 公式資料の確認状況</h1>
              <p className="mt-3 text-sm leading-7 text-teal-950/70">チェックルールの根拠にする公式資料だけを、公開状況とともに管理します。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-teal-200 bg-white p-4"><p className="text-xs font-bold text-teal-700">確認対象</p><p className="mt-1 text-2xl font-bold text-teal-950">{sources.length}種類</p></div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-4"><p className="text-xs font-bold text-emerald-700">反映済み</p><p className="mt-1 text-2xl font-bold text-emerald-900">{reflected}種類</p></div>
            <div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="text-xs font-bold text-amber-700">公開待ち</p><p className="mt-1 text-2xl font-bold text-amber-900">{sources.length - reflected}種類</p></div>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-900/70"><Clock3 className="size-4" />最終確認：2026年9月8日</p>
        </header>

        <section className="mt-7 space-y-4" aria-label="公式資料一覧">
          {sources.map((source) => {
            const done = source.status === 'reflected';
            return (
              <article key={source.name} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                      {done ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}{done ? '反映済み' : '公開待ち'}
                    </span>
                    <h2 className="mt-3 text-lg font-bold">{source.name}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{source.note}</p>
                  </div>
                  <dl className="grid min-w-44 grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                    <div><dt className="text-muted-foreground">版</dt><dd className="mt-1 font-bold">{source.version}</dd></div>
                    <div><dt className="text-muted-foreground">公開日</dt><dd className="mt-1 font-bold">{source.published}</dd></div>
                  </dl>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="font-bold text-amber-950">「公開待ち」の意味</h2>
          <p className="mt-2 text-sm leading-7 text-amber-950/75">第20回向けの対象資料が公式サイトでまだ公開されていない状態です。過去回の資料を第20回の正式ルールとして代用しません。公開後に内容を確認し、必要な差分だけチェックルールへ反映します。</p>
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <h2 className="font-bold">公式サイトで確認する</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="https://official.jizokukanb.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-xs font-bold text-white hover:bg-teal-800">商工会地区の公式サイト<ExternalLink className="size-4" /></a>
            <a href="https://r6.jizokukahojokin.info/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-xs font-bold text-teal-900 hover:bg-teal-50">商工会議所地区の公式サイト<ExternalLink className="size-4" /></a>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">新規公開や版の更新は毎日自動確認しています。変化があった場合だけ通知されます。</p>
        </section>
      </div>
    </main>
  );
}
