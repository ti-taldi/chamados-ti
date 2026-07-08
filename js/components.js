// ── Badge ────────────────────────────────────────────────────
function Badge({ type, label }){
  return React.createElement("span",{className:`badge badge-${type}`},label);
}

// ── ComboSelect: dropdown + free-text fallback ───────────────
function ComboSelect({ value, onChange, options, placeholder, className }){
  const cls = className || "select-field";
  const inList = options.includes(value);
  const [mode, setMode] = React.useState(value && !inList ? "custom" : "select");

  if(mode==="custom") return React.createElement("div",{style:{display:"flex",gap:6}},
    React.createElement("input",{
      type:"text", className:cls, style:{flex:1},
      value, onChange:e=>onChange(e.target.value),
      placeholder:placeholder||"Digite...", autoFocus:true,
    }),
    React.createElement("button",{
      className:"btn-icon", title:"Voltar para lista",
      style:{flexShrink:0},
      onClick:()=>{ setMode("select"); onChange(""); },
    }, React.createElement("i",{className:"ti ti-list"}))
  );

  return React.createElement("select",{
    className:cls, value,
    onChange:e=>{
      if(e.target.value==="__custom__"){ setMode("custom"); onChange(""); }
      else onChange(e.target.value);
    },
  },
    React.createElement("option",{value:""},"Selecione..."),
    options.map(o=>React.createElement("option",{key:o,value:o},o)),
    React.createElement("option",{value:"__custom__"},"✏️  Digitar outro...")
  );
}

// ── Toast notification ───────────────────────────────────────
function Toast({ msg, icon, color }){
  return React.createElement("div",{className:"toast"},
    React.createElement("i",{className:`ti ${icon}`,style:{color,fontSize:16}}),
    msg
  );
}
