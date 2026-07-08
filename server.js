const http = require("http");
const fs   = require("fs");
const path = require("path");

let nodemailer;
try { nodemailer = require("nodemailer"); }
catch { console.warn("⚠️  nodemailer não instalado. Rode: npm install"); }

const PORT        = process.env.PORT || 3000;
// No Render o disco persistente fica em /var/data; localmente usa a pasta do projeto
const DATA_DIR    = process.env.RENDER ? "/var/data" : __dirname;
const DB_FILE     = path.join(DATA_DIR, "db.json");
const CONFIG_FILE = path.join(DATA_DIR, "email-config.json");
const COMPILED    = path.join(__dirname, ".compiled.html");
const SOURCE      = path.join(__dirname, "index.html");

// ── Database helpers ──────────────────────────────────────────
// Garante que a pasta de dados existe
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); }
  catch(e) { console.warn("Não foi possível criar DATA_DIR, usando pasta do projeto:", e.message); }
}
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE,"utf8")); }
  catch { return {ti_users:[],ti_tickets:[],ti_roles:[],ti_assets:[],ti_seq:0}; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2),"utf8");
}
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const enc = p => { try{return btoa(unescape(encodeURIComponent(p)));}catch{return p;} };
    writeDB({
      ti_users: [{
        id:"admin-1", name:"Administrador", email:"admin@ti.local",
        password:enc("admin123"), role:"admin", roleId:"role-admin",
        company:"", createdAt:Date.now()
      }],
      ti_tickets: [],
      ti_roles: [
        {id:"role-admin",name:"Administrador",permissions:["form","dashboard","patrimonio","mine"],emailNotif:true, isSystem:true,color:"purple"},
        {id:"role-user", name:"Padrão",       permissions:["form","mine"],                        emailNotif:false,isSystem:true,color:"blue"},
      ],
      ti_assets: [],
      ti_seq: 0
    });
    console.log("✅ Banco de dados criado (db.json)");
  }
}
initDB();

// ── Misc helpers ──────────────────────────────────────────────
const MIME = {
  ".html":"text/html; charset=utf-8",".css":"text/css",
  ".js":"application/javascript",".json":"application/json",
  ".png":"image/png",".jpg":"image/jpeg",".ico":"image/x-icon",
};
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}
function json(res, code, data) {
  cors(res); res.writeHead(code,{"Content-Type":"application/json"}); res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise((res,rej)=>{
    let b=""; req.on("data",c=>b+=c);
    req.on("end",()=>{try{res(JSON.parse(b));}catch{res({});}});
    req.on("error",rej);
  });
}
function serveIndex(res) {
  const file = fs.existsSync(COMPILED) ? COMPILED : SOURCE;
  cors(res); res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"});
  res.end(fs.readFileSync(file,"utf8"));
}
function readEmailConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE,"utf8")); } catch { return {enabled:false}; }
}
function writeEmailConfig(cfg) { fs.writeFileSync(CONFIG_FILE,JSON.stringify(cfg,null,2),"utf8"); }
function createTransport(cfg) {
  return nodemailer.createTransport({host:cfg.host,port:cfg.port,secure:cfg.secure,auth:{user:cfg.user,pass:cfg.pass}});
}

