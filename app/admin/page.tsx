import { env } from 'cloudflare:workers';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  Clock3,
  ClipboardCheck,
  Download,
  Gauge,
  Globe2,
  Inbox,
  Lightbulb,
  ListChecks,
  History,
  Mail,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { InquiryMemo } from './inquiry-memo';
import { InquiryStatus } from './inquiry-status';

export const dynamic = 'force-dynamic';

type Inquiry = {
  id: string;
  reply_email: string;
  name: string | null;
  category: string;
  paid_features: string | null;
  message: string;
  diagnostics: string | null;
  status: string;
  status_updated_at: string | null;
  admin_note: string | null;
  admin_note_updated_at: string | null;
  created_at: string;
};

type UsageSummary = {
  users: number;
  checks: number;
  limit_reached: number;
  active_today: number;
};

type RecentUsage = {
  email: string | null;
  checks_used: number;
  updated_at: string;
};

const tableSql = `CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  login_email TEXT,
  reply_email TEXT NOT NULL,
  name TEXT,
  category TEXT NOT NULL,
  paid_features TEXT,
  message TEXT NOT NULL,
  diagnostics TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  status_updated_at TEXT,
  admin_note TEXT,
  admin_note_updated_at TEXT,
  created_at TEXT NOT NULL
)`;

