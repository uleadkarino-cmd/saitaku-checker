import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const config = JSON.parse(await readFile('cloudflare.deploy.json', 'utf8'));
const auth = await readFile(join(process.env.APPDATA, 'xdg.config', '.wrangler', 'config', 'default.toml'), 'utf8');
const token = auth.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Wrangler authentication is required');
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/workers/subdomain`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
let response = await fetch(endpoint, { headers });
let data = await response.json();
if (!data.success || !data.result?.subdomain) {
  response = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify({ subdomain: 'saitaku-karino' }) });
  data = await response.json();
}
if (!data.success) throw new Error(JSON.stringify(data.errors));
console.log(`https://${config.name}.${data.result.subdomain}.workers.dev`);
const deployment = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/workers/scripts/${config.name}/subdomain`, { headers });
const state = await deployment.json();
console.log(JSON.stringify({ success: state.success, routing: state.result, errors: state.errors }));
