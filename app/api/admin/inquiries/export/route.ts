import { env } from 'cloudflare:workers';

type Inquiry = {
  id: string;
  reply_email: string;
  name: string | null;
  category: string;
  paid_features: string | null;
  message: string;
  status: string;
  status_updated_at: string | null;
  admin_note: string | null;
  admin_note_updated_at: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  unread: '未対応',
  working: '対応中',
  replied: '返信済み',
};

function isAdmin(request: Request) {
  const viewerEmail = request.headers
    .get('oai-authenticated-user-email')
    ?.trim()
    .toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(viewerEmail && adminEmail && viewerEmail === adminEmail);
}

function safeCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function parseFeatures(value: string | null) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).join('、') : '';
  } catch {
    return '';
  }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return new Response('Not Found', { status: 404 });

  const url = new URL(request.url);
  const selectedStatus = ['unread', 'working', 'replied'].includes(
    url.searchParams.get('status') || '',
  )
    ? String(url.searchParams.get('status'))
    : 'all';
  const keyword = String(url.searchParams.get('q') || '')
    .trim()
    .slice(0, 80)
    .toLowerCase();

  const result = await env.DB.prepare(
    `SELECT id, reply_email, name, category, paid_features, message, status, status_updated_at, admin_note, admin_note_updated_at, created_at
     FROM contact_inquiries
     ORDER BY created_at DESC
     LIMIT 100`,
  ).all<Inquiry>();
  const rows = (result.results || []).filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus)
      return false;
    if (!keyword) return true;
    return [
      item.name,
      item.reply_email,
      item.category,
      item.message,
      item.admin_note,
      item.id,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const header = [
    '受付日時',
    '受付番号',
    '対応状況',
    '状況更新日時',
    '種別',
    'お名前',
    '返信先メールアドレス',
    'お問い合わせ内容',
    '希望する有料機能',
    '運営者メモ',
    'メモ更新日時',
  ];
  const csvRows = rows.map((item) => [
    item.created_at,
    item.id.slice(0, 8).toUpperCase(),
    statusLabels[item.status] || item.status,
    item.status_updated_at,
    item.category,
    item.name,
    item.reply_email,
    item.message,
    parseFeatures(item.paid_features),
    item.admin_note,
    item.admin_note_updated_at,
  ]);
  const csv = `\uFEFF${[header, ...csvRows].map((row) => row.map(safeCell).join(',')).join('\r\n')}`;
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="saitaku-inquiries-${date}.csv"`,
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
