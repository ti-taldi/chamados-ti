/**
 * build.js — Compila o JSX para JavaScript puro.
 * Execute: node build.js
 * Depois: node server.js
 */
const fs   = require("fs");
const path = require("path");

const SRC  = path.join(__dirname, "index.html");
const DEST = path.join(__dirname, ".compiled.html");

// ── Carrega Babel Standalone (funciona em Node.js também) ────
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
const endIdx   = html.lastIndexOf(END);

if (startIdx === -1) {
  console.error("❌ Bloco <script type=\"text/babel\"> não encontrado.");
  process.exit(1);
}

const jsxCode = html.slice(startIdx + START.length, endIdx);

let compiled;
try {
  const result = Babel.transform(jsxCode, {
    presets: ["react"],
    filename: "app.jsx",
  });
  compiled = result.code;
} catch(err) {
  console.error("❌ Erro de compilação JSX:\n" + err.message);
  process.exit(1);
}

// Monta HTML final sem a tag Babel e com JS puro
const before = html.slice(0, startIdx);
const after  = html.slice(endIdx + END.length);

const finalHTML = before
  .replace('<script src="/babel.min.js"></script>\n', '')
  .replace('<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n', '')
  + `<script>\n${compiled}\n</script>`
  + after;

fs.writeFileSync(DEST, finalHTML, "utf8");
console.log("✅ Compilado! Arquivo: .compiled.html");
console.log("   Rode agora: node server.js");
