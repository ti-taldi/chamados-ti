// ── Ticket Modal ─────────────────────────────────────────────
function TicketModal({ ticket, isAdmin, onClose, onSave }){
  const [status,   setStatus]   = React.useState(ticket.status);
  const [priority, setPriority] = React.useState(ticket.priority);
  const [deadline, setDeadline] = React.useState(ticket.deadline||"");
  const [notes,    setNotes]    = React.useState(ticket.adminNotes||"");
  const cat  = CATS.find(c=>c.id===ticket.category);
  const over = isOverdue(ticket.deadline, ticket.status);
  const h    = React.createElement;

  return h("div",{className:"modal-overlay",onClick:e=>e.target===e.currentTarget&&onClose()},
    h("div",{className:"modal-panel"},
      h("div",{className:"modal-header"},
        h("div",null,
          h("span",{style:{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--t3)"}},
            ticket.id," · ",fmtDate(ticket.createdAt)),
          h("div",{style:{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}},
            h(Badge,{type:ticket.status,   label:STATUSES.find(s=>s.id===ticket.status)?.label}),
            h(Badge,{type:ticket.priority, label:PRIORITIES.find(p=>p.id===ticket.priority)?.label})
          )
        ),
        h("button",{className:"btn-close",onClick:onClose},h("i",{className:"ti ti-x"}))
      ),
      h("div",{className:"modal-body"},
        // Info
        h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Informações"),
          h("div",{className:"info-row"},h("span",{className:"info-key"},"Usuário"),h("span",{className:"info-val"},ticket.userName)),
          ticket.assetTag&&h("div",{className:"info-row"},
            h("span",{className:"info-key"},"Patrimônio"),
            h("span",{className:"info-val",style:{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}},ticket.assetTag)
          ),
          h("div",{className:"info-row"},
            h("span",{className:"info-key"},"Categoria"),
            h("span",{className:"info-val"},h("i",{className:`ti ${cat?.icon}`,style:{marginRight:5,verticalAlign:-1}}),cat?.label)
          ),
          h("div",{className:"info-row"},h("span",{className:"info-key"},"Aberto em"),h("span",{className:"info-val"},fmtDate(ticket.createdAt))),
          ticket.deadline&&h("div",{className:"info-row"},
            h("span",{className:"info-key"},"Prazo"),
            h("span",{className:"info-val",style:over?{color:"var(--red)"}:{}},
              fmtDl(ticket.deadline), over&&" · ⚠ Atrasado")
          )
        ),
        // Description
        h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Descrição do Problema"),
          h("div",{className:"desc-box"},ticket.description)
        ),
        // Photo
        ticket.photo&&h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Foto do Problema"),
          h("img",{src:ticket.photo,alt:"Foto",
            style:{width:"100%",borderRadius:"var(--r)",border:"1px solid var(--border)",cursor:"pointer"},
            onClick:()=>window.open(ticket.photo,"_blank"),title:"Clique para ampliar"})
        ),
        // Admin notes
        ticket.adminNotes&&h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Análise do Técnico"),
          h("div",{className:"desc-box",style:{background:"var(--blue-bg)",color:"var(--blue-t)"}},ticket.adminNotes)
        ),
        // Admin panel
        isAdmin&&h("div",{className:"admin-section"},
          h("div",{className:"admin-section-title"},h("i",{className:"ti ti-settings",style:{fontSize:16}}),"Painel do Técnico"),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Status"),
              h("select",{className:"select-field",value:status,onChange:e=>setStatus(e.target.value)},
                STATUSES.map(s=>h("option",{key:s.id,value:s.id},s.label)))
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Prioridade"),
              h("select",{className:"select-field",value:priority,onChange:e=>setPriority(e.target.value)},
                PRIORITIES.map(p=>h("option",{key:p.id,value:p.id},p.label)))
            )
          ),
          h("div",{className:"field-group"},
            h("label",{className:"field-label"},h("i",{className:"ti ti-calendar-due",style:{marginRight:4,verticalAlign:-1}}),"Prazo para solução"),
            h("input",{type:"date",className:"date-field",value:deadline,onChange:e=>setDeadline(e.target.value)})
          ),
          h("div",{className:"field-group",style:{marginBottom:0}},
            h("label",{className:"field-label"},"Notas / Diagnóstico"),
            h("textarea",{className:"notes-field",value:notes,
              onChange:e=>setNotes(e.target.value),
              placeholder:"Diagnóstico, ações tomadas, observações..."})
          )
        )
      ),
      h("div",{className:"modal-footer"},
        h("button",{className:"btn-secondary",onClick:onClose},"Fechar"),
        isAdmin&&h("button",{className:"btn-save",onClick:()=>onSave({status,priority,deadline,adminNotes:notes})},
          h("i",{className:"ti ti-device-floppy"})," Salvar")
      )
    )
  );
}

