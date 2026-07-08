// ── Role Management ──────────────────────────────────────────
function RoleManagement({ roles, onSave, onDelete }){
  const [showForm, setShowForm] = React.useState(false);
  const [editing,  setEditing]  = React.useState(null);
  const h = React.createElement;

  return h("div",null,
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}},
      h("p",{style:{fontSize:13,color:"var(--t2)"}},"Crie cargos personalizados e defina quais telas cada cargo pode acessar."),
      h("button",{className:"btn-add-asset",onClick:()=>{setEditing(null);setShowForm(true);}},
        h("i",{className:"ti ti-plus"})," Novo cargo")
    ),
    h("div",{className:"roles-grid"},
      roles.map(role=>h(RoleCard,{key:role.id,role,
        onEdit:r=>{setEditing(r);setShowForm(true);},
        onDelete}))
    ),
    showForm&&h(RoleForm,{role:editing,roles,
      onSave:r=>{onSave(r);setShowForm(false);setEditing(null);},
      onClose:()=>{setShowForm(false);setEditing(null);}})
  );
}

function RoleCard({ role, onEdit, onDelete }){
  const [confirmDel, setConfirmDel] = React.useState(false);
  const screenLabels = role.permissions.map(pid=>SCREENS.find(s=>s.id===pid)?.label).filter(Boolean);
  const h = React.createElement;
  const colorMap = { purple:"var(--purple-bg)", blue:"var(--blue-bg)", green:"var(--green-bg)", amber:"var(--amber-bg)", red:"var(--red-bg)" };
  const textMap  = { purple:"var(--purple-t)",  blue:"var(--blue-t)",  green:"var(--green-t)",  amber:"var(--amber-t)",  red:"var(--red-t)"  };
  const bg   = colorMap[role.color||"blue"] || "var(--blue-bg)";
  const text = textMap[role.color||"blue"]  || "var(--blue-t)";

  return h("div",{className:"role-card"},
    h("div",{className:"role-card-header"},
      h("div",{style:{display:"flex",alignItems:"center",gap:10}},
        h("div",{className:"role-icon",style:{background:bg,color:text}},
          h("i",{className:"ti ti-shield"})),
        h("div",null,
          h("div",{style:{fontSize:15,fontWeight:600}},role.name),
          h("div",{style:{fontSize:12,color:"var(--t3)",marginTop:2}},
            role.isSystem ? "Cargo do sistema" : `${role.permissions.length} tela${role.permissions.length!==1?"s":""}`)
        )
      ),
      !role.isSystem&&h("div",{style:{display:"flex",gap:6}},
        h("button",{className:"btn-icon",onClick:()=>onEdit(role)},h("i",{className:"ti ti-pencil"})),
        h("button",{className:"btn-icon danger",onClick:()=>setConfirmDel(true)},h("i",{className:"ti ti-trash"}))
      )
    ),
    h("div",{style:{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}},
      screenLabels.map(label=>h("span",{key:label,style:{
        background:"var(--bg)",color:"var(--t2)",fontSize:12,padding:"2px 9px",borderRadius:100
      }},label))
    ),
    confirmDel&&h("div",{className:"confirm-box",style:{marginTop:10}},
      h("p",null,h("i",{className:"ti ti-alert-triangle",style:{marginRight:4}}),"Excluir este cargo?"),
      h("button",{className:"btn-confirm-yes",onClick:()=>onDelete(role.id)},h("i",{className:"ti ti-trash"}),"Excluir"),
      h("button",{className:"btn-confirm-no",onClick:()=>setConfirmDel(false)},"Cancelar")
    )
  );
}

function RoleForm({ role, roles, onSave, onClose }){
  const ROLE_COLORS = ["blue","purple","green","amber","red"];
  const [name,  setName]  = React.useState(role?.name||"");
  const [perms, setPerms] = React.useState(role?.permissions||["form","mine"]);
  const [color, setColor] = React.useState(role?.color||"blue");
  const h = React.createElement;

  const togglePerm = pid => setPerms(p=>p.includes(pid)?p.filter(x=>x!==pid):[...p,pid]);
  const handle = () => {
    if(!name.trim()||perms.length===0) return;
    const id = role ? role.id : genRoleId();
    onSave({ id, name:name.trim(), permissions:perms, color, isSystem:false });
  };

  const colorMap = { blue:"var(--blue-bg)", purple:"var(--purple-bg)", green:"var(--green-bg)", amber:"var(--amber-bg)", red:"var(--red-bg)" };
  const textMap  = { blue:"var(--blue-t)",  purple:"var(--purple-t)",  green:"var(--green-t)",  amber:"var(--amber-t)",  red:"var(--red-t)"  };

  return h("div",{className:"modal-overlay",onClick:e=>e.target===e.currentTarget&&onClose()},
    h("div",{className:"modal-panel",style:{width:440}},
      h("div",{className:"modal-header"},
        h("div",null,
          h("span",{style:{fontSize:11,color:"var(--t3)",fontFamily:"'IBM Plex Mono',monospace"}},role?"Editar cargo":"Novo cargo"),
          h("div",{style:{fontSize:16,fontWeight:600,marginTop:4}},name||"Sem nome")
        ),
        h("button",{className:"btn-close",onClick:onClose},h("i",{className:"ti ti-x"}))
      ),
      h("div",{className:"modal-body"},
        h("div",{className:"field-group"},
          h("label",{className:"field-label"},"Nome do cargo"),
          h("input",{type:"text",className:"select-field",placeholder:"Ex: RH, Técnico, Gerente...",
            value:name,onChange:e=>setName(e.target.value)})
        ),
        h("div",{className:"field-group"},
          h("label",{className:"field-label"},"Cor"),
          h("div",{style:{display:"flex",gap:8,marginTop:4}},
            ROLE_COLORS.map(c=>h("button",{key:c,
              onClick:()=>setColor(c),
              style:{
                width:28,height:28,borderRadius:"50%",cursor:"pointer",
                background:colorMap[c],border:color===c?"2px solid "+textMap[c]:"2px solid transparent",
                transition:"border .15s"
              }
            }))
          )
        ),
        h("div",{className:"field-group"},
          h("label",{className:"field-label"},"Telas com acesso"),
          h("div",{style:{display:"flex",flexDirection:"column",gap:8,marginTop:4}},
            SCREENS.map(s=>h("label",{key:s.id,className:"perm-row"},
              h("input",{type:"checkbox",checked:perms.includes(s.id),onChange:()=>togglePerm(s.id)}),
              h("i",{className:`ti ${s.icon}`,style:{fontSize:16,color:"var(--t2)"}}),
              h("span",null,s.label)
            ))
          )
        )
      ),
      h("div",{className:"modal-footer"},
        h("button",{className:"btn-secondary",onClick:onClose},"Cancelar"),
        h("button",{className:"btn-save",
          onClick:handle,
          disabled:!name.trim()||perms.length===0,
          style:(!name.trim()||perms.length===0)?{opacity:.5,cursor:"not-allowed"}:{}},
          h("i",{className:"ti ti-device-floppy"}),role?" Salvar":" Criar cargo")
      )
    )
  );
}
