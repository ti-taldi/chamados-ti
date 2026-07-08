// ── Asset Form ───────────────────────────────────────────────
function AssetForm({ asset, type, users, onSave, onClose }){
  const brands = type==="notebook" ? NOTEBOOK_BRANDS : MONITOR_BRANDS;
  const [form, setForm] = React.useState({
    tag:"", brand:"", model:"", serial:"", assignedUser:"",
    status:"ativo", acquiredAt:"", notes:"",
    company:"", sector:"",
    processor:"", ram:"", storage:"", os:"",
    size:"", resolution:"", panel:"",
    ...(asset||{})
  });
  const set  = (k,v) => setForm(f=>({...f,[k]:v}));
  const can  = form.tag.trim()&&form.brand&&form.model.trim();
  const h    = React.createElement;
  const activeUsers = users.filter(u=>u.role==="user"||u.role==="admin").map(u=>u.name);

  return h("div",{className:"modal-overlay",onClick:e=>e.target===e.currentTarget&&onClose()},
    h("div",{className:"modal-panel"},
      h("div",{className:"modal-header"},
        h("div",null,
          h("span",{style:{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--t3)"}},
            asset?"Editar":"Novo"," ",type==="notebook"?"Notebook":"Monitor"),
          h("div",{style:{fontSize:16,fontWeight:600,marginTop:4}},
            asset?form.tag:"Cadastrar equipamento")
        ),
        h("button",{className:"btn-close",onClick:onClose},h("i",{className:"ti ti-x"}))
      ),
      h("div",{className:"modal-body"},

        // Identificação
        h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Identificação"),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Etiqueta de patrimônio *"),
              h("input",{type:"text",className:"select-field",
                placeholder:type==="notebook"?"NTB-00001":"MON-00001",
                value:form.tag,onChange:e=>set("tag",e.target.value)})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Status"),
              h("select",{className:"select-field",value:form.status,onChange:e=>set("status",e.target.value)},
                ASSET_STATUS.map(s=>h("option",{key:s.id,value:s.id},s.label)))
            )
          ),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Marca *"),
              h(ComboSelect,{value:form.brand,onChange:v=>set("brand",v),options:brands})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Modelo *"),
              h("input",{type:"text",className:"select-field",
                placeholder:type==="notebook"?"Ex: Latitude 5420":"Ex: U2422H",
                value:form.model,onChange:e=>set("model",e.target.value)})
            )
          ),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Número de série"),
              h("input",{type:"text",className:"select-field",placeholder:"S/N",
                value:form.serial,onChange:e=>set("serial",e.target.value)})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Data de aquisição"),
              h("input",{type:"date",className:"date-field",value:form.acquiredAt,onChange:e=>set("acquiredAt",e.target.value)})
            )
          ),
          h("div",{className:"field-group"},
            h("label",{className:"field-label"},"Usuário responsável"),
            h(ComboSelect,{value:form.assignedUser,onChange:v=>set("assignedUser",v),
              options:activeUsers,placeholder:"Nome do responsável..."})
          ),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Empresa"),
              h(ComboSelect,{value:form.company,onChange:v=>set("company",v),options:COMPANIES})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Setor / Departamento"),
              h("input",{type:"text",className:"select-field",placeholder:"Ex: RH, Financeiro, TI...",
                value:form.sector,onChange:e=>set("sector",e.target.value)})
            )
          )
        ),

        // Notebook specs
        type==="notebook"&&h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Especificações técnicas"),
          h("div",{className:"field-group"},
            h("label",{className:"field-label"},"Processador"),
            h("input",{type:"text",className:"select-field",placeholder:"Ex: Intel Core i5-1235U",
              value:form.processor,onChange:e=>set("processor",e.target.value)})
          ),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Memória RAM"),
              h(ComboSelect,{value:form.ram,onChange:v=>set("ram",v),options:RAM_OPTS})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Armazenamento"),
              h(ComboSelect,{value:form.storage,onChange:v=>set("storage",v),options:STOR_OPTS})
            )
          ),
          h("div",{className:"field-group"},
            h("label",{className:"field-label"},"Sistema operacional"),
            h("input",{type:"text",className:"select-field",placeholder:"Ex: Windows 11 Pro",
              value:form.os,onChange:e=>set("os",e.target.value)})
          )
        ),

        // Monitor specs
        type==="monitor"&&h("div",{className:"modal-section"},
          h("div",{className:"modal-section-title"},"Especificações técnicas"),
          h("div",{className:"two-col"},
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Tamanho (polegadas)"),
              h("input",{type:"text",className:"select-field",placeholder:'Ex: 24"',
                value:form.size,onChange:e=>set("size",e.target.value)})
            ),
            h("div",{className:"field-group"},
              h("label",{className:"field-label"},"Tipo de painel"),
              h(ComboSelect,{value:form.panel,onChange:v=>set("panel",v),options:PANEL_OPTS})
            )
          ),
          h("div",{className:"field-group"},
            h("label",{className:"field-label"},"Resolução"),
            h(ComboSelect,{value:form.resolution,onChange:v=>set("resolution",v),options:RES_OPTS})
          )
        ),

        h("div",{className:"modal-section",style:{marginBottom:0}},
          h("div",{className:"modal-section-title"},"Observações"),
          h("textarea",{className:"notes-field",rows:3,
            placeholder:"Estado do equipamento, acessórios, etc.",
            value:form.notes,onChange:e=>set("notes",e.target.value)})
        )
      ),
      h("div",{className:"modal-footer"},
        h("button",{className:"btn-secondary",onClick:onClose},"Cancelar"),
        h("button",{className:"btn-save",
          onClick:()=>can&&onSave(form),
          disabled:!can,style:!can?{opacity:.5,cursor:"not-allowed"}:{}},
          h("i",{className:"ti ti-device-floppy"}),asset?" Salvar alterações":" Cadastrar")
      )
    )
  );
}

