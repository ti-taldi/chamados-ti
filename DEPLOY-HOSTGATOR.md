# Deploy na Hostgator (Plano Compartilhado com cPanel)

## Pré-requisitos
- Acesso ao cPanel da Hostgator
- FileZilla (FTP) ou Gerenciador de Arquivos do cPanel

---

## Passo 1 — Criar subdomínio

1. No cPanel → **Subdomínios**
2. Crie: `chamados.taldi.com.br`
   - Pasta sugerida: `public_html/chamados`
3. Clique em **Criar**

---

## Passo 2 — Upload dos arquivos

Via **Gerenciador de Arquivos** do cPanel ou FTP (FileZilla):

1. Navegue até `public_html/chamados`
2. Faça upload de **todos** estes arquivos:
   - `index.html`
   - `server.js`
   - `build.js`
   - `package.json`
   - `.compiled.html`
   - `email-config.json`
   - `README.md`

> ⚠️ NÃO envie a pasta `node_modules` — ela será criada no servidor.

---

## Passo 3 — Configurar App Node.js no cPanel

1. No cPanel → **Configurar Node.js App** (ou "Setup Node.js App")
2. Clique em **Criar aplicativo**
3. Preencha:
   - **Versão Node.js**: 18 (ou a mais recente disponível)
   - **Modo**: Production
   - **Raiz do aplicativo**: `chamados`
   - **URL do aplicativo**: `chamados.taldi.com.br`
   - **Arquivo de inicialização**: `server.js`
4. Clique em **Criar**

---

## Passo 4 — Instalar dependências

Ainda na tela do Node.js App:

1. Clique em **Executar NPM Install**
   (ou use o terminal SSH se disponível: `cd ~/public_html/chamados && npm install`)

---

## Passo 5 — Iniciar o app

1. Na tela do Node.js App → clique em **Iniciar**
2. Acesse: `https://chamados.taldi.com.br`

---

## Passo 6 — Primeiro acesso

Login padrão:
- E-mail: `admin@ti.local`
- Senha: `admin123`

⚠️ **Troque a senha imediatamente após o primeiro acesso!**

---

## Dados e backup

Os dados ficam salvos em `db.json` dentro da pasta do app.
Para backup, baixe o `db.json` periodicamente ou use a função
**Exportar** dentro do sistema.

---

## Solução de problemas

| Problema | Solução |
|---|---|
| Página não carrega | Verifique se o app Node.js está **Iniciado** no cPanel |
| Erro 503 | Reinicie o app no cPanel |
| Dados somem | Verifique se `db.json` existe na pasta |
| E-mail não envia | Configure SMTP em Configurações → E-mail |

---

## Atualizar o sistema

1. Baixe os novos arquivos
2. Faça upload substituindo os antigos (exceto `db.json` e `email-config.json`)
3. No cPanel → Node.js App → **Reiniciar**
