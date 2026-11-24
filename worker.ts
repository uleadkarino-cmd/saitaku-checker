import handler from 'vinext/server/fetch-handler';

interface Member { email: string; passwordHash: string }
interface PrivateEnv extends Cloudflare.Env { PRIVATE_MEMBERS?: string; ASSETS?: Fetcher }

const encoder = new TextEncoder();
const guestCookie = '__Host-saitaku-visitor';
async function visitorIdentity(request: Request, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const cookies = (request.headers.get('cookie') || '').split(';').map(value => value.trim());
  const token = cookies.find(value => value.startsWith(`${guestCookie}=`))?.slice(guestCookie.length + 1) || '';
  const match = /^([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(token);
  if (match) {
    const signature = Uint8Array.from(match[2].match(/../g)!, value => parseInt(value, 16));
    if (await crypto.subtle.verify('HMAC', key, signature, encoder.encode(`visitor:${match[1]}`))) return { id: `visitor:${match[1]}`, cookie: null };
  }
  const id = crypto.randomUUID();
  const signature = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`visitor:${id}`))), value => value.toString(16).padStart(2, '0')).join('');
  return { id: `visitor:${id}`, cookie: `${guestCookie}=${id}.${signature}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000` };
}
const deny = () => new Response('ログインが必要です。指定されたIDとパスワードを入力してください。', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Saitaku private", charset="UTF-8"',
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export default {
  async fetch(request: Request, env: PrivateEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }
    let members: Record<string, Member>;
    try { members = JSON.parse(env.PRIVATE_MEMBERS || '{}'); }
    catch { return new Response('Authentication configuration unavailable', { status: 503 }); }
    const authorization = request.headers.get('authorization') || '';
    let username = '';
    let member: Member | undefined;
    if (authorization.startsWith('Basic ')) {
      try {
        const credentials = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(authorization.slice(6)), c => c.charCodeAt(0)));
        const separator = credentials.indexOf(':');
        if (separator > 0 && credentials.length <= 1024) {
          username = credentials.slice(0, separator);
          const candidate = Object.hasOwn(members, username) ? members[username] : undefined;
          const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(credentials.slice(separator + 1)))), b => b.toString(16).padStart(2, '0')).join('');
          const expected = candidate?.passwordHash || '0'.repeat(64);
          let difference = hash.length ^ expected.length;
          for (let i = 0; i < 64; i++) difference |= hash.charCodeAt(i) ^ expected.charCodeAt(i);
          if (candidate && difference === 0) member = candidate;
        }
      } catch { /* Invalid credentials never establish a member identity. */ }
    }
    if (/^\/(?:api\/)?admin(?:\/|$)/.test(url.pathname) && !member) return deny();

    const headers = new Headers(request.headers);
    for (const name of [...headers.keys()]) {
      if (name.startsWith('oai-authenticated-user-')) headers.delete(name);
    }
    headers.delete('authorization');
    let cookie: string | null = null;
    if (member) {
      headers.set('oai-authenticated-user-id', `private:${username}`);
      headers.set('oai-authenticated-user-email', member.email);
    } else {
      if (!env.PRIVATE_MEMBERS) return new Response('Visitor configuration unavailable', { status: 503 });
      const visitor = await visitorIdentity(request, env.PRIVATE_MEMBERS);
      headers.set('oai-authenticated-user-id', visitor.id);
      cookie = visitor.cookie;
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      if (request.headers.get('origin') !== new URL(request.url).origin) {
        return new Response('Forbidden', { status: 403 });
      }
    }
    const verifiedRequest = new Request(request, { headers });
    let result: Response | undefined;
    if (env.ASSETS && ['GET', 'HEAD'].includes(request.method)) {
      const asset = await env.ASSETS.fetch(verifiedRequest);
      if (asset.status !== 404) result = asset;
    }
    const finalResult: Response = result ?? await handler.fetch(verifiedRequest, env, ctx);
    const response = new Response(finalResult.body, finalResult);
    if (cookie) response.headers.append('Set-Cookie', cookie);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'same-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
    return response;
  },
};