// ── Asset Card ───────────────────────────────────────────────
function AssetCard({ asset, type, onEdit, onDelete }){
  const statusLabel = {ativo:"Ativo",manutencao:"Em manutenção",inativo:"Inativo"};
  const [confirmDel, setConfirmDel] = React.useState(false);
  const h = React.createElement;

  return h("div",{className:"asset-card"},
    h("div",{className:"asset-card-header"},
      h("div",{style:{display:"flex",alignItems:"center",gap:10}},
        h("div",{className:"asset-icon",style:{background:type==="notebook"?"var(--blue-bg)":"var(--purple-bg)"}},
          h("i",{className:`ti ${type==="notebook"?"ti-device-laptop":"ti-device-desktop"}`,
            style:{color:type==="notebook"?"var(--blue-t)":"var(--purple-t)"}})
        ),
        h("div",null,
          h("div",{style:{fontSize:15,fontWeight:600}},asset.brand," ",asset.model),
          h("span",{className:"asset-tag"},asset.tag)
        )
      ),
      h(Badge,{type:asset.status,label:statusLabel[asset.status]||asset.status})
    ),
    h("div",{className:"asset-info-grid"},
      asset.assignedUser&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Responsável"),
        h("span",{className:"asset-info-val"},asset.assignedUser)),
      asset.company&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Empresa"),
        h("span",{className:"asset-info-val"},asset.company)),
      asset.sector&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Setor"),
        h("span",{className:"asset-info-val"},asset.sector)),
      asset.serial&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Série"),
        h("span",{className:"asset-info-val",style:{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}},asset.serial)),
      type==="notebook"&&asset.processor&&h("div",{className:"asset-info-item",style:{gridColumn:"1/-1"}},
        h("span",{className:"asset-info-label"},"Processador"),
        h("span",{className:"asset-info-val"},asset.processor)),
      type==="notebook"&&asset.ram&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"RAM"),
        h("span",{className:"asset-info-val"},asset.ram)),
      type==="notebook"&&asset.storage&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Armazenamento"),
        h("span",{className:"asset-info-val"},asset.storage)),
      type==="notebook"&&asset.os&&h("div",{className:"asset-info-item",style:{gridColumn:"1/-1"}},
        h("span",{className:"asset-info-label"},"S.O."),
        h("span",{className:"asset-info-val"},asset.os)),
      type==="monitor"&&asset.size&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Tamanho"),
        h("span",{className:"asset-info-val"},asset.size)),
      type==="monitor"&&asset.panel&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Painel"),
        h("span",{className:"asset-info-val"},asset.panel)),
      type==="monitor"&&asset.resolution&&h("div",{className:"asset-info-item",style:{gridColumn:"1/-1"}},
        h("span",{className:"asset-info-label"},"Resolução"),
        h("span",{className:"asset-info-val"},asset.resolution)),
      asset.acquiredAt&&h("div",{className:"asset-info-item"},
        h("span",{className:"asset-info-label"},"Aquisição"),
        h("span",{className:"asset-info-val"},fmtDl(asset.acquiredAt)))
    ),
    asset.notes&&h("p",{style:{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:10,padding:"8px 10px",background:"var(--bg)",borderRadius:"var(--r)"}},asset.notes),
    h("div",{className:"asset-footer"},
      h("div"),
      confirmDel
        ? h("div",{style:{display:"flex",alignItems:"center",gap:6}},
            h("span",{style:{fontSize:12,color:"var(--red-t)",fontWeight:500}},"Confirmar exclusão?"),
            h("button",{className:"btn-confirm-yes",onClick:()=>onDelete(asset.id)},h("i",{className:"ti ti-trash"}),"Excluir"),
            h("button",{className:"btn-confirm-no",onClick:()=>setConfirmDel(false)},"Não")
          )
        : h("div",{className:"asset-actions"},
            h("button",{className:"btn-icon",onClick:()=>onEdit(asset),title:"Editar"},h("i",{className:"ti ti-pencil"})),
            h("button",{className:"btn-icon danger",onClick:()=>setConfirmDel(true),title:"Excluir"},h("i",{className:"ti ti-trash"}))
          )
    )
  );
}

