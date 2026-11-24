import { env } from 'cloudflare:workers';
import { AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { LegalProgress } from './legal-progress';

export const dynamic = 'force-dynamic';

const documents = [
  {
    name: '利用規約', href: '/terms', status: '草案あり',
    checks: ['無料版・有料版の提供範囲が実際の機能と一致しているか', '採択や書類の完全性を保証しない旨が明確か', '利用停止・禁止事項・免責の範囲が適切か'],
    ask: '免責、損害賠償の上限、準拠法・管轄、未成年利用の扱い',
  },
  {
    name: 'プライバシーポリシー', href: '/privacy', status: '草案あり',
    checks: ['PDF・入力文章・お問い合わせで保存範囲が異なることを説明しているか', '利用目的、保存期間、削除方法、第三者提供を説明しているか', '解析サービスや決済を追加した際の委託先・送信先を反映できるか'],
    ask: '個人情報保護法上の表現、外部送信規律、開示・削除請求の窓口',
  },
  {
    name: '特定商取引法に基づく表記', href: '/commercial-transactions', status: '要情報確定',
    checks: ['販売事業者、責任者、所在地、連絡先が確定しているか', '価格以外の費用、支払時期、提供時期を記載しているか', 'キャンセル・返金条件と動作不良時の対応を記載しているか'],
    ask: '個人運営の場合の氏名・住所・電話番号の表示方法と、省略表示の可否',
  },
] as const;

export default async function LegalPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin/release" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />リリース準備に戻る</a>

        <header className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-900"><ShieldCheck className="size-4" />運営者専用</span>
          <div className="mt-4 flex items-start gap-3"><FileCheck2 className="mt-1 size-7 shrink-0 text-rose-700" /><div><h1 className="text-3xl font-bold sm:text-4xl">法務確認リスト</h1><p className="mt-3 text-sm leading-7 text-rose-950/70">一般公開前に、草案と実際の機能・販売条件が一致しているか確認します。</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-200 bg-white p-4"><p className="text-xs font-bold text-rose-700">対象文書</p><p className="mt-1 text-2xl font-bold text-rose-950">3ページ</p></div>
            <div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="text-xs font-bold text-amber-700">現在の状態</p><p className="mt-1 text-lg font-bold text-amber-950">草案・要確認</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-600">公開条件</p><p className="mt-1 text-lg font-bold text-slate-900">専門家確認を推奨</p></div>
          </div>
        </header>

        <LegalProgress />

        <section className="mt-7 space-y-5" aria-label="法務文書一覧">
          {documents.map((document) => (
            <article key={document.name} className="rounded-3xl border border-border bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-emerald-700" /><div><span className="text-[11px] font-bold text-amber-800">{document.status}</span><h2 className="text-lg font-bold">{document.name}</h2></div></div>
                <a href={document.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-900 hover:bg-rose-100">現在のページを開く<ExternalLink className="size-4" /></a>
              </div>
              <h3 className="mt-5 text-sm font-bold">掲載前に確認すること</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">{document.checks.map((check) => <li key={check} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" />{check}</li>)}</ul>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-950">専門家へ確認する内容</p><p className="mt-1 text-xs leading-6 text-amber-950/75">{document.ask}</p></div>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          <h2 className="flex items-center gap-2 font-bold text-slate-950"><AlertTriangle className="size-5" />確認時の注意</h2>
          <p className="mt-1">この画面は確認漏れを防ぐための整理であり、法律上の適法性を保証するものではありません。料金・決済・データ送信先が確定した後、公開直前の内容を専門家へ確認してください。</p>
          <a href="/admin/decisions" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">未決定事項を確認する</a>
        </section>
      </div>
    </main>
  );
}