const usageTableSql = `CREATE TABLE IF NOT EXISTS checker_usage (
  user_id TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  checks_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

function parseFeatures(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : format(date, 'yyyy年M月d日（E） HH:mm', { locale: ja });
}

function maskEmail(value: string | null) {
  if (!value || !value.includes('@')) return 'メールアドレス未取得';
  const [name, domain] = value.split('@');
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'•'.repeat(Math.max(3, Math.min(8, name.length - visible.length)))}@${domain}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders
    .get('oai-authenticated-user-email')
    ?.trim()
    .toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  await env.DB.batch([env.DB.prepare(tableSql), env.DB.prepare(usageTableSql)]);
  const [result, usageSummary, recentUsageResult] = await Promise.all([
    env.DB.prepare(
      `SELECT id, reply_email, name, category, paid_features, message, diagnostics, status, status_updated_at, admin_note, admin_note_updated_at, created_at
       FROM contact_inquiries
       ORDER BY created_at DESC
       LIMIT 100`,
    ).all<Inquiry>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS users,
              COALESCE(SUM(checks_used), 0) AS checks,
              SUM(CASE WHEN checks_used >= 10 THEN 1 ELSE 0 END) AS limit_reached,
              SUM(CASE WHEN date(updated_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS active_today
       FROM checker_usage`,
    ).first<UsageSummary>(),
    env.DB.prepare(
      `SELECT email, checks_used, updated_at
       FROM checker_usage
       ORDER BY updated_at DESC
       LIMIT 5`,
    ).all<RecentUsage>(),
  ]);
  const inquiries = result.results || [];
  const recentUsage = recentUsageResult.results || [];
  const usage = {
    users: Number(usageSummary?.users || 0),
    checks: Number(usageSummary?.checks || 0),
    limitReached: Number(usageSummary?.limit_reached || 0),
    activeToday: Number(usageSummary?.active_today || 0),
  };
  const params = (await searchParams) || {};
  const selectedStatus = ['unread', 'working', 'replied'].includes(
    params.status || '',
  )
    ? String(params.status)
    : 'all';
  const keyword = String(params.q || '')
    .trim()
    .slice(0, 80);
  const normalizedKeyword = keyword.toLowerCase();
  const statusCounts = {
    all: inquiries.length,
    unread: inquiries.filter((item) => item.status === 'unread').length,
    working: inquiries.filter((item) => item.status === 'working').length,
    replied: inquiries.filter((item) => item.status === 'replied').length,
  };
  const visibleInquiries = inquiries.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus)
      return false;
    if (!normalizedKeyword) return true;
    return [
      item.name,
      item.reply_email,
      item.category,
      item.message,
      item.admin_note,
      item.id,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
  });
  const filters = [
    { value: 'all', label: 'すべて', count: statusCounts.all },
    { value: 'unread', label: '未対応', count: statusCounts.unread },
    { value: 'working', label: '対応中', count: statusCounts.working },
    { value: 'replied', label: '返信済み', count: statusCounts.replied },
  ];
  const exportQuery = new URLSearchParams();
  if (selectedStatus !== 'all') exportQuery.set('status', selectedStatus);
  if (keyword) exportQuery.set('q', keyword);
  const categoryRanking = Object.entries(
    inquiries.reduce<Record<string, number>>((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const featureRanking = Object.entries(
    inquiries.reduce<Record<string, number>>((counts, item) => {
      for (const feature of parseFeatures(item.paid_features)) {
        counts[feature] = (counts[feature] || 0) + 1;
      }
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = categoryRanking[0]?.[1] || 1;
  const maxFeatureCount = featureRanking[0]?.[1] || 1;
  const averageChecks = usage.users
    ? Math.round((usage.checks / usage.users) * 10) / 10
    : 0;
  const limitReachedRate = usage.users
    ? Math.round((usage.limitReached / usage.users) * 100)
    : 0;
  const unresolvedInquiries = statusCounts.unread + statusCounts.working;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          チェッカーに戻る
        </a>

        <header className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800">
                <ShieldCheck className="size-4" />
                運営者専用
              </span>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                お問い合わせ管理
              </h1>
              <p className="mt-3 text-sm leading-7 text-emerald-950/75">
                利用者から届いたお問い合わせを、新しい順に100件まで表示しています。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/admin/sources"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 text-xs font-bold text-teal-800 hover:bg-teal-100"
              >
                <BookOpenCheck className="size-4" />
                公式資料
              </a>
              <a
                href="/admin/changes"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
              >
                <History className="size-4" />
                変更履歴
              </a>
              <a
                href="/admin/quality"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-800 hover:bg-blue-100"
              >
                <ListChecks className="size-4" />
                品質テスト
              </a>
              <a
                href="/admin/release"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-xs font-bold text-indigo-800 hover:bg-indigo-100"
              >
                <ClipboardCheck className="size-4" />
                リリース準備
              </a>
              <a
                href="/admin/domain"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-xs font-bold text-sky-800 hover:bg-sky-100"
              >
                <Globe2 className="size-4" />
                本番ドメイン
              </a>
              <a
                href="/admin/decisions"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-bold text-violet-800 hover:bg-violet-100"
              >
                <ClipboardCheck className="size-4" />
                公開前の決定事項
              </a>
              <a
                href="/admin/legal"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-800 hover:bg-rose-100"
              >
                <ShieldCheck className="size-4" />
                法務確認
              </a>
              <a
                href="/admin/operations"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-800 hover:bg-blue-100"
              >
                <MessageSquareText className="size-4" />
                運用テスト
              </a>
              <a
                href="/admin/pricing"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                <WalletCards className="size-4" />
                料金案
              </a>
              <a href="/admin/payment" className="inline-flex h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-bold text-orange-900 hover:bg-orange-100"><WalletCards className="size-4" />決済準備</a>
              <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-center">
                <div className="text-3xl font-bold text-emerald-800">
                  {inquiries.length}
                </div>
                <div className="mt-1 text-xs font-bold text-muted-foreground">
                  表示中の件数
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-7 rounded-3xl border border-indigo-200 bg-indigo-50/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-indigo-950">
                <Activity className="size-5" />
                無料チェックの利用状況
              </h2>
              <p className="mt-1 text-xs leading-6 text-indigo-900/65">
                申請書の内容やPDFは保存せず、利用回数だけを集計しています。
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-800">
              無料上限 1人10回
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: Users,
                label: '利用者数',
                value: usage.users,
                unit: '人',
              },
              {
                icon: Gauge,
                label: 'チェック実行数',
                value: usage.checks,
                unit: '回',
              },
              {
                icon: Clock3,
                label: '本日の利用者',
                value: usage.activeToday,
                unit: '人',
              },
              {
                icon: Activity,
                label: '10回到達',
                value: usage.limitReached,
                unit: '人',
              },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div
                key={label}
                className="rounded-2xl border border-indigo-100 bg-white p-4"
              >
                <Icon className="size-4 text-indigo-700" />
                <div className="mt-3 text-2xl font-bold text-indigo-950">
                  {value}
                  <span className="ml-1 text-xs">{unit}</span>
                </div>
                <div className="mt-1 text-xs font-bold text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-indigo-100 bg-white/80 p-3">
              <p className="text-[11px] font-bold text-indigo-700">1人当たり平均</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">{averageChecks}回</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">継続して使われているかを見る目安です。</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-white/80 p-3">
              <p className="text-[11px] font-bold text-indigo-700">無料上限への到達率</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">{limitReachedRate}%</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">有料版を案内する時期の参考にします。</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-white/80 p-3">
              <p className="text-[11px] font-bold text-indigo-700">未完了の問い合わせ</p>
              <p className="mt-1 text-lg font-bold text-indigo-950">{unresolvedInquiries}件</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">未対応と対応中を合計した件数です。</p>
            </div>
          </div>
          {recentUsage.length > 0 && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-4">
              <h3 className="text-xs font-bold text-indigo-950">
                最近利用した方（5人まで）
              </h3>
              <div className="mt-3 divide-y divide-indigo-50">
                {recentUsage.map((item, index) => (
                  <div
                    key={`${item.email}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs first:pt-0 last:pb-0"
                  >
                    <span className="font-bold text-slate-700">
                      {maskEmail(item.email)}
                    </span>
                    <span className="text-muted-foreground">
                      {item.checks_used} / 10回・最終利用{' '}
                      {displayDate(item.updated_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-amber-950">
              <BarChart3 className="size-5" />
              問い合わせ・有料版ニーズの傾向
            </h2>
            <p className="mt-1 text-xs leading-6 text-amber-900/65">
              直近100件までの問い合わせを集計しています。件数が増えるほど、開発の優先順位を判断しやすくなります。
            </p>
          </div>
          {inquiries.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-amber-200 bg-white/70 p-6 text-center text-sm text-amber-900/70">
              問い合わせが届くと、ここに傾向が表示されます。
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-white p-5">
                <h3 className="text-sm font-bold text-amber-950">
                  問い合わせ種別
                </h3>
                <div className="mt-4 space-y-4">
                  {categoryRanking.map(([label, count]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-slate-700">
                          {label}
                        </span>
                        <span className="shrink-0 font-bold text-amber-900">
                          {count}件
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${Math.max(8, (count / maxCategoryCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                  <Lightbulb className="size-4" />
                  希望されている有料機能
                </h3>
                {featureRanking.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs leading-6 text-emerald-900/70">
                    有料機能の希望はまだ選択されていません。
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {featureRanking.map(([label, count], index) => (
                      <div key={label}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-700">
                            <span className="mr-2 text-emerald-700">
                              {index + 1}
                            </span>
                            {label}
                          </span>
                          <span className="shrink-0 font-bold text-emerald-800">
                            {count}件
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{
                              width: `${Math.max(8, (count / maxFeatureCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="mt-7 rounded-3xl border border-border bg-white p-5 shadow-[0_12px_40px_rgb(52_64_58/6%)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold">表示するお問い合わせ</h2>
            <a
              href={`/api/admin/inquiries/export${exportQuery.size ? `?${exportQuery.toString()}` : ''}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              <Download className="size-4" />
              表示中の一覧をCSV保存
            </a>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {filters.map((filter) => {
              const query = new URLSearchParams();
              if (filter.value !== 'all') query.set('status', filter.value);
              if (keyword) query.set('q', keyword);
              const active = selectedStatus === filter.value;
              return (
                <a
                  key={filter.value}
                  href={`/admin${query.size ? `?${query.toString()}` : ''}`}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-2xl border p-4 text-center transition ${active ? 'border-primary bg-primary text-white' : 'border-border bg-muted/25 hover:border-primary/40 hover:bg-primary/5'}`}
                >
                  <span className="block text-2xl font-bold">
                    {filter.count}
                  </span>
                  <span className="mt-1 block text-xs font-bold">
                    {filter.label}
                  </span>
                </a>
              );
            })}
          </div>
          <form
            action="/admin"
            method="get"
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            {selectedStatus !== 'all' && (
              <input type="hidden" name="status" value={selectedStatus} />
            )}
            <label className="relative flex-1">
              <span className="sr-only">お問い合わせを検索</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={keyword}
                placeholder="名前・メール・本文・受付番号で検索"
                className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <button
              type="submit"
              className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800"
            >
              検索する
            </button>
            {(keyword || selectedStatus !== 'all') && (
              <a
                href="/admin"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold hover:bg-muted"
              >
                絞り込みを解除
              </a>
            )}
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            {visibleInquiries.length}
            件を表示しています。対応状況を変更した後は、ページを開き直すと件数にも反映されます。
          </p>
        </section>

        {inquiries.length === 0 ? (
          <section className="mt-7 rounded-3xl border border-dashed border-border bg-white p-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold">
              お問い合わせはまだありません
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              送信されると、この画面に自動で追加されます。
            </p>
          </section>
        ) : visibleInquiries.length === 0 ? (
          <section className="mt-7 rounded-3xl border border-dashed border-border bg-white p-10 text-center">
            <Search className="mx-auto size-7 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">
              条件に合うお問い合わせがありません
            </h2>
            <a
              href="/admin"
              className="mt-4 inline-flex text-sm font-bold text-primary underline underline-offset-4"
            >
              すべて表示する
            </a>
          </section>
        ) : (
          <div className="mt-7 space-y-5">
            {visibleInquiries.map((inquiry) => {
              const features = parseFeatures(inquiry.paid_features);
              return (
                <article
                  key={inquiry.id}
                  className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_40px_rgb(52_64_58/6%)] sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                        {inquiry.category}
                      </span>
                      <p className="mt-3 text-xs text-muted-foreground">
                        受付：{displayDate(inquiry.created_at)}
                      </p>
                    </div>
                    <span className="rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                      受付番号 {inquiry.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <InquiryStatus
                    inquiryId={inquiry.id}
                    initialStatus={inquiry.status}
                    initialUpdatedAt={inquiry.status_updated_at}
                  />

                  <InquiryMemo
                    inquiryId={inquiry.id}
                    initialMemo={inquiry.admin_note || ''}
                    initialUpdatedAt={inquiry.admin_note_updated_at}
                  />

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
                      <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-muted-foreground">
                          お名前
                        </div>
                        <div className="mt-1 font-bold">
                          {inquiry.name || '未入力'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
                      <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-muted-foreground">
                          返信先
                        </div>
                        <a
                          className="mt-1 block break-all font-bold text-primary underline-offset-4 hover:underline"
                          href={`mailto:${inquiry.reply_email}`}
                        >
                          {inquiry.reply_email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <MessageSquareText className="size-4 text-primary" />
                      お問い合わせ内容
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                      {inquiry.message}
                    </p>
                  </div>

                  {features.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-muted-foreground">
                        希望する有料機能
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inquiry.diagnostics && (
                    <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                      <summary className="cursor-pointer font-bold">
                        不具合調査用の端末情報
                      </summary>
                      <p className="mt-3 whitespace-pre-wrap break-words leading-6">
                        {inquiry.diagnostics}
                      </p>
                    </details>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
          お問い合わせには個人情報が含まれる場合があります。この画面の内容を第三者に共有せず、返信や対応に必要な範囲で取り扱ってください。
        </p>
      </div>
    </main>
  );
}
