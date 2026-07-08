const fs   = require("fs");
const path = require("path");

const SRC  = path.join(__dirname, "index.html");
const DEST = path.join(__dirname, ".compiled.html");

// Se já existe o arquivo compilado e o fonte não mudou, pula
if(fs.existsSync(DEST)){
  const cacheTime = fs.statSync(DEST).mtimeMs;
  const srcTime   = fs.statSync(SRC).mtimeMs;
  if(cacheTime >= srcTime){
    console.log("📦 .compiled.html já está atualizado. Pulando compilação.");
    process.exit(0);
  }
}

let Babel;
try {
  Babel = require("@babel/standalone");
} catch(e) {
  console.error("❌ @babel/standalone não encontrado. Rode: npm install");
  process.exit(1);
}

console.log("⚙️  Compilando JSX...");

const html  = fs.readFileSync(SRC, "utf8");
const START = '<script type="text/babel">';
const END   = "</script>";

const startIdx = html.indexOf(START);
// Usa indexOf a partir do startIdx em vez de lastIndexOf (muito mais seguro)
const endIdx   = html.indexOf(END, startIdx);

if(startIdx === -1 || endIdx === -1){
  console.error("❌ Bloco <script type=\"text/babel\"> ou fechamento não encontrado.");
  process.exit(1);
}

const jsxCode = html.slice(startIdx + START.length, endIdx);

let compiled;
try {
  compiled = Babel.transform(jsxCode, { presets:["react"], filename:"app.jsx" }).code;
} catch(err) {
  console.error("❌ Erro de compilação:\n" + err.message);
  process.exit(1);
}

// 1. Recorta e costura usando a string original (índices perfeitos)
let finalHTML = html.slice(0, startIdx)
  + `<script>\n${compiled}\n</script>`
  + html.slice(endIdx + END.length);

// 2. Limpa as tags do babel standalone usando Regex (para pegar qualquer variação)
finalHTML = finalHTML.replace(/<script[^>]*babel\.min\.js["'][^>]*><\/script>\s*/gi, '');

fs.writeFileSync(DEST, finalHTML, "utf8");
console.log("✅ Compilado com sucesso! → .compiled.html");
