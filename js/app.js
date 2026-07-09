function App(){
  // Estados iniciais vazios (serão preenchidos pelo banco)
  window.encodePass = p => { try{return btoa(unescape(encodeURIComponent(p)));}catch{return p;} };
  window.decodePass = p => { try{return decodeURIComponent(escape(atob(p)));}catch{return p;} };
  const [users,   setUsers]   = React.useState([]);
  const [roles,   setRoles]   = React.useState([]);
  const [tickets, setTickets] = React.useState([]);
  const [assets,  setAssets]  = React.useState([]);
  const [session, setSession] = React.useState(()=>resolveSession());
  const [authView,setAuthView]= React.useState("login");
  const [view,    setView]    = React.useState("form");
  const [toast,   setToast]   = React.useState(null);
  
  // Novo estado de carregamento do banco de dados
  const [loadingDB, setLoadingDB] = React.useState(true);
  const h = React.createElement;

  // ── Sincronização com o Servidor (Banco de Dados) ────────
  React.useEffect(() => {
    fetch('/api/db')
      .then(res => res.json())
      .then(data => {
        if(data.ti_users) setUsers(data.ti_users);
        if(data.ti_roles) setRoles(data.ti_roles);
        if(data.ti_tickets) setTickets(data.ti_tickets);
        if(data.ti_assets) setAssets(data.ti_assets);
        setLoadingDB(false);
      })
      .catch(err => {
        console.error("Erro ao conectar no banco:", err);
        showToast("Erro ao conectar no servidor", "ti-alert-circle", "var(--red)");
        setLoadingDB(false);
      });
  }, []);

  const saveToDB = (key, data) => {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: data })
    }).catch(err => console.error("Erro ao salvar no banco:", err));
  };

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
    const up=[...users,u]; setUsers(up); 
    saveToDB("ti_users", up); // Salva no servidor
    setAuthView("login");
  };

  // ── Ticket handlers ──────────────────────────────────────
  const submitTicket = form => {
    const id=genTicketId();
    const t={id,createdAt:Date.now(),status:"aguardando",deadline:null,adminNotes:"",
      userId:session.id,userEmail:session.email,...form};
    
    setTickets(currentTickets => {
      const up = [...currentTickets, t];
      saveToDB("ti_tickets", up); // Salva no servidor
      return up;
    });
    return id;
  };

  const updateTicket = (id,updates) => {
    setTickets(currentTickets => {
      const up = currentTickets.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t);
      saveToDB("ti_tickets", up); // Salva no servidor
      return up;
    });
  };

  // ── User handlers ────────────────────────────────────────
  const userAction = (id,role) => {
    const up=users.map(u=>u.id===id?{...u,role}:u);
    setUsers(up); saveToDB("ti_users", up);
  };
  const deleteUser = id => {
    const up=users.filter(u=>u.id!==id); setUsers(up); saveToDB("ti_users", up);
  };
  const changeRole = (userId,roleId) => {
    const up=users.map(u=>u.id===userId?{...u,roleId}:u);
    setUsers(up); saveToDB("ti_users", up);
  };

  // ── Role handlers ────────────────────────────────────────
  const saveRole = role => {
    const up=roles.find(r=>r.id===role.id)?roles.map(r=>r.id===role.id?role:r):[...roles,role];
    setRoles(up); saveToDB("ti_roles", up);
  };
  const deleteRole = id => {
    const updatedUsers=users.map(u=>u.roleId===id?{...u,roleId:"role-user"}:u);
    setUsers(updatedUsers); saveToDB("ti_users", updatedUsers);
    const up=roles.filter(r=>r.id!==id); setRoles(up); saveToDB("ti_roles", up);
  };

  // ── Asset handlers ───────────────────────────────────────
  const saveAsset = asset => {
    const up=assets.find(a=>a.id===asset.id)?assets.map(a=>a.id===asset.id?asset:a):[...assets,asset];
    setAssets(up); saveToDB("ti_assets", up);
  };
  const deleteAsset = id => {
    const up=assets.filter(a=>a.id!==id); setAssets(up); saveToDB("ti_assets", up);
  };

  // ── Telas de Carregamento e Login ────────────────────────
  if (loadingDB) {
    return h("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--t2)" } }, 
      "Conectando ao banco de dados..."
    );
  }

  if(!session) return authView==="login"
    ? h(LoginScreen,{users,onLogin:login,onGoRegister:()=>setAuthView("register")})
    : h(RegisterScreen,{users,roles,onRegister:register,onGoLogin:()=>setAuthView("login")});

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
    h("nav",{className:"navbar"},
      h("div",{className:"navbar-brand"},h("i",{className:"ti ti-headset"}),"TI Chamados"),
      h("div",{className:"navbar-nav"},
        navItems.map(v=>h("div",{key:v.id,className:`nav-link${view===v.id?" active":""}`,onClick:()=>setView(v.id)},
          h("i",{className:`ti ${v.icon}`}),v.label,
          v.badge>0&&h("span",{className:"nav-badge"},v.badge)
        ))
      ),
      h("div",{className:"navbar-right"},
        h("div",{className:"navbar-user"},
          h("div",{className:"navbar-avatar"},h("i",{className:"ti ti-user"})),
          h("span",{className:"navbar-username"},session.name),
          h("span",{className:"navbar-role"},isAdmin?"Admin":roles.find(r=>r.id===session.roleId)?.name||"Usuário")
        ),
        h("button",{className:"navbar-logout",onClick:logout,title:"Sair"},h("i",{className:"ti ti-logout"}))
      )
    ),
    h("div",{className:"page-header"},
      h("div",{className:"page-header-inner"},
        h("h2",null,pageInfo[view]?.title),
        h("p",null,pageInfo[view]?.desc)
      )
    ),
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
    toast&&h(Toast,{msg:toast.msg,icon:toast.icon,color:toast.color})
  );
}

// Mantém o root render igual
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