// ── Ticket Card ──────────────────────────────────────────────
function TicketCard({ ticket, onClick }){
  const cat  = CATS.find(c=>c.id===ticket.category);
  const over = isOverdue(ticket.deadline, ticket.status);
  const h    = React.createElement;
  return h("div",{className:`ticket-card${over?" overdue":""}`,onClick},
    h("div",{className:"ticket-header"},
      h("div",{className:"ticket-badges"},
        h("span",{className:"ticket-id"},ticket.id),
        h(Badge,{type:ticket.status,   label:STATUSES.find(s=>s.id===ticket.status)?.label}),
        h(Badge,{type:ticket.priority, label:PRIORITIES.find(p=>p.id===ticket.priority)?.label})
      ),
      h("span",{className:"ticket-date"},fmtDate(ticket.createdAt))
    ),
    h("div",{className:"ticket-user"},
      ticket.userName,
      ticket.assetTag&&h("span",{className:"ticket-asset"},ticket.assetTag)
    ),
    h("p",{className:"ticket-desc"},ticket.description),
    h("div",{className:"ticket-footer"},
      h("span",{className:"ticket-cat"},h("i",{className:`ti ${cat?.icon}`}),cat?.label),
      ticket.deadline&&h("span",{className:`ticket-deadline${over?" overdue":""}`},
        h("i",{className:"ti ti-calendar-due"}),"Prazo: ",fmtDl(ticket.deadline),over&&" · Atrasado")
    )
  );
}

