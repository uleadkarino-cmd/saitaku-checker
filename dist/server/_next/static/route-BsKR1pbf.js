import{env as e}from"cloudflare:workers";var t=`CREATE TABLE IF NOT EXISTS contact_inquiries (
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
)`,n=`CREATE INDEX IF NOT EXISTS idx_contact_inquiries_user_created ON contact_inquiries (user_id, created_at)`,r=[`操作方法について`,`チェック結果について`,`料金・購入について`,`不具合の報告`,`その他`];async function i(i){let a=i.headers.get(`oai-authenticated-user-id`),o=i.headers.get(`oai-authenticated-user-email`);if(!a)return Response.json({error:`signin_required`},{status:401});let s=await i.json(),c=String(s.replyEmail||``).trim().slice(0,254),l=String(s.name||``).trim().slice(0,100),u=r.includes(String(s.category))?String(s.category):`その他`,d=String(s.message||``).trim().slice(0,4e3),f=Array.isArray(s.paidFeatures)?s.paidFeatures.map(String).slice(0,8):[],p=s.diagnostics?String(s.diagnostics).slice(0,1e3):null;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)||d.length<10)return Response.json({error:`invalid_input`},{status:400});await e.DB.batch([e.DB.prepare(t),e.DB.prepare(n)]);let m=await e.DB.prepare(`SELECT COUNT(*) AS count FROM contact_inquiries WHERE user_id = ? AND created_at >= datetime('now', '-1 day')`).bind(a).first();if(Number(m?.count||0)>=5)return Response.json({error:`too_many_requests`},{status:429});let h=crypto.randomUUID(),g=new Date().toISOString();return await e.DB.prepare(`INSERT INTO contact_inquiries (id, user_id, login_email, reply_email, name, category, paid_features, message, diagnostics, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(h,a,o,c,l||null,u,JSON.stringify(f),d,p,g).run(),Response.json({accepted:!0,reference:h.slice(0,8).toUpperCase()})}export{i as POST};