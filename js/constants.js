const CATS = [
  { id:"internet", label:"Internet / Rede",  icon:"ti-wifi" },
  { id:"notebook", label:"Notebook / PC",     icon:"ti-device-laptop" },
  { id:"monitor",  label:"Monitor / Tela",    icon:"ti-device-desktop" },
  { id:"infra",    label:"Infraestrutura",    icon:"ti-server" },
  { id:"outro",    label:"Outro",             icon:"ti-tool" },
];
const PRIORITIES = [
  { id:"critica", label:"Crítica" },
  { id:"alta",    label:"Alta" },
  { id:"media",   label:"Média" },
  { id:"baixa",   label:"Baixa" },
];
const STATUSES = [
  { id:"aguardando", label:"Aguardando Análise" },
  { id:"andamento",  label:"Em Andamento" },
  { id:"concluido",  label:"Concluído" },
];
const COMPANIES      = ["Taldi","Solarz","MJDP","Prevfam"];
const NOTEBOOK_BRANDS = ["Dell","HP","Lenovo","Apple","Asus","Acer","Samsung","Microsoft"];
const MONITOR_BRANDS  = ["Dell","Samsung","LG","AOC","Asus","Acer","HP","Philips","BenQ"];
const ASSET_STATUS    = [
  { id:"ativo",      label:"Ativo" },
  { id:"manutencao", label:"Em manutenção" },
  { id:"inativo",    label:"Inativo" },
];
const RAM_OPTS   = ["4 GB","8 GB","16 GB","32 GB","64 GB"];
const STOR_OPTS  = ["128 GB SSD","256 GB SSD","512 GB SSD","1 TB SSD","1 TB HD","2 TB HD"];
const RES_OPTS   = ["1280x720","1920x1080 (Full HD)","2560x1440 (2K)","3840x2160 (4K)"];
const PANEL_OPTS = ["IPS","VA","TN","OLED"];

// Telas disponíveis para controle de acesso por cargo
const SCREENS = [
  { id:"form",       label:"Novo Chamado",       icon:"ti-plus" },
  { id:"dashboard",  label:"Painel de Chamados",  icon:"ti-layout-dashboard" },
  { id:"patrimonio", label:"Patrimônio",          icon:"ti-devices" },
  { id:"mine",       label:"Meus Chamados",       icon:"ti-ticket" },
];

// Cargos padrão do sistema (não podem ser excluídos)
const DEFAULT_ROLES = [
  { id:"role-admin", name:"Administrador", permissions:["form","dashboard","patrimonio","mine"], isSystem:true, color:"purple" },
  { id:"role-user",  name:"Padrão",        permissions:["form","mine"],                          isSystem:true, color:"blue"   },
];
