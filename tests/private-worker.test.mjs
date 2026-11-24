import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ts from 'typescript';
const source = (await readFile(new URL('../worker.ts', import.meta.url), 'utf8')).replace("import handler from 'vinext/server/fetch-handler';", `const handler = { fetch: async request => Response.json({ id: request.headers.get('oai-authenticated-user-id'), email: request.headers.get('oai-authenticated-user-email'), authorization: request.headers.get('authorization') }) };`);
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const worker = (await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)).default;
const env = { PRIVATE_MEMBERS: JSON.stringify({ owner: { email: 'owner@example.com', passwordHash: createHash('sha256').update('test-password').digest('hex') } }) };
const auth = 'Basic ' + Buffer.from('owner:test-password').toString('base64');
test('plain HTTP redirects to HTTPS before challenging for credentials', async () => {
  const response = await worker.fetch(new Request('http://example.com/private'), env, {});
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://example.com/private');
  assert.equal(response.headers.get('www-authenticate'), null);
});
test('admin pages and APIs require credentials even when configuration is missing', async () => {
  for (const path of ['/admin', '/admin/quality', '/api/admin/inquiries', '/api/admin/inquiries/export']) assert.equal((await worker.fetch(new Request('https://example.com' + path), env, {})).status, 401);
  assert.equal((await worker.fetch(new Request('https://example.com/admin', { headers: { authorization: auth } }), {}, {})).status, 401);
});
test('incorrect credentials and malformed credentials deny access', async () => {
  for (const value of ['Basic invalid', 'Basic ' + Buffer.from('owner:wrong').toString('base64'), 'Basic ' + Buffer.from('__proto__:wrong').toString('base64')]) assert.equal((await worker.fetch(new Request('https://example.com/admin', { headers: { authorization: value } }), env, {})).status, 401);
});

test('public visitors can access the app and keep a signed browser identity', async () => {
  const first = await worker.fetch(new Request('https://example.com', { headers: { 'oai-authenticated-user-id': 'spoof', 'oai-authenticated-user-email': 'owner@example.com' } }), env, {});
  assert.equal(first.status, 200);
  const identity = await first.json();
  assert.match(identity.id, /^visitor:/);
  assert.equal(identity.email, null);
  const cookie = first.headers.get('set-cookie');
  assert.match(cookie, /Secure; HttpOnly; SameSite=Lax/);
  const next = await worker.fetch(new Request('https://example.com/api/quota', { headers: { cookie: cookie.split(';')[0] } }), env, {});
  assert.equal((await next.json()).id, identity.id);
  assert.equal(next.headers.get('set-cookie'), null);
  const tampered = await worker.fetch(new Request('https://example.com/api/quota', { headers: { cookie: cookie.split(';')[0].replace(/.$/, c => c === '0' ? '1' : '0') } }), env, {});
  assert.notEqual((await tampered.json()).id, identity.id);
});
test('verified member identity replaces spoofed identity and credentials are stripped', async () => {
  const response = await worker.fetch(new Request('https://example.com', { headers: { authorization: auth, 'oai-authenticated-user-id': 'spoof', 'oai-authenticated-user-email': 'spoof@example.com' } }), env, {});
  assert.deepEqual(await response.json(), { id: 'private:owner', email: 'owner@example.com', authorization: null });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('writes require a same-origin request', async () => {
  for (const origin of [undefined, 'https://attacker.example']) {
    assert.equal((await worker.fetch(new Request('https://example.com/api/quota', { method: 'POST', headers: { authorization: auth, ...(origin ? { origin } : {}) } }), env, {})).status, 403);
  }
  assert.equal((await worker.fetch(new Request('https://example.com/api/quota', { method: 'POST', headers: { authorization: auth, origin: 'https://example.com' } }), env, {})).status, 200);
});