// ── Asset Management ─────────────────────────────────────────
function AssetManagement({ assets, users, onSave, onDelete }){
  const [tab,           setTab]           = React.useState("notebook");
  const [showForm,      setShowForm]      = React.useState(false);
  const [editing,       setEditing]       = React.useState(null);
  const [search,        setSearch]        = React.useState("");
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const h = React.createElement;

  const typeAssets = assets.filter(a=>a.type===tab);
  const companies  = [...new Set(typeAssets.map(a=>a.company).filter(Boolean))].sort();

  const list = typeAssets.filter(a=>{
    const mc = companyFilter==="all" || a.company===companyFilter;
    const q  = search.toLowerCase();
    const ms = !search ||
      (a.tag||"").toLowerCase().includes(q) ||
      (a.brand||"").toLowerCase().includes(q) ||
      (a.model||"").toLowerCase().includes(q) ||
      (a.assignedUser||"").toLowerCase().includes(q) ||
      (a.company||"").toLowerCase().includes(q) ||
      (a.sector||"").toLowerCase().includes(q);
    return mc&&ms;
  });

  const nbCount = assets.filter(a=>a.type==="notebook").length;
  const mnCount = assets.filter(a=>a.type==="monitor").length;

  const switchTab = t => { setTab(t); setSearch(""); setCompanyFilter("all"); };
  const handleSave = form => {
    const id = editing ? editing.id : genAssetId();
    onSave({...form, id, type:tab});
    setShowForm(false); setEditing(null);
  };

  return h("div",null,
    h("div",{className:"tabs"},
      h("button",{className:`tab-btn${tab==="notebook"?" active":""}`,onClick:()=>switchTab("notebook")},
        h("i",{className:"ti ti-device-laptop"}),"Notebooks",
        h("span",{style:{background:"var(--blue-bg)",color:"var(--blue-t)",fontSize:11,fontWeight:600,padding:"1px 7px",borderRadius:9}},nbCount)
      ),
      h("button",{className:`tab-btn${tab==="monitor"?" active":""}`,onClick:()=>switchTab("monitor")},
        h("i",{className:"ti ti-device-desktop"}),"Monitores",
        h("span",{style:{background:"var(--purple-bg)",color:"var(--purple-t)",fontSize:11,fontWeight:600,padding:"1px 7px",borderRadius:9}},mnCount)
      )
    ),
    h("div",{className:"asset-toolbar"},
      h("div",{className:"search-bar"},
        h("span",{className:"search-bar-icon"},h("i",{className:"ti ti-search"})),
        h("input",{placeholder:"Buscar por etiqueta, marca, modelo, usuário, empresa ou setor...",
          value:search,onChange:e=>setSearch(e.target.value)}),
        search&&h("button",{className:"search-bar-clear",onClick:()=>setSearch("")},h("i",{className:"ti ti-x"}))
      ),
      h("button",{className:"btn-add-asset",onClick:()=>{setEditing(null);setShowForm(true);}},
        h("i",{className:"ti ti-plus"})," Cadastrar ",tab==="notebook"?"notebook":"monitor")
    ),
    companies.length>0&&h("div",{className:"company-filter"},
      h("span",{style:{fontSize:12,color:"var(--t3)",marginRight:4}},"Empresa:"),
      ["all",...companies].map(c=>{
        const cnt=c==="all"?typeAssets.length:typeAssets.filter(a=>a.company===c).length;
        return h("button",{key:c,className:`company-chip${companyFilter===c?" active":""}`,onClick:()=>setCompanyFilter(c)},
          c==="all"?"Todos":c,h("span",{className:"company-chip-count"},cnt));
      })
    ),
    list.length===0
      ? h("div",{className:"empty-state"},
          h("i",{className:`ti ${tab==="notebook"?"ti-device-laptop":"ti-device-desktop"}`}),
          h("p",null,search||companyFilter!=="all"?"Nenhum resultado encontrado":`Nenhum ${tab==="notebook"?"notebook":"monitor"} cadastrado ainda`))
      : h("div",{className:"asset-grid"},
          list.map(a=>h(AssetCard,{key:a.id,asset:a,type:tab,
            onEdit:a=>{setEditing(a);setShowForm(true);},
            onDelete}))),
    showForm&&h(AssetForm,{asset:editing,type:tab,users,
      onSave:handleSave,onClose:()=>{setShowForm(false);setEditing(null);}})
  );
}
