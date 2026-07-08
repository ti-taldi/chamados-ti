function LoginScreen({ users, onLogin, onGoRegister }){
  const saved   = ls.get("ti_remember", null);
  const [email, setEmail]   = React.useState(saved ? saved.email : "");
  const [pwd,   setPwd]     = React.useState(saved ? decodePass(saved.pwd) : "");
  const [remember, setRemember] = React.useState(!!saved);
  const [err,   setErr]     = React.useState("");
  const isFirst = users.length===1 && users[0].email==="admin@ti.local";

  const handle = () => {
    const u = users.find(u =>
      u.email.toLowerCase()===email.toLowerCase() &&
      decodePass(u.password)===pwd
    );
    if(!u){ setErr("E-mail ou senha incorretos."); return; }
    if(u.role==="rejected"){ setErr("Sua conta foi recusada pelo administrador."); return; }
    setErr("");
    if(remember) ls.set("ti_remember",{ email, pwd:encodePass(pwd) });
    else         ls.del("ti_remember");
    onLogin(u);
  };

  const h = React.createElement;
  return h("div",{className:"auth-screen"},
    h("div",{className:"auth-card"},
      h("div",{className:"auth-logo"},
        h("div",{className:"auth-logo-icon"},h("i",{className:"ti ti-headset"})),
        h("h1",null,"TI Chamados"),
        h("p",null,"Sistema de suporte técnico")
      ),
      isFirst && h("div",{className:"auth-hint"},
        h("i",{className:"ti ti-info-circle",style:{marginRight:6}}),
        h("strong",null,"Primeiro acesso: "),
        "use ",h("code",null,"admin@ti.local")," / ",h("code",null,"admin123")
      ),
      err && h("div",{className:"auth-error"},h("i",{className:"ti ti-alert-circle"}),err),
      h("div",{className:"auth-field"},
        h("label",{className:"auth-label"},"E-mail"),
        h("input",{className:"auth-input",type:"text",placeholder:"seu@email.com",
          value:email,onChange:e=>setEmail(e.target.value),
          onKeyDown:e=>e.key==="Enter"&&handle()})
      ),
      h("div",{className:"auth-field"},
        h("label",{className:"auth-label"},"Senha"),
        h("input",{className:"auth-input",type:"password",placeholder:"••••••••",
          value:pwd,onChange:e=>setPwd(e.target.value),
          onKeyDown:e=>e.key==="Enter"&&handle()})
      ),
      h("div",{className:"auth-field"},
        h("label",{className:"remember-row"},
          h("input",{type:"checkbox",checked:remember,onChange:e=>setRemember(e.target.checked)}),
          "Lembrar de mim"
        )
      ),
      h("button",{className:"auth-btn",onClick:handle,disabled:!email||!pwd},
        h("i",{className:"ti ti-login"})," Entrar"
      ),
      h("div",{className:"auth-switch"},
        "Não tem conta? ",
        h("a",{onClick:onGoRegister},"Solicitar acesso")
      )
    )
  );
}

