function App(){
  const init   = initData();
  const [users,   setUsers]   = React.useState(()=>ls.get("ti_users",   init.users));
  const [roles,   setRoles]   = React.useState(()=>ls.get("ti_roles",   init.roles));
  const [tickets, setTickets] = React.useState(()=>ls.get("ti_tickets", []));
  const [assets,  setAssets]  = React.useState(()=>ls.get("ti_assets",  []));
  const [session, setSession] = React.useState(()=>resolveSession());
  const [authView,setAuthView]= React.useState("login");
  const [view,    setView]    = React.useState("form");
  const [toast,   setToast]   = React.useState(null);
  const h = React.createElement;

  const showToast = (msg,icon="ti-check",color="var(--green)") => {
    setToast({msg,icon,color});
    setTimeout(()=>setToast(null),3000);
  };

  // ── Auth handlers ────────────────────────────────────────
  const login = (u) => {
    const s={id:u.id,name:u.name,email:u.email,role:u.role,roleId:u.roleId};
    setSession(s); ss.set("ti_session",s);
    setView(u.role==="admin"?"dashboard":"form");
  };
  const logout = () => {
    setSession(null); ss.del("ti_session"); ls.del("ti_persist_session");
    setAuthView("login");
  };
  const register = u => {
    const up=[...users,u]; setUsers(up); ls.set("ti_users",up);
    setAuthView("login");
  };

  // ── Ticket handlers ──────────────────────────────────────
  const submitTicket = form => {
    const id=genTicketId();
    const t={id,createdAt:Date.now(),status:"aguardando",deadline:null,adminNotes:"",
      userId:session.id,userEmail:session.email,...form};
    const up=[...tickets,t]; setTickets(up); ls.set("ti_tickets",up); return id;
  };
  const updateTicket = (id,updates) => {
    const up=tickets.map(t=>t.id===id?{...t,...updates,updatedAt:Date.now()}:t);
    setTickets(up); ls.set("ti_tickets",up);
  };

  // ── User handlers ────────────────────────────────────────
  const userAction = (id,role) => {
    const up=users.map(u=>u.id===id?{...u,role}:u);
    setUsers(up); ls.set("ti_users",up);
  };
  const deleteUser = id => {
    const up=users.filter(u=>u.id!==id); setUsers(up); ls.set("ti_users",up);
  };
  const changeRole = (userId,roleId) => {
    const up=users.map(u=>u.id===userId?{...u,roleId}:u);
    setUsers(up); ls.set("ti_users",up);
  };

  // ── Role handlers ────────────────────────────────────────
  const saveRole = role => {
    const up=roles.find(r=>r.id===role.id)?roles.map(r=>r.id===role.id?role:r):[...roles,role];
    setRoles(up); ls.set("ti_roles",up);
  };
  const deleteRole = id => {
    // Reassign users with this role to default
    const updatedUsers=users.map(u=>u.roleId===id?{...u,roleId:"role-user"}:u);
    setUsers(updatedUsers); ls.set("ti_users",updatedUsers);
    const up=roles.filter(r=>r.id!==id); setRoles(up); ls.set("ti_roles",up);
  };

  // ── Asset handlers ───────────────────────────────────────
  const saveAsset = asset => {
    const up=assets.find(a=>a.id===asset.id)?assets.map(a=>a.id===asset.id?asset:a):[...assets,asset];
    setAssets(up); ls.set("ti_assets",up);
  };
  const deleteAsset = id => {
    const up=assets.filter(a=>a.id!==id); setAssets(up); ls.set("ti_assets",up);
  };

  // ── Export / Import ──────────────────────────────────────
  const exportData = () => {
    const data={exportedAt:new Date().toISOString(),tickets,assets,roles,
      users:users.map(({password,...u})=>u)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`chamados-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast("Backup exportado com sucesso!");
  };
  const importData = e => {
    const file=e.target.files[0]; if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.tickets||!data.users) throw new Error();
        const merged=data.users.map(u=>{
          const ex=users.find(x=>x.id===u.id);
          return ex?{...u,password:ex.password}:{...u,password:encodePass("trocar123")};
        });
        setTickets(data.tickets);         ls.set("ti_tickets",data.tickets);
        setUsers(merged);                 ls.set("ti_users",merged);
        if(data.assets){setAssets(data.assets);ls.set("ti_assets",data.assets);}
        if(data.roles){
          const merged2=[...DEFAULT_ROLES,...(data.roles||[]).filter(r=>!r.isSystem)];
          setRoles(merged2); ls.set("ti_roles",merged2);
        }
        showToast(`Importado: ${data.tickets.length} chamados, ${merged.length} usuários`);
      }catch{ showToast("Arquivo inválido","ti-alert-circle","var(--red)"); }
    };
    r.readAsText(file); e.target.value="";
  };

  // ── Not logged in ────────────────────────────────────────
  if(!session) return authView==="login"
    ? h(LoginScreen,{users,onLogin:login,onGoRegister:()=>setAuthView("register")})
    : h(RegisterScreen,{users,roles,onRegister:register,onGoLogin:()=>setAuthView("login")});

  // Sync session role if admin changed it
  const liveUser=users.find(u=>u.id===session.id);
  if(liveUser&&(liveUser.role!==session.role||liveUser.roleId!==session.roleId)){
    const s={...session,role:liveUser.role,roleId:liveUser.roleId};
    setSession(s); ss.set("ti_session",s);
  }

  if(session.role==="pending")  return h(PendingScreen, {session,onLogout:logout});
  if(session.role==="rejected") return h(RejectedScreen,{session,onLogout:logout});

  const isAdmin      = session.role==="admin";
  const permScreens  = getUserScreens(session, roles);
  const pendingCount = users.filter(u=>u.role==="pending").length;

  // Build nav
  const allNavItems = [
    {id:"form",       label:"Novo Chamado",      icon:"ti-plus"},
    {id:"dashboard",  label:"Painel de Chamados", icon:"ti-layout-dashboard"},
    {id:"patrimonio", label:"Patrimônio",         icon:"ti-devices"},
    {id:"mine",       label:"Meus Chamados",      icon:"ti-ticket"},
  ];
  const navItems = [
    ...allNavItems.filter(n=>permScreens.includes(n.id)),
    ...(isAdmin ? [{id:"users",label:"Usuários",icon:"ti-users",badge:pendingCount},{id:"cargos",label:"Cargos",icon:"ti-shield"}] : []),
  ];

  // Ensure current view is accessible
  React.useEffect(()=>{
    const accessible=navItems.map(n=>n.id);
    if(!accessible.includes(view)) setView(navItems[0]?.id||"form");
  },[session.role, session.roleId]);

  const pageInfo = {
    form:      {title:"Novo Chamado",       desc:"Preencha o formulário para abrir um chamado"},
    dashboard: {title:"Painel de Chamados", desc:`${tickets.length} chamado${tickets.length!==1?"s":""} no sistema`},
    patrimonio:{title:"Patrimônio",         desc:`${assets.filter(a=>a.type==="notebook").length} notebooks · ${assets.filter(a=>a.type==="monitor").length} monitores`},
    mine:      {title:"Meus Chamados",      desc:`${tickets.filter(t=>t.userId===session.id).length} chamados abertos`},
    users:     {title:"Gestão de Usuários", desc:pendingCount>0?`${pendingCount} solicitação${pendingCount>1?"ões":""} aguardando`:"Gerencie usuários"},
    cargos:    {title:"Cargos",             desc:`${roles.length} cargo${roles.length!==1?"s":""} configurados`},
  };

  return h("div",null,
    // Navbar
    h("nav",{className:"navbar"},
      h("div",{className:"navbar-brand"},h("i",{className:"ti ti-headset"}),"TI Chamados"),
      h("div",{className:"navbar-nav"},
        navItems.map(v=>h("div",{key:v.id,className:`nav-link${view===v.id?" active":""}`,onClick:()=>setView(v.id)},
          h("i",{className:`ti ${v.icon}`}),v.label,
          v.badge>0&&h("span",{className:"nav-badge"},v.badge)
        ))
      ),
      h("div",{className:"navbar-right"},
        isAdmin&&h("div",{style:{display:"flex",gap:6,alignItems:"center"}},
          h("button",{className:"btn-navbar",onClick:exportData,title:"Exportar dados"},
            h("i",{className:"ti ti-download"}),"Exportar"),
          h("label",{className:"btn-navbar",title:"Importar backup"},
            h("i",{className:"ti ti-upload"}),"Importar",
            h("input",{type:"file",accept:".json",onChange:importData,style:{display:"none"}})),
          h("div",{className:"navbar-divider"})
        ),
        h("div",{className:"navbar-user"},
          h("div",{className:"navbar-avatar"},h("i",{className:"ti ti-user"})),
          h("span",{className:"navbar-username"},session.name),
          h("span",{className:"navbar-role"},isAdmin?"Admin":roles.find(r=>r.id===session.roleId)?.name||"Usuário")
        ),
        h("button",{className:"navbar-logout",onClick:logout,title:"Sair"},h("i",{className:"ti ti-logout"}))
      )
    ),

    // Page header
    h("div",{className:"page-header"},
      h("div",{className:"page-header-inner"},
        h("h2",null,pageInfo[view]?.title),
        h("p",null,pageInfo[view]?.desc)
      )
    ),

    // Page body
    h("div",{className:"page-body"},
      view==="form"       && h(NewTicketForm,{session,onSubmit:submitTicket}),
      view==="dashboard"  && isAdmin && h(AdminDashboard,{tickets,onUpdate:updateTicket}),
      view==="patrimonio" && h(AssetManagement,{assets,users,onSave:saveAsset,onDelete:deleteAsset}),
      view==="mine"       && h(MyTickets,{tickets,session}),
      view==="users"      && isAdmin && h(UserManagement,{users,roles,currentUser:session,
        onApprove:id=>userAction(id,"user"),
        onReject: id=>userAction(id,"rejected"),
        onPromote:id=>userAction(id,"admin"),
        onDemote: id=>userAction(id,"user"),
        onDelete:deleteUser,
        onChangeRole:changeRole}),
      view==="cargos"     && isAdmin && h(RoleManagement,{roles,onSave:saveRole,onDelete:deleteRole})
    ),

    // Toast
    toast&&h(Toast,{msg:toast.msg,icon:toast.icon,color:toast.color})
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
