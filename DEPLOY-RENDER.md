# Deploy no Render — Passo a Passo

## O que você vai precisar
- Conta no GitHub (gratuito) → github.com
- Conta no Render (gratuito) → render.com

---

## PARTE 1 — Criar conta e repositório no GitHub

### 1.1 Criar conta
1. Acesse **github.com** e clique em **Sign up**
2. Coloque seu e-mail, crie uma senha e nome de usuário
3. Confirme o e-mail

### 1.2 Criar repositório
1. Após fazer login, clique no **+** no canto superior direito → **New repository**
2. Nome: `chamados-ti`
3. Visibilidade: **Private** (recomendado)
4. Clique em **Create repository**

### 1.3 Fazer upload dos arquivos
Na página do repositório criado:
1. Clique em **uploading an existing file**
2. Arraste ou selecione **todos os arquivos** da pasta `chamados-ti`:
   - `index.html`
   - `server.js`
   - `build.js`
   - `package.json`
   - `render.yaml`
   - `.gitignore`
   - `.compiled.html`
   - `README.md`
   - `DEPLOY-RENDER.md`

   > ⚠️ NÃO envie: `node_modules/`, `db.json`, `email-config.json`

3. Clique em **Commit changes**

---

## PARTE 2 — Configurar no Render

### 2.1 Criar conta no Render
1. Acesse **render.com**
2. Clique em **Get Started for Free**
3. Faça login **com sua conta GitHub** (mais fácil)

### 2.2 Criar Web Service
1. No painel do Render, clique em **New +** → **Web Service**
2. Selecione **Build and deploy from a Git repository**
3. Conecte sua conta GitHub se pedido
4. Selecione o repositório `chamados-ti`
5. Clique em **Connect**

### 2.3 Configurar o serviço
Preencha os campos:

| Campo | Valor |
|---|---|
| Name | `chamados-ti` |
| Region | `Oregon (US West)` ou mais próximo |
| Branch | `main` |
| Runtime | `Node` |
| Build Command | `npm install && node build.js` |
| Start Command | `node server.js` |
| Instance Type | **Free** (ou Starter $7/mês para dados persistentes) |

6. Clique em **Create Web Service**

### 2.4 Adicionar disco persistente (IMPORTANTE)
> Sem o disco, os dados são apagados quando o servidor reinicia.
> O disco custa **$0,25/GB/mês** — praticamente gratuito.

1. No painel do serviço criado → aba **Disks**
2. Clique em **Add Disk**
3. Preencha:
   - Name: `dados`
   - Mount Path: `/var/data`
   - Size: `1 GB`
4. Clique em **Save**
5. O serviço vai reiniciar automaticamente

### 2.5 Adicionar variável de ambiente
1. Aba **Environment** no painel do serviço
2. Clique em **Add Environment Variable**
3. Adicione:
   - Key: `RENDER`
   - Value: `true`
4. Clique em **Save Changes**

---

## PARTE 3 — Primeiro acesso

Após o deploy (leva 2-5 minutos):

1. O Render gera uma URL tipo: `https://chamados-ti.onrender.com`
2. Acesse essa URL no navegador
3. Login padrão:
   - **E-mail:** `admin@ti.local`
   - **Senha:** `admin123`
4. ⚠️ Troque a senha imediatamente!

---

## Domínio personalizado (opcional)

Se quiser usar `chamados.taldi.com.br`:

1. No Render → aba **Settings** → **Custom Domains**
2. Adicione `chamados.taldi.com.br`
3. O Render mostra um registro CNAME
4. No cPanel da Hostgator → **Editor de Zona DNS**
5. Adicione o registro CNAME apontando para o endereço do Render
6. Aguarde até 24h para propagar

---

## Sobre o plano Free do Render

| Característica | Free | Starter ($7/mês) |
|---|---|---|
| App dorme após inatividade | ✅ Sim (15min) | ❌ Não |
| Disco persistente | Paga separado | Incluído |
| SSL (HTTPS) | ✅ Grátis | ✅ Grátis |
| Domínio personalizado | ✅ Sim | ✅ Sim |

> Para uso empresarial recomendo o **Starter** — o app não dorme e o primeiro acesso é sempre rápido.

---

## Atualizar o sistema

Quando houver nova versão:
1. Faça upload dos arquivos atualizados no GitHub
2. O Render detecta automaticamente e faz novo deploy
3. Os dados em `/var/data/db.json` são preservados
