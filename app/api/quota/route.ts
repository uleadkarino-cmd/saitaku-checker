import { env } from 'cloudflare:workers';

const limit = 10;
const schemaSql = `CREATE TABLE IF NOT EXISTS checker_usage (
  user_id TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  checks_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

const currentUser = (request: Request) => ({
  id: request.headers.get('oai-authenticated-user-id'),
  email: request.headers.get('oai-authenticated-user-email'),
});

const ensureSchema = async () => {
  await env.DB.prepare(schemaSql).run();
};

export async function GET(request: Request) {
  const user = currentUser(request);
  if (!user.id)
    return Response.json(
      { authenticated: false, limit, used: 0, remaining: 0 },
      { status: 401 },
    );
  await ensureSchema();
  const row = await env.DB.prepare(
    'SELECT checks_used FROM checker_usage WHERE user_id = ?',
  )
    .bind(user.id)
    .first<{ checks_used: number }>();
  const used = Math.min(limit, Math.max(0, Number(row?.checks_used || 0)));
  return Response.json({
    authenticated: true,
    email: user.email,
    limit,
    used,
    remaining: limit - used,
  });
}

export async function POST(request: Request) {
  const user = currentUser(request);
  if (!user.id)
    return Response.json(
      {
        authenticated: false,
        error: 'signin_required',
        limit,
        used: 0,
        remaining: 0,
      },
      { status: 401 },
    );
  await ensureSchema();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO checker_usage (user_id, email, checks_used, created_at, updated_at) VALUES (?, ?, 0, ?, ?)',
  )
    .bind(user.id, user.email, now, now)
    .run();
  const update = await env.DB.prepare(
    'UPDATE checker_usage SET checks_used = checks_used + 1, email = ?, updated_at = ? WHERE user_id = ? AND checks_used < ?',
  )
    .bind(user.email, now, user.id, limit)
    .run();
  const row = await env.DB.prepare(
    'SELECT checks_used FROM checker_usage WHERE user_id = ?',
  )
    .bind(user.id)
    .first<{ checks_used: number }>();
  const used = Math.min(limit, Math.max(0, Number(row?.checks_used || 0)));
  return Response.json(
    {
      authenticated: true,
      email: user.email,
      limit,
      used,
      remaining: limit - used,
      accepted: Number(update.meta.changes || 0) > 0,
    },
    { status: Number(update.meta.changes || 0) > 0 ? 200 : 429 },
  );
}