function RegisterScreen({ users, roles, onRegister, onGoLogin }){
  const [form, setForm] = React.useState({
    name:"", email:"", pwd:"", conf:"", company:""
  });
  const [err,  setErr]  = React.useState("");
  const [done, setDone] = React.useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = () => {
    if(form.pwd !== form.conf){ setErr("As senhas não coincidem."); return; }
    if(form.pwd.length < 4)   { setErr("Senha mínima de 4 caracteres."); return; }
    if(users.find(u=>u.email.toLowerCase()===form.email.toLowerCase())){
      setErr("Este e-mail já está cadastrado."); return;
    }
    const defRole = roles.find(r=>r.id==="role-user") || roles[0];
    onRegister({
      id:genUserId(), name:form.name.trim(),
      email:form.email.trim().toLowerCase(),
      password:encodePass(form.pwd),
      role:"pending", roleId:defRole?.id || "role-user",
      company:form.company, createdAt:Date.now(),
    });
    setDone(true);
  };

  const h = React.createElement;
  if(done) return h("div",{className:"auth-screen"},
    h("div",{className:"auth-card",style:{textAlign:"center"}},
      h("div",{className:"status-icon",style:{background:"var(--amber-bg)",color:"var(--amber)",margin:"0 auto 18px"}},
        h("i",{className:"ti ti-clock"})),
      h("h2",{style:{marginBottom:8}},"Solicitação enviada!"),
      h("p",{style:{fontSize:14,color:"var(--t2)",lineHeight:1.6,marginBottom:24}},
        "Sua conta aguarda aprovação do administrador."),
      h("button",{className:"auth-btn",style:{width:"auto",display:"inline-flex"},onClick:onGoLogin},
        h("i",{className:"ti ti-arrow-left"})," Voltar ao login")
    )
  );

  return h("div",{className:"auth-screen"},
    h("div",{className:"auth-card"},
      h("div",{className:"auth-logo"},
        h("div",{className:"auth-logo-icon"},h("i",{className:"ti ti-user-plus"})),
        h("h1",null,"Solicitar acesso"),
        h("p",null,"Crie sua conta para abrir chamados")
      ),
      err && h("div",{className:"auth-error"},h("i",{className:"ti ti-alert-circle"}),err),
      h("div",{className:"auth-field"},h("label",{className:"auth-label"},"Nome completo"),
        h("input",{className:"auth-input",type:"text",placeholder:"Seu nome",value:form.name,onChange:e=>set("name",e.target.value)})),
      h("div",{className:"auth-field"},h("label",{className:"auth-label"},"E-mail"),
        h("input",{className:"auth-input",type:"text",placeholder:"seu@email.com",value:form.email,onChange:e=>set("email",e.target.value)})),
      h("div",{className:"auth-field"},h("label",{className:"auth-label"},"Empresa"),
        h(ComboSelect,{value:form.company,onChange:v=>set("company",v),options:COMPANIES,className:"auth-input",placeholder:"Selecione ou digite..."})),
      h("div",{className:"auth-field"},h("label",{className:"auth-label"},"Senha"),
        h("input",{className:"auth-input",type:"password",placeholder:"Mínimo 4 caracteres",value:form.pwd,onChange:e=>set("pwd",e.target.value)})),
      h("div",{className:"auth-field"},h("label",{className:"auth-label"},"Confirmar senha"),
        h("input",{className:"auth-input",type:"password",placeholder:"Repita a senha",value:form.conf,
          onChange:e=>set("conf",e.target.value),onKeyDown:e=>e.key==="Enter"&&handle()})),
      h("button",{className:"auth-btn",onClick:handle,disabled:!form.name||!form.email||!form.pwd||!form.conf},
        h("i",{className:"ti ti-send"})," Solicitar acesso"),
      h("div",{className:"auth-switch"},"Já tem conta? ",h("a",{onClick:onGoLogin},"Fazer login"))
    )
  );
}

function PendingScreen({ session, onLogout }){
  const h = React.createElement;
  return h("div",{className:"status-screen"},
    h("div",{className:"status-card"},
      h("div",{className:"status-icon",style:{background:"var(--amber-bg)",color:"var(--amber)"}},h("i",{className:"ti ti-clock"})),
      h("h2",{style:{marginBottom:8}},"Aguardando aprovação"),
      h("p",{style:{fontSize:14,color:"var(--t2)",lineHeight:1.6,marginBottom:24}},
        "Olá, ",h("strong",null,session.name),"! Sua conta ainda não foi aprovada pelo administrador."),
      h("button",{className:"btn-secondary",onClick:onLogout},h("i",{className:"ti ti-logout"})," Sair")
    )
  );
}

function RejectedScreen({ session, onLogout }){
  const h = React.createElement;
  return h("div",{className:"status-screen"},
    h("div",{className:"status-card"},
      h("div",{className:"status-icon",style:{background:"var(--red-bg)",color:"var(--red)"}},h("i",{className:"ti ti-user-x"})),
      h("h2",{style:{marginBottom:8}},"Acesso recusado"),
      h("p",{style:{fontSize:14,color:"var(--t2)",lineHeight:1.6,marginBottom:24}},
        "Seu acesso não foi aprovado. Entre em contato com o TI."),
      h("button",{className:"btn-secondary",onClick:onLogout},h("i",{className:"ti ti-logout"})," Sair")
    )
  );
}