// ── Email templates ───────────────────────────────────────────
function buildNewTicketHTML(ticket) {
  const icons={internet:"🌐",notebook:"💻",monitor:"🖥️",infra:"🔧",outro:"📋"};
  const pc={critica:"#DC2626",alta:"#EA580C",media:"#D97706",baixa:"#16A34A"};
  const pl={critica:"Crítica",alta:"Alta",media:"Média",baixa:"Baixa"};
  const cl={internet:"Internet / Rede",notebook:"Notebook / PC",monitor:"Monitor / Tela",infra:"Infraestrutura",outro:"Outro"};
  const c=pc[ticket.priority]||"#64748B";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0F1924;border-radius:12px 12px 0 0;padding:24px 32px"><span style="font-size:18px;font-weight:600;color:#fff">🎧 TI Chamados</span><p style="color:rgba(255,255,255,.5);font-size:13px;margin:4px 0 0">Novo chamado registrado</p></td></tr>
<tr><td style="background:#fff;padding:28px 32px">
<h2 style="margin:0 0 4px;font-size:20px;color:#1E293B">${ticket.id}</h2>
<span style="display:inline-block;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:600;background:${c}22;color:${c};margin-bottom:20px">⚡ ${pl[ticket.priority]||ticket.priority}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:20px">
<tr style="background:#F8FAFC"><td style="padding:10px 16px;font-size:12px;color:#94A3B8;width:40%">CAMPO</td><td style="padding:10px 16px;font-size:12px;color:#94A3B8">INFORMAÇÃO</td></tr>
<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">👤 Solicitante</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${ticket.userName}</td></tr>
<tr style="border-top:1px solid #E2E8F0;background:#F8FAFC"><td style="padding:10px 16px;font-size:13px;color:#64748B">${icons[ticket.category]||"📋"} Categoria</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${cl[ticket.category]||ticket.category}</td></tr>
${ticket.assetTag?`<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">🏷️ Patrimônio</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500;font-family:monospace">${ticket.assetTag}</td></tr>`:""}
<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">📅 Aberto em</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${new Date(ticket.createdAt).toLocaleString("pt-BR")}</td></tr>
</table>
<div style="background:#F8FAFC;border-radius:8px;padding:16px;border:1px solid #E2E8F0"><p style="font-size:12px;color:#94A3B8;margin:0 0 8px">📝 DESCRIÇÃO</p><p style="font-size:14px;color:#1E293B;line-height:1.6;margin:0">${ticket.description.replace(/\n/g,"<br>")}</p></div>
</td></tr>
<tr><td style="background:#F1F5F9;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center"><p style="font-size:12px;color:#94A3B8;margin:0">E-mail automático — TI Chamados</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildConfirmHTML(ticket) {
  const cl={internet:"Internet / Rede",notebook:"Notebook / PC",monitor:"Monitor / Tela",infra:"Infraestrutura",outro:"Outro"};
  const pc={critica:"#DC2626",alta:"#EA580C",media:"#D97706",baixa:"#16A34A"};
  const pl={critica:"Crítica",alta:"Alta",media:"Média",baixa:"Baixa"};
  const c=pc[ticket.priority]||"#64748B";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0F1924;border-radius:12px 12px 0 0;padding:24px 32px"><span style="font-size:18px;font-weight:600;color:#fff">🎧 TI Chamados</span><p style="color:rgba(255,255,255,.5);font-size:13px;margin:4px 0 0">Confirmação de abertura de chamado</p></td></tr>
<tr><td style="background:#fff;padding:28px 32px">
<p style="font-size:14px;color:#64748B;margin:0 0 6px">Olá, <strong>${ticket.userName}</strong>!</p>
<h2 style="font-size:20px;color:#1E293B;margin:0 0 16px">Seu chamado foi aberto com sucesso</h2>
<div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:16px 20px;margin-bottom:20px">
<p style="font-size:12px;color:#15803D;font-weight:500;text-transform:uppercase;margin:0 0 4px">Protocolo do chamado</p>
<p style="font-size:26px;font-weight:700;color:#15803D;font-family:monospace;margin:0;letter-spacing:3px">${ticket.id}</p>
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:20px">
<tr style="background:#F8FAFC"><td style="padding:10px 16px;font-size:12px;color:#94A3B8;width:40%">CAMPO</td><td style="padding:10px 16px;font-size:12px;color:#94A3B8">INFORMAÇÃO</td></tr>
<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">📂 Categoria</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${cl[ticket.category]||ticket.category}</td></tr>
<tr style="border-top:1px solid #E2E8F0;background:#F8FAFC"><td style="padding:10px 16px;font-size:13px;color:#64748B">⚡ Prioridade</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:${c}">${pl[ticket.priority]||ticket.priority}</td></tr>
${ticket.assetTag?`<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">🏷️ Patrimônio</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-family:monospace">${ticket.assetTag}</td></tr>`:""}
</table>
<div style="background:#F8FAFC;border-radius:8px;padding:14px 16px;border:1px solid #E2E8F0"><p style="font-size:11px;color:#94A3B8;font-weight:500;text-transform:uppercase;margin:0 0 6px">Sua solicitação</p><p style="font-size:13px;color:#64748B;line-height:1.6;margin:0">${ticket.description.replace(/\n/g,"<br>")}</p></div>
</td></tr>
<tr><td style="background:#F1F5F9;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center"><p style="font-size:12px;color:#94A3B8;margin:0">Guarde o protocolo <strong>${ticket.id}</strong> — você receberá atualizações por e-mail.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildReplyHTML(ticket, updates) {
  const stLabel={aguardando:"Aguardando Análise",andamento:"Em Andamento",concluido:"Concluído"};
  const stColor={aguardando:"#D97706",andamento:"#0284C7",concluido:"#16A34A"};
  const stBg   ={aguardando:"#FEF3C7",andamento:"#E0F2FE",concluido:"#DCFCE7"};
  const prioLabel={critica:"Crítica",alta:"Alta",media:"Média",baixa:"Baixa"};
  const catLabel ={internet:"Internet / Rede",notebook:"Notebook / PC",monitor:"Monitor / Tela",infra:"Infraestrutura",outro:"Outro"};
  const sc=stColor[updates.status]||"#64748B";
  const sb=stBg[updates.status]||"#F1F5F9";
  const sl=stLabel[updates.status]||updates.status;
  const fmtDl=s=>{if(!s)return null;const[y,m,d]=s.split("-");return`${d}/${m}/${y}`;};
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0F1924;border-radius:12px 12px 0 0;padding:24px 32px"><span style="font-size:18px;font-weight:600;color:#fff">🎧 TI Chamados</span><p style="color:rgba(255,255,255,.5);font-size:13px;margin:4px 0 0">Atualização no seu chamado</p></td></tr>
<tr><td style="background:#fff;padding:28px 32px">
<p style="font-size:14px;color:#64748B;margin:0 0 6px">Olá, <strong>${ticket.userName}</strong>!</p>
<h2 style="font-size:20px;color:#1E293B;margin:0 0 16px">Seu chamado foi atualizado</h2>
<div style="display:inline-block;padding:6px 16px;border-radius:100px;background:${sb};color:${sc};font-size:13px;font-weight:600;margin-bottom:20px">${updates.status==="concluido"?"✅":"🔄"} ${sl}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:20px">
<tr style="background:#F8FAFC"><td style="padding:10px 16px;font-size:12px;color:#94A3B8;width:40%">CAMPO</td><td style="padding:10px 16px;font-size:12px;color:#94A3B8">INFORMAÇÃO</td></tr>
<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">🎫 Protocolo</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:700;font-family:monospace">${ticket.id}</td></tr>
<tr style="border-top:1px solid #E2E8F0;background:#F8FAFC"><td style="padding:10px 16px;font-size:13px;color:#64748B">📂 Categoria</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${catLabel[ticket.category]||ticket.category}</td></tr>
<tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 16px;font-size:13px;color:#64748B">⚡ Prioridade</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${prioLabel[updates.priority]||updates.priority}</td></tr>
${updates.deadline?`<tr style="border-top:1px solid #E2E8F0;background:#F8FAFC"><td style="padding:10px 16px;font-size:13px;color:#64748B">📅 Prazo</td><td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:500">${fmtDl(updates.deadline)}</td></tr>`:""}
</table>
<div style="background:#F8FAFC;border-radius:8px;padding:14px 16px;border:1px solid #E2E8F0${updates.adminNotes?";margin-bottom:16px":""}">
<p style="font-size:11px;color:#94A3B8;font-weight:500;text-transform:uppercase;margin:0 0 6px">Sua solicitação</p>
<p style="font-size:13px;color:#64748B;line-height:1.6;margin:0">${ticket.description.replace(/\n/g,"<br>")}</p>
</div>
${updates.adminNotes?`<div style="background:#EFF6FF;border-radius:8px;padding:14px 16px;border:1px solid #BFDBFE"><p style="font-size:11px;color:#1D4ED8;font-weight:600;text-transform:uppercase;margin:0 0 6px">💬 Resposta do técnico</p><p style="font-size:14px;color:#1E3A5F;line-height:1.6;margin:0">${updates.adminNotes.replace(/\n/g,"<br>")}</p></div>`:""}
</td></tr>
<tr><td style="background:#F1F5F9;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center"><p style="font-size:12px;color:#94A3B8;margin:0">Protocolo: <strong>${ticket.id}</strong> — E-mail automático TI Chamados</p></td></tr>
</table></td></tr></table></body></html>`;
}

// ── HTTP Server ───────────────────────────────────────────────
const server = http.createServer(async(req,res)=>{
  if(req.method==="OPTIONS"){cors(res);res.writeHead(204);res.end();return;}
  const url=req.url.split("?")[0];

  // Serve page
  if(url==="/"||url==="/index.html"){serveIndex(res);return;}

  // ── Database API ────────────────────────────────────────────
  if(req.method==="GET"&&url==="/api/db"){
    return json(res,200,readDB());
  }
  if(req.method==="POST"&&url==="/api/db"){
    const body=await readBody(req);
    const db=readDB();
    const updated={...db,...body};
    writeDB(updated);
    return json(res,200,{ok:true});
  }

  // ── E-mail config ───────────────────────────────────────────
  if(req.method==="GET"&&url==="/api/email-config"){
    const cfg=readEmailConfig();
    return json(res,200,{...cfg,pass:cfg.pass?"••••••••":""});
  }
  if(req.method==="POST"&&url==="/api/email-config"){
    const body=await readBody(req);
    const cur=readEmailConfig();
    const upd={...cur,...body};
    if(body.pass==="••••••••")upd.pass=cur.pass;
    writeEmailConfig(upd);
    return json(res,200,{ok:true});
  }
  if(req.method==="POST"&&url==="/api/email-test"){
    if(!nodemailer)return json(res,500,{ok:false,error:"Rode: npm install"});
    const cfg=readEmailConfig();
    if(!cfg.user||!cfg.pass)return json(res,400,{ok:false,error:"Configure SMTP primeiro."});
    try{await createTransport(cfg).verify();return json(res,200,{ok:true});}
    catch(e){return json(res,500,{ok:false,error:e.message});}
  }

  // ── Novo chamado → admins ───────────────────────────────────
  if(req.method==="POST"&&url==="/api/send-email"){
    if(!nodemailer)return json(res,500,{ok:false,error:"nodemailer não instalado."});
    const cfg=readEmailConfig();
    if(!cfg.enabled)return json(res,200,{ok:true,skipped:true});
    if(!cfg.user||!cfg.pass)return json(res,400,{ok:false,error:"SMTP não configurado."});
    const{to,ticket}=await readBody(req);
    if(!to||!to.length)return json(res,200,{ok:true,skipped:true});
    try{
      await createTransport(cfg).sendMail({from:cfg.from||cfg.user,to:to.join(", "),
        subject:`[TI Chamados] ${ticket.id} – ${ticket.userName} – ${ticket.description.slice(0,50)}...`,
        html:buildNewTicketHTML(ticket)});
      console.log(`📧 Novo chamado → ${to.join(", ")} (${ticket.id})`);
      return json(res,200,{ok:true,sent:to.length});
    }catch(e){console.error("Erro e-mail:",e.message);return json(res,500,{ok:false,error:e.message});}
  }

  // ── Confirmação → solicitante ───────────────────────────────
  if(req.method==="POST"&&url==="/api/send-ticket-confirm"){
    if(!nodemailer)return json(res,500,{ok:false,error:"nodemailer não instalado."});
    const cfg=readEmailConfig();
    if(!cfg.enabled)return json(res,200,{ok:true,skipped:true});
    if(!cfg.user||!cfg.pass)return json(res,400,{ok:false,error:"SMTP não configurado."});
    const{ticket}=await readBody(req);
    if(!ticket||!ticket.userEmail)return json(res,200,{ok:true,skipped:true});
    try{
      await createTransport(cfg).sendMail({from:cfg.from||cfg.user,to:ticket.userEmail,
        subject:`[TI Chamados] ${ticket.id} – Chamado aberto com sucesso`,
        html:buildConfirmHTML(ticket)});
      console.log(`📧 Confirmação → ${ticket.userEmail} (${ticket.id})`);
      return json(res,200,{ok:true});
    }catch(e){console.error("Erro e-mail confirm:",e.message);return json(res,500,{ok:false,error:e.message});}
  }

  // ── Atualização → solicitante ───────────────────────────────
  if(req.method==="POST"&&url==="/api/send-ticket-update"){
    if(!nodemailer)return json(res,500,{ok:false,error:"nodemailer não instalado."});
    const cfg=readEmailConfig();
    if(!cfg.enabled)return json(res,200,{ok:true,skipped:true});
    if(!cfg.user||!cfg.pass)return json(res,400,{ok:false,error:"SMTP não configurado."});
    const{ticket,updates}=await readBody(req);
    if(!ticket||!ticket.userEmail)return json(res,200,{ok:true,skipped:true});
    const stLabel={aguardando:"Aguardando Análise",andamento:"Em Andamento",concluido:"Concluído"};
    try{
      await createTransport(cfg).sendMail({from:cfg.from||cfg.user,to:ticket.userEmail,
        subject:`[TI Chamados] ${ticket.id} – ${stLabel[updates.status]||updates.status}`,
        html:buildReplyHTML(ticket,updates)});
      console.log(`📧 Resposta → ${ticket.userEmail} (${ticket.id})`);
      return json(res,200,{ok:true});
    }catch(e){console.error("Erro e-mail resposta:",e.message);return json(res,500,{ok:false,error:e.message});}
  }

  // ── Static files ────────────────────────────────────────────
  const filePath=path.join(__dirname,url);
  fs.readFile(filePath,(err,data)=>{
    if(err){res.writeHead(404);res.end("404");return;}
    const type=MIME[path.extname(filePath)]||"text/plain";
    cors(res); res.writeHead(200,{"Content-Type":type}); res.end(data);
  });
});

server.listen(PORT,()=>{
  const ready=fs.existsSync(COMPILED);
  console.log("╔══════════════════════════════════════╗");
  console.log("║   ✅  Sistema de Chamados TI         ║");
  console.log(`║   🌐  http://localhost:${PORT}           ║`);
  console.log(ready?"║   ⚡  Versão compilada              ║":"║   ⚠️   Rode: node build.js            ║");
  console.log("║   Ctrl+C para encerrar               ║");
  console.log("╚══════════════════════════════════════╝");
});
