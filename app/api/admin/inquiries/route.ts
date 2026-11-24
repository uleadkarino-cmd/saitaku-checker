import { env } from 'cloudflare:workers';

const allowedStatuses = ['unread', 'working', 'replied'];

function isAdmin(request: Request) {
  const viewerEmail = request.headers
    .get('oai-authenticated-user-email')
    ?.trim()
    .toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(viewerEmail && adminEmail && viewerEmail === adminEmail);
}

export async function PATCH(request: Request) {
  if (!isAdmin(request))
    return Response.json({ error: 'not_found' }, { status: 404 });

  const body = (await request.json()) as {
    id?: string;
    status?: string;
    memo?: string;
  };
  const id = String(body.id || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  let result;
  if (typeof body.memo === 'string') {
    const memo = body.memo.trim().slice(0, 2000);
    result = await env.DB.prepare(
      'UPDATE contact_inquiries SET admin_note = ?, admin_note_updated_at = ? WHERE id = ?',
    )
      .bind(memo || null, updatedAt, id)
      .run();
  } else {
    const status = String(body.status || '').trim();
    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: 'invalid_input' }, { status: 400 });
    }
    result = await env.DB.prepare(
      'UPDATE contact_inquiries SET status = ?, status_updated_at = ? WHERE id = ?',
    )
      .bind(status, updatedAt, id)
      .run();
  }

  if (Number(result.meta.changes || 0) !== 1) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }
  return Response.json({ updated: true, updatedAt });
}
