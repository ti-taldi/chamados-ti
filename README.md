# Sistema de Chamados TI

Sistema web de suporte técnico com gestão de chamados, patrimônio, usuários e cargos.

## Estrutura de pastas

```
chamados-ti/
├── index.html          # Página principal
├── server.js           # Servidor Node.js
├── README.md
├── css/
│   ├── base.css        # Variáveis, reset, formulários, botões
│   ├── auth.css        # Telas de login e cadastro
│   ├── layout.css      # Navbar, cabeçalho, layout de página
│   ├── components.css  # Badges, modais, tabs, campos
│   ├── tickets.css     # Cards e dashboard de chamados
│   ├── users.css       # Gestão de usuários e cargos
│   └── assets.css      # Gestão de patrimônio
└── js/
    ├── constants.js    # Dados constantes (categorias, empresas, etc.)
    ├── storage.js      # Helpers de localStorage e inicialização
    ├── utils.js        # Funções utilitárias
    ├── components.js   # Badge, ComboSelect, Toast
    ├── auth.js         # Telas de autenticação
    ├── tickets.js      # Componentes de chamados
    ├── roles.js        # Gestão de cargos
    ├── users.js        # Gestão de usuários
    ├── assets.js       # Gestão de patrimônio
    └── app.js          # App principal (estado global, handlers)
```

## Como rodar

### Requisito
[Node.js](https://nodejs.org) instalado na máquina.

### Iniciar o servidor
```bash
cd chamados-ti
node server.js
```
Acesse **http://localhost:3000** no navegador.

> ⚠️ O sistema precisa do servidor para carregar os arquivos JS/CSS separados.
> Abrir o `index.html` diretamente no navegador (duplo clique) não funcionará.

## Primeiro acesso

| Campo | Valor |
|-------|-------|
| E-mail | `admin@ti.local` |
| Senha  | `admin123` |

> Troque a senha após o primeiro acesso.

## Funcionalidades

- **Chamados**: abertura, acompanhamento, painel admin com status e prazo
- **Patrimônio**: cadastro de notebooks e monitores por empresa/setor
- **Usuários**: aprovação, cargos personalizados com controle de acesso por tela
- **Cargos**: crie cargos (ex: RH, Técnico) e defina quais telas cada um acessa
- **Exportar/Importar**: backup completo em JSON
- **Lembrar de mim**: salva credenciais para login automático

## Dados

Todos os dados ficam no `localStorage` do navegador onde o sistema roda.
Use **Exportar** regularmente para fazer backup e **Importar** para migrar entre máquinas.

## Empresas configuradas
Taldi · Solarz · MJDP · Prevfam
