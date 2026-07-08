function fmtDate(ts){ return new Date(ts).toLocaleDateString("pt-BR"); }
function fmtDl(s){
  if(!s) return null;
  const [y,m,d]=s.split("-");
  return `${d}/${m}/${y}`;
}
function isOverdue(dl,st){
  if(!dl||st==="concluido") return false;
  const t=new Date(); t.setHours(0,0,0,0);
  return new Date(dl+"T00:00:00")<t;
}
// Get permitted screen IDs for a session
function getUserScreens(session, roles){
  if(session.role==="admin") return SCREENS.map(s=>s.id);
  const role=roles.find(r=>r.id===session.roleId) || roles.find(r=>r.id==="role-user");
  return role ? role.permissions : ["form","mine"];
}