// ── Admin Dashboard ──────────────────────────────────────────
function AdminDashboard({ tickets, onUpdate }){
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(null);
  const h = React.createElement;

  // Calcula as contagens baseadas nos tickets originais
  const counts = React.useMemo(() => ({
    all:        tickets.length,
    aguardando: tickets.filter(t=>t.status==="aguardando").length,
    andamento:  tickets.filter(t=>t.status==="andamento").length,
    concluido:  tickets.filter(t=>t.status==="concluido").length,
  }), [tickets]);

  // Filtra e ordena criando uma cópia limpa para evitar mutações
  const filtered = React.useMemo(() => {
    const list = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [tickets, filter]);

  const sel = selected ? tickets.find(t=>t.id===selected) : null;

  const statItems = [
    {key:"all",       label:"Total",         icon:"ti-ticket",        bg:"var(--blue-bg)",   color:"var(--blue-t)"},
    {key:"aguardando",label:"Aguardando",     icon:"ti-clock",         bg:"var(--amber-bg)",  color:"var(--amber-t)"},
    {key:"andamento", label:"Em andamento",   icon:"ti-loader",        bg:"var(--blue-bg)",   color:"var(--blue-t)"},
    {key:"concluido", label:"Concluídos",     icon:"ti-circle-check",  bg:"var(--green-bg)",  color:"var(--green-t)"},
  ];

  return h("div", null,
    // 1. Renderiza os Cards de Estatísticas / Abas Superiores
    h("div", { className: "dashboard-stats", style: { display: "flex", gap: "16px", marginBottom: "24px" } },
      statItems.map(s => h("div", {
        key: s.key,
        className: `stat-card ${filter === s.key ? "active" : ""}`,
        onClick: () => setFilter(s.key),
        style: { 
          backgroundColor: s.bg, 
          color: s.color, 
          padding: "16px", 
          borderRadius: "var(--r)", 
          cursor: "pointer",
          flex: 1,
          border: filter === s.key ? "2px solid currentColor" : "1px solid transparent"
        }
      },
        h("div", { style: { fontSize: 14, opacity: 0.8 } }, s.label),
        h("div", { style: { fontSize: 24, fontWeight: 600, marginTop: "8px" } }, counts[s.key])
      ))
    ),

    // 2. Renderiza a Lista de Chamados Filtrada
    filtered.length === 0
      ? h("div", { className: "empty-state" }, 
          h("i", { className: "ti ti-ticket" }), 
          h("p", null, "Nenhum chamado encontrado para este filtro.")
        )
      : h("div", { className: "ticket-list" }, 
          // O segredo está aqui: mapear APENAS o array "filtered" e usar APENAS o t.id na key
          filtered.map(t => h(TicketCard, { 
            key: t.id, 
            ticket: t, 
            onClick: () => setSelected(t.id) 
          }))
        ),

    // 3. Renderiza o Modal se houver algum selecionado
    sel && h(TicketModal, { 
      ticket: sel, 
      isAdmin: true, 
      onClose: () => setSelected(null), 
      onSave: (updates) => { 
        onUpdate(sel.id, updates); 
        setSelected(null); 
      } 
    })
  );
}

// ── New Ticket Form ──────────────────────────────────────────
function NewTicketForm({ session, onSubmit }){
  const [form, setForm] = React.useState({
    userName:session.name, assetTag:"", category:"", priority:"media", description:""
  });
  const [photo,     setPhoto]     = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [lastId,    setLastId]    = React.useState("");
  const set  = (k,v) => setForm(f=>({...f,[k]:v}));
  const can  = form.userName.trim()&&form.category&&form.description.trim();
  const h    = React.createElement;

  const handlePhoto = e => {
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>setPhoto(ev.target.result);
    r.readAsDataURL(f);
  };
  const handleSubmit = () => {
    if(!can)return;
    const id=onSubmit({...form,photo:photo||null});
    setLastId(id); setSubmitted(true);
  };
  const reset = () => {
    setSubmitted(false); setPhoto(null);
    setForm({userName:session.name,assetTag:"",category:"",priority:"media",description:""});
  };

  if(submitted) return h("div",{className:"success-box"},
    h("div",{className:"success-icon"},h("i",{className:"ti ti-check"})),
    h("h2",{style:{fontSize:20,fontWeight:600,marginBottom:8}},"Chamado aberto com sucesso!"),
    h("p",{style:{color:"var(--t2)",marginBottom:4,fontSize:14}},"Protocolo:"),
    h("div",{className:"protocol-id"},lastId),
    h("p",{style:{fontSize:13,color:"var(--t2)",maxWidth:360,margin:"0 auto 24px",lineHeight:1.6}},
      "Anote este número para acompanhar o chamado."),
    h("button",{className:"btn-secondary",onClick:reset},h("i",{className:"ti ti-plus"})," Abrir novo chamado")
  );

  return h("div",{className:"form-wrap"},
    // Nome
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},"Nome do usuário / cliente ",h("span",null,"*")),
      h("input",{type:"text",placeholder:"Seu nome completo",value:form.userName,onChange:e=>set("userName",e.target.value)})
    ),
    // Categoria
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},"Categoria ",h("span",null,"*")),
      h("div",{className:"cat-grid"},
        CATS.map(c=>h("button",{key:c.id,className:`cat-btn${form.category===c.id?" selected":""}`,onClick:()=>set("category",c.id)},
          h("i",{className:`ti ${c.icon}`}),c.label))
      )
    ),
    // Etiqueta
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},"Etiqueta de patrimônio (notebook ou monitor)"),
      h("input",{type:"text",placeholder:"Ex: NTB-00142 / MON-00085",value:form.assetTag,onChange:e=>set("assetTag",e.target.value)})
    ),
    // Prioridade
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},"Prioridade"),
      h("div",{className:"priority-grid"},
        PRIORITIES.map(p=>h("button",{key:p.id,className:`prio-btn p-${p.id}${form.priority===p.id?" selected":""}`,onClick:()=>set("priority",p.id)},p.label))
      )
    ),
    // Descrição
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},"Descrição do problema ",h("span",null,"*")),
      h("textarea",{rows:5,placeholder:"Descreva detalhadamente o problema...",value:form.description,onChange:e=>set("description",e.target.value)})
    ),
    // Foto
    h("div",{className:"form-section"},
      h("label",{className:"form-label"},
        h("i",{className:"ti ti-camera",style:{marginRight:5,verticalAlign:-2}}),
        "Foto do problema ",h("span",{style:{color:"var(--t3)",fontWeight:400}},"(opcional)")
      ),
      h("div",{className:`photo-upload-area${photo?" has-photo":""}`},
        h("input",{type:"file",accept:"image/*",onChange:handlePhoto,onClick:e=>e.stopPropagation()}),
        !photo
          ? h("div",null,
              h("div",{style:{fontSize:28,color:"var(--t3)",marginBottom:6}},h("i",{className:"ti ti-photo-up"})),
              h("div",{style:{fontSize:13,color:"var(--t2)"}},"Clique ou arraste uma imagem aqui"),
              h("div",{style:{fontSize:11,color:"var(--t3)",marginTop:3}},"JPG, PNG ou GIF")
            )
          : h("div",{className:"photo-preview-wrap"},
              h("img",{src:photo,className:"photo-preview",alt:"Preview"}),
              h("button",{className:"photo-remove",onClick:e=>{e.stopPropagation();setPhoto(null);}},
                h("i",{className:"ti ti-x"}))
            )
      )
    ),
    h("button",{className:"btn-primary",onClick:handleSubmit,disabled:!can},
      h("i",{className:"ti ti-send"})," Enviar chamado")
  );
}

// ── My Tickets (user view) ───────────────────────────────────
function MyTickets({ tickets, session }){
  const [selected, setSelected] = React.useState(null);
  const mine = tickets.filter(t=>t.userId===session.id).slice().sort((a,b)=>b.createdAt-a.createdAt);
  const sel  = selected ? mine.find(t=>t.id===selected) : null;
  const h    = React.createElement;
  return h("div",null,
    mine.length===0
      ? h("div",{className:"empty-state"},h("i",{className:"ti ti-ticket"}),h("p",null,"Você ainda não abriu nenhum chamado"))
      : h("div",{className:"ticket-list"},mine.map(t=>h(TicketCard,{key:t.id,ticket:t,onClick:()=>setSelected(t.id)}))),
    sel&&h(TicketModal,{ticket:sel,isAdmin:false,onClose:()=>setSelected(null)})
  );
}
