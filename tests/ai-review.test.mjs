import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleReview } from '../lib/ai-review.ts';
const input = { consent: true, program: '補助金', businessType: '法人', addons: [], plan: [{ title: '計画', text: '顧客への説明会を実施し販売を拡大します。' }], expenses: [{ category: '広報費', name: 'チラシ', amount: '10000' }] };
const request = (body = input, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/ai-review', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const report = { summary: '根拠を補いましょう。', findings: [{ topic: '市場', priority: 'high', evidence: '記載を確認できません', question: '顧客の要望は？', suggestion: '調査を追記', example: '【要確認】件の回答' }] };
test('未設定を通知しキーを返さない', async () => {
  const response = await handleReview(new Request('http://localhost:3000/api/ai-review'), {});
  assert.deepEqual(await response.json(), { configured: false, local: true });
  assert.equal((await handleReview(request(), {})).status, 503);
});
test('同意・空入力・不正JSON・サイズ・別origin・公開アクセスを拒否', async () => {
  const never = () => { throw new Error('Must not send'); };
  assert.equal((await handleReview(request({ ...input, consent: false }), {}, never)).status, 400);
  assert.equal((await handleReview(request({ ...input, plan: [] }), {}, never)).status, 400);
  assert.equal((await handleReview(request({ ...input, plan: [{ title: '計画', text: 'a'.repeat(160000) }] }), {}, never)).status, 413);
  assert.equal((await handleReview(request(input, 'https://evil.example'), {}, never)).status, 403);
  assert.equal((await handleReview(new Request('https://example.com/api/ai-review'), {}, never)).status, 401);
  const bad = new Request('http://localhost:3000/api/ai-review', { method: 'POST', headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handleReview(bad, {}, never)).status, 400);
});
test('実際のAPI形式で送信・構造化結果を返し、未許可フィールドを除外', async () => {
  let called = false;
  const response = await handleReview(request({ ...input, applicantName: 'PRIVATE NAME', email: 'private@example.com', files: ['secret.pdf'] }), { OPENAI_API_KEY: 'test-key' }, async (url, options) => {
    called = true;
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(body.text.format.type, 'json_schema');
    assert.ok(!body.input.includes('PRIVATE NAME'));
    assert.ok(!body.input.includes('private@example.com'));
    assert.ok(!body.input.includes('secret.pdf'));
    return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(report) }] }] });
  });
  assert.ok(called);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).report, report);
});
test('上流認証エラー・レート制限・不完全結果・タイムアウトを扱う', async () => {
  for (const status of [401, 429, 500]) {
    const response = await handleReview(request(), { OPENAI_API_KEY: 'secret' }, async () => new Response('secret provider details', { status }));
    assert.equal(response.status, status === 429 ? 429 : 502);
    assert.ok(!(await response.text()).includes('secret'));
  }
  for (const data of [{ status: 'incomplete' }, { status: 'completed', output: [] }, { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"summary":"x","findings":[]}' }] }] }]) {
    assert.equal((await handleReview(request(), { OPENAI_API_KEY: 'test' }, async () => Response.json(data))).status, 502);
  }
  const timed = await handleReview(request(), { OPENAI_API_KEY: 'test' }, async () => { throw new DOMException('timeout', 'TimeoutError'); });
  assert.match((await timed.json()).error, /タイムアウト/);
});
