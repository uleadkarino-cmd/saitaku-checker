import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const config = JSON.parse(await readFile('cloudflare.deploy.json', 'utf8'));
const auth = await readFile(join(process.env.APPDATA, 'xdg.config', '.wrangler', 'config', 'default.toml'), 'utf8');
const token = auth.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Wrangler authentication is required');
const now = Date.now();
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/workers/observability/telemetry/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ queryId: crypto.randomUUID(), view: 'events', limit: 100, timeframe: { from: now - 24 * 60 * 60 * 1000, to: now }, parameters: { datasets: [config.name] } }),
});
const data = await response.json();
if (!response.ok || !data.success) { console.log(JSON.stringify({ status: response.status, errors: data.errors })); process.exitCode = 1; }
else {
  await mkdir('outputs/access-logs', { recursive: true });
  const result = data.result;
  console.log(JSON.stringify({ keys: Object.keys(result), count: result.events?.count, eventsShape: result.events ? Object.keys(result.events) : [], firstEventShape: result.events?.events?.[0] ? Object.keys(result.events.events[0]) : [] }));
  const events = result.events?.events || [];
  const rows = events.map(event => {
    const source = event.source || {};
    const workers = source.$workers || event.$workers || {};
    const request = workers.event?.request || source.request || {};
    const metadata = event.$metadata || source.$metadata || {};
    return { timestamp: event.timestamp || source.timestamp || metadata.timestamp, service: metadata.service || workers.scriptName, method: request.method, url: request.url, status: workers.event?.response?.status, outcome: workers.outcome, type: metadata.type, message: metadata.message };
  });
  await writeFile('outputs/access-logs/latest.json', JSON.stringify(rows, null, 2));
  console.log(JSON.stringify(rows));
}
