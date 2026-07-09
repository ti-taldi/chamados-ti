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
