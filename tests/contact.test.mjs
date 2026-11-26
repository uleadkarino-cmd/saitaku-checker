import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

test('result feedback is saved after older inquiries leave the 24-hour window', async () => {
  const db = new DatabaseSync(':memory:');
  const source = (await readFile(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8'))
    .replace("import { env } from 'cloudflare:workers';", 'const env = globalThis.__contactTestEnv;');
  const wrap = (sql, values = []) => ({
    bind: (...args) => wrap(sql, args),
    first: async () => db.prepare(sql).get(...values),
    run: async () => db.prepare(sql).run(...values),
    sql,
  });
  globalThis.__contactTestEnv = { DB: {
    prepare: wrap,
    batch: async (statements) => statements.map(({ sql }) => db.exec(sql)),
  } };
  try {
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
    const { POST } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
    const send = () => POST(new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'oai-authenticated-user-id': 'visitor:test', 'content-type': 'application/json' },
      body: JSON.stringify({ replyEmail: 'test@example.com', category: 'チェック結果について', message: '経費明細の判定について確認をお願いします。' }),
    }));
    assert.equal((await send()).status, 200);
    const now = new Date();
    const oldTime = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE contact_inquiries SET created_at = ?').run(oldTime);
    for (let i = 0; i < 4; i++) {
      db.prepare('INSERT INTO contact_inquiries SELECT ?, user_id, login_email, reply_email, name, category, paid_features, message, diagnostics, created_at FROM contact_inquiries LIMIT 1').run(`old-${i}`);
    }
    for (let i = 0; i < 5; i++) assert.equal((await send()).status, 200);
    assert.equal((await send()).status, 429);
    assert.equal(db.prepare("SELECT count(*) AS total FROM contact_inquiries WHERE category = 'チェック結果について'").get().total, 10);
  } finally {
    db.close();
    delete globalThis.__contactTestEnv;
  }
});
