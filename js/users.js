function UserManagement({ users, roles, currentUser, onApprove, onReject, onPromote, onDemote, onDelete, onChangeRole }){
  const [tab,           setTab]           = React.useState("pending");
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const h = React.createElement;

  const pending  = users.filter(u=>u.role==="pending");
  const active   = users.filter(u=>u.role==="user"||u.role==="admin");
  const rejected = users.filter(u=>u.role==="rejected");

  const getRoleName = (u) => {
    if(u.role==="admin") return "Administrador";
    const r = roles.find(r=>r.id===u.roleId);
    return r ? r.name : "Padrão";
  };

  const Actions = ({ u }) => {
    if(confirmDelete===u.id) return h("div",{className:"confirm-box"},
      h("p",null,h("i",{className:"ti ti-alert-triangle",style:{marginRight:4}}),"Excluir permanentemente?"),
      h("button",{className:"btn-confirm-yes",onClick:()=>{onDelete(u.id);setConfirmDelete(null);}},h("i",{className:"ti ti-trash"}),"Excluir"),
      h("button",{className:"btn-confirm-no",onClick:()=>setConfirmDelete(null)},"Cancelar")
    );

    return h("div",{className:"user-actions"},
      u.role==="pending"&&h("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
        h("button",{className:"btn-approve",onClick:()=>onApprove(u.id)},h("i",{className:"ti ti-check"}),"Aprovar"),
        h("button",{className:"btn-reject", onClick:()=>onReject(u.id)}, h("i",{className:"ti ti-x"}),"Recusar")
      ),
      u.role==="user"&&h("div",{style:{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}},
        h("label",{style:{fontSize:12,color:"var(--t2)",marginRight:2}},"Cargo:"),
        h("select",{className:"select-field",style:{width:"auto",fontSize:12,padding:"4px 8px"},
          value:u.roleId||"role-user",
          onChange:e=>onChangeRole(u.id,e.target.value)},
          roles.filter(r=>!r.isSystem||r.id==="role-user").map(r=>h("option",{key:r.id,value:r.id},r.name)),
          roles.filter(r=>!r.isSystem).length===0&&null
        ),
        h("button",{className:"btn-promote",onClick:()=>onPromote(u.id)},h("i",{className:"ti ti-shield-up"}),"Tornar Admin")
      ),
      u.role==="admin"&&u.id!==currentUser.id&&
        h("button",{className:"btn-demote",onClick:()=>onDemote(u.id)},h("i",{className:"ti ti-shield-down"}),"Rebaixar"),
      u.role==="rejected"&&
        h("button",{className:"btn-approve",onClick:()=>onApprove(u.id)},h("i",{className:"ti ti-rotate"}),"Reativar"),
      u.id===currentUser.id
        ? h("span",{style:{fontSize:12,color:"var(--t3)"}},"Você")
        : h("button",{className:"btn-delete",onClick:()=>setConfirmDelete(u.id)},h("i",{className:"ti ti-trash"}))
    );
  };

  const UserCard = ({ u }) => h("div",{className:"user-card"},
    h("div",{className:"user-card-top"},
      h("div",{className:"user-avatar"},h("i",{className:"ti ti-user"})),
      h("div",{className:"user-info"},
        h("div",{className:"user-name"},
          u.name,
          h(Badge,{type:u.role==="admin"?"admin":u.role==="pending"?"pending":u.role==="rejected"?"rejected":"user",
            label:u.role==="admin"?"Admin":u.role==="pending"?"Pendente":u.role==="rejected"?"Recusado":getRoleName(u)})
        ),
        h("div",{className:"user-email"},u.email),
        u.company&&h("div",{className:"user-meta"},h("i",{className:"ti ti-building",style:{marginRight:4}}),u.company),
        h("div",{className:"user-meta"},"Cadastrado em ",fmtDate(u.createdAt))
      )
    ),
    h(Actions,{u})
  );

  // Company filter for active users
  const companies = [...new Set(active.map(u=>u.company).filter(Boolean))];
  const [companyF, setCompanyF] = React.useState("all");
  const filteredActive = companyF==="all" ? active : active.filter(u=>u.company===companyF);

  const List = ({ list, empty, showFilter }) => list.length===0&&!showFilter
    ? h("div",{className:"empty-state",style:{padding:"40px 20px"}},h("i",{className:"ti ti-users"}),h("p",null,empty))
    : h("div",null,
        showFilter&&companies.length>1&&h("div",{className:"company-filter",style:{marginBottom:16}},
          h("span",{style:{fontSize:12,color:"var(--t3)",marginRight:4}},"Empresa:"),
          ["all",...companies].map(c=>{
            const cnt=c==="all"?active.length:active.filter(u=>u.company===c).length;
            return h("button",{key:c,className:`company-chip${companyF===c?" active":""}`,onClick:()=>setCompanyF(c)},
              c==="all"?"Todos":c,h("span",{className:"company-chip-count"},cnt));
          })
        ),
        list.length===0
          ? h("div",{className:"empty-state",style:{padding:"40px 20px"}},h("i",{className:"ti ti-users"}),h("p",null,empty))
          : h("div",{className:"user-grid"},list.map(u=>h(UserCard,{key:u.id,u})))
      );

  return h("div",null,
    h("div",{className:"tabs"},
      h("button",{className:`tab-btn${tab==="pending"?" active":""}`,onClick:()=>setTab("pending")},
        h("i",{className:"ti ti-clock"}),"Pendentes",
        pending.length>0&&h("span",{style:{background:"var(--red)",color:"white",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:9}},pending.length)
      ),
      h("button",{className:`tab-btn${tab==="active"?" active":""}`,onClick:()=>setTab("active")},
        h("i",{className:"ti ti-users"}),"Usuários ativos"),
      h("button",{className:`tab-btn${tab==="rejected"?" active":""}`,onClick:()=>setTab("rejected")},
        h("i",{className:"ti ti-user-x"}),"Recusados")
    ),
    tab==="pending" &&h(List,{list:pending,  empty:"Nenhuma solicitação pendente",showFilter:false}),
    tab==="active"  &&h(List,{list:filteredActive,empty:"Nenhum usuário ativo",showFilter:true}),
    tab==="rejected"&&h(List,{list:rejected, empty:"Nenhum usuário recusado",showFilter:false})
  );
}
