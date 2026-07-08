// ── Storage helpers ──────────────────────────────────────────
const ls = {
  get:(k,d)=>{ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):d; }catch{ return d; } },
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  del:(k)=>localStorage.removeItem(k),
};
const ss = {
  get:(k,d)=>{ try{ const v=sessionStorage.getItem(k); return v!==null?JSON.parse(v):d; }catch{ return d; } },
  set:(k,v)=>sessionStorage.setItem(k,JSON.stringify(v)),
  del:(k)=>sessionStorage.removeItem(k),
};

// ── ID generators ────────────────────────────────────────────
function genUserId()  { return "u-"  +Date.now()+Math.random().toString(36).slice(2,6); }
function genRoleId()  { return "r-"  +Date.now()+Math.random().toString(36).slice(2,6); }
function genAssetId() { return "a-"  +Date.now()+Math.random().toString(36).slice(2,5); }
function genTicketId(){
  const n=parseInt(ls.get("ti_seq",0))+1;
  ls.set("ti_seq",n);
  return "TI-"+String(n).padStart(4,"0");
}

// ── Password obfuscation (lightweight, not cryptographic) ────
function encodePass(p){ return btoa(unescape(encodeURIComponent(p))); }
function decodePass(p){ try{ return decodeURIComponent(escape(atob(p))); }catch{ return p; } }

// ── Initialise data on first run ─────────────────────────────
function initData(){
  // Roles
  let roles = ls.get("ti_roles",[]);
  if(roles.length===0){ roles=JSON.parse(JSON.stringify(DEFAULT_ROLES)); ls.set("ti_roles",roles); }

  // Users
  let users = ls.get("ti_users",[]);
  if(users.length===0){
    users=[{
      id:"admin-1", name:"Administrador", email:"admin@ti.local",
      password:encodePass("admin123"), role:"admin", roleId:"role-admin",
      company:"", createdAt:Date.now(),
    }];
    ls.set("ti_users",users);
  }
  return { users, roles };
}

// ── Session resolution (tab + persistent) ────────────────────
function resolveSession(){
  const ps=ls.get("ti_persist_session",null);
  if(ps && ps.expiresAt && Date.now()<ps.expiresAt) return ps;
  ls.del("ti_persist_session");
  return ss.get("ti_session",null);
}
