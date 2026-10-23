// Secrets are server-side Vercel environment variables, never browser assets.
const buckets=new Map();
module.exports=async function handler(req,res){
  const reply=(code,ok)=>res.status(code).json({ok});res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,false)}
  const allowed=new Set(['https://np-agency.com.ua','https://www.np-agency.com.ua']);
  if(process.env.VERCEL_URL)allowed.add('https://'+process.env.VERCEL_URL);
  if(!allowed.has(req.headers.origin))return reply(403,false);
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return reply(415,false);
  let body=req.body;try{if(typeof body==='string'){if(Buffer.byteLength(body)>12000)return reply(413,false);body=JSON.parse(body)}}catch{return reply(400,false)}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,false);
  if(Buffer.byteLength(JSON.stringify(body))>12000)return reply(413,false);
  const valid=(v,min,max)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max;
  if(body.website)return reply(400,false);
  if(!valid(body.name,1,80)||!valid(body.contact,3,160)||!valid(body.message,1,2000)||!['sites','promotion','ai','unsure'].includes(body.service)||body.consent!=='on'||!['uk','en'].includes(body.lang)||!valid(body.page,1,120)||!/^\/(?:en(?:\/|$))?(?:(?:sites|promotion|ai)(?:\.html)?|index\.html)?$/.test(body.page))return reply(400,false);
  const token=process.env.TELEGRAM_BOT_TOKEN,chat=process.env.TELEGRAM_CHAT_ID;
  if(!token||!chat||!/^-[0-9]+$|^[0-9]+$/.test(chat))return reply(503,false);
  // Best-effort per-instance burst guard; use Vercel Firewall for distributed limits.
  const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  for(const [key,val] of buckets)if(now-val.start>60000)buckets.delete(key);
  const bucket=buckets.get(ip)||{start:now,count:0};if(bucket.count>=3){res.setHeader('Retry-After','60');return reply(429,false)}bucket.count++;buckets.set(ip,bucket);
  const services={sites:'Створення сайту',promotion:'Просування',ai:'AI-автоматизація',unsure:'Потрібна консультація'};
  const clean=s=>s.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
  const text=`Нова заявка · N&P Agency\nПослуга: ${services[body.service]}\nІм’я: ${clean(body.name)}\nКонтакт: ${clean(body.contact)}\nМова: ${body.lang}\nСторінка: ${body.page}\n\n${clean(body.message)}`;
  try{const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(10000)});const result=await response.json();if(!response.ok||!result.ok)return reply(502,false);return reply(200,true)}catch{return reply(502,false)}
};
