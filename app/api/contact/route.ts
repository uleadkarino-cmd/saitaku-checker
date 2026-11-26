import { env } from 'cloudflare:workers';

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
  created_at TEXT NOT NULL
)`;
const indexSql =
  'CREATE INDEX IF NOT EXISTS idx_contact_inquiries_user_created ON contact_inquiries (user_id, created_at)';
const categories = [
  '操作方法について',
  'チェック結果について',
  '料金・購入について',
  '不具合の報告',
  'その他',
];

export async function POST(request: Request) {
  const userId = request.headers.get('oai-authenticated-user-id');
  const loginEmail = request.headers.get('oai-authenticated-user-email');
  if (!userId)
    return Response.json({ error: 'signin_required' }, { status: 401 });

  const body = (await request.json()) as {
    replyEmail?: string;
    name?: string;
    category?: string;
    paidFeatures?: string[];
    message?: string;
    diagnostics?: string | null;
  };
  const replyEmail = String(body.replyEmail || '')
    .trim()
    .slice(0, 254);
  const name = String(body.name || '')
    .trim()
    .slice(0, 100);
  const category = categories.includes(String(body.category))
    ? String(body.category)
    : 'その他';
  const message = String(body.message || '')
    .trim()
    .slice(0, 4000);
  const paidFeatures = Array.isArray(body.paidFeatures)
    ? body.paidFeatures.map(String).slice(0, 8)
    : [];
  const diagnostics = body.diagnostics
    ? String(body.diagnostics).slice(0, 1000)
    : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail) || message.length < 10)
    return Response.json({ error: 'invalid_input' }, { status: 400 });

  await env.DB.batch([env.DB.prepare(tableSql), env.DB.prepare(indexSql)]);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM contact_inquiries WHERE user_id = ? AND julianday(created_at) >= julianday('now', '-1 day')",
  )
    .bind(userId)
    .first<{ count: number }>();
  if (Number(recent?.count || 0) >= 5)
    return Response.json({ error: 'too_many_requests' }, { status: 429 });

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO contact_inquiries (id, user_id, login_email, reply_email, name, category, paid_features, message, diagnostics, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      id,
      userId,
      loginEmail,
      replyEmail,
      name || null,
      category,
      JSON.stringify(paidFeatures),
      message,
      diagnostics,
      createdAt,
    )
    .run();
  return Response.json({
    accepted: true,
    reference: id.slice(0, 8).toUpperCase(),
  });
}
