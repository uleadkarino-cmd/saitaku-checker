import { randomBytes, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const [action, username = 'owner', email = 'ulead.karino@gmail.com'] = process.argv.slice(2);
const directory = resolve('outputs/cloudflare-private');
const credentialPath = resolve(directory, 'members.json');
await mkdir(directory, { recursive: true });
let members;
try { members = JSON.parse(await readFile(credentialPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; members = {}; }
if (action === 'add') {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid username or email');
  members[username] = { email, password: randomBytes(24).toString('base64url') };
  await writeFile(credentialPath, JSON.stringify(members, null, 2), { mode: 0o600 });
  await writeFile(resolve(directory, `${username}-login.txt`), `サイタク！限定公開 ログイン情報\n\nURL: https://saitaku-checker.saitaku-karino.workers.dev/\nユーザー名: ${username}\nパスワード: ${members[username].password}\nメール: ${email}\n\nこのファイルを渡す相手だけがログインできます。\n`, { mode: 0o600 });
  console.log(`Login details saved in outputs/cloudflare-private/${username}-login.txt`);
} else if (action === 'sync') {
  if (!Object.keys(members).length) throw new Error('No members configured');
  const secret = Object.fromEntries(Object.entries(members).map(([name, member]) => [name, {
    email: member.email,
    passwordHash: createHash('sha256').update(member.password).digest('hex'),
  }]));
  const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'secret', 'put', 'PRIVATE_MEMBERS', '--config', 'cloudflare.deploy.json'], { stdio: ['pipe', 'inherit', 'inherit'], windowsHide: true });
  child.stdin.end(JSON.stringify(secret));
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  if (code !== 0) process.exit(code || 1);
} else throw new Error('Use: node scripts/private-members.mjs add <username> <email> OR sync');
