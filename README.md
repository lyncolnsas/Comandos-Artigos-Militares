# Comandos Artigos Militares 🇧🇷

> **Plataforma Enterprise de E-Commerce Tático, Equipamentos Militares de Alta Performance & Painel Administrativo com Editor Visual (WYSIWYG)**  
> **Domínio Oficial:** [https://comandosartigosmilitares.com/](https://comandosartigosmilitares.com/)

---

## 🎖️ Sobre o Projeto

O **Comandos Artigos Militares** é um ecossistema completo para venda e gestão de artigos militares, fardamentos oficiais, camisas camufladas, coturnos de combate, coletes modulares, cutelaria e artigos de sobrevivência.

### Principais Recursos:
- **Loja Virtual de Alta Performance (Frontend SPA):** React 18 + Vite + Tailwind CSS + Animações GSAP (ScrollTrigger).
- **Backend API RESTful:** Node.js (ES Modules) + Express + Prisma ORM + SQLite (fácil portabilidade e backups).
- **Editor Visual CMS (WYSIWYG):** Personalização em tempo real de todas as seções da Landing Page com pré-visualização ao vivo.
- **Banner de Oferta Relâmpago (Flash Sale):** Banner tático com contagem regressiva em tempo real e campos 100% editáveis no CMS (Título, Chamada Laranja, Descrição e Botão CTA).
- **Catálogo com Filtros Avançados:** Filtro inteligente de **Produtos em Oferta / Desconto (`PROMO`)** e **Produtos Sem Categoria (`UNCATEGORIZED`)** para auditoria e navegação ágil.
- **Segurança de Acesso ao Painel Admin:** Autenticação JWT restrita via `/admin`, RBAC (`ADMIN`, `MANAGER`) e proteção contra exibição inadvertida de credenciais.
- **WhatsApp Bot Integrado:** Automação via `@whiskeysockets/baileys` para atendimento, status de pedidos e consultas operacionais.
- **Documentação de API Interativa:** Swagger UI disponível em `/api-docs`.

---

## 🚀 Como Iniciar no Windows

### Método Recomendado (1 Clique):
Basta dar 2 cliques no arquivo executável:
- **Iniciar tudo:** [`iniciar.bat`](iniciar.bat) (Inicia o backend na porta 3001, o frontend na porta 3000 e abre a loja no navegador).
- **Encerrar tudo:** [`parar.bat`](parar.bat) (Encerra todos os processos e libera as portas).

### Inicialização Manual via Terminal:
```bash
# 1. Instalar dependências
npm install
cd frontend && npm install && cd ..

# 2. Inicializar banco de dados
npx prisma db push
npm run seed

# 3. Executar serviços
# Terminal 1 - Backend:
node src/server.js

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

---

## 🌐 Endpoints & URLs Locais

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Loja Virtual** | [http://localhost:3000](http://localhost:3000) | Experiência de compra e vitrine dos produtos |
| **Painel Administrativo** | [http://localhost:3000/admin](http://localhost:3000/admin) | Gestão de produtos, pedidos, clientes e CMS |
| **Documentação da API (Swagger)** | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | Documentação de todos os endpoints REST |
| **Healthcheck da API** | [http://localhost:3001/api/health](http://localhost:3001/api/health) | Verificação de integridade dos serviços |

---

## 📁 Estrutura do Projeto

```text
├── .agents/                      # Configurações do Antigravity (Memória, Regras e Agentes)
│   ├── memory/                   # Registros persistentes de arquitetura e decisões
│   └── rules/                    # Regras e diretrizes do ecossistema
├── frontend/                     # Aplicação SPA React (Vite)
│   ├── src/
│   │   ├── components/           # Componentes modulares (StoreFront, AdminPanel, VisualCmsEditor, etc.)
│   │   ├── index.css             # Estilos táticos e tokens visuais
│   │   └── App.jsx               # Roteamento e orquestração do frontend
│   └── public/                   # Banners, logotipos e favicons oficiais
├── src/                          # Backend API REST (Node.js + Express)
│   ├── controllers/              # Controladores (Produtos, Seções, Upload, Auth, Pedidos)
│   ├── middlewares/              # Middlewares de segurança (JWT, Rate Limit, RBAC)
│   ├── services/                 # Serviços auxiliares (WhatsApp Bot, Backups)
│   └── server.js                 # Inicialização do servidor Express
├── prisma/                       # Modelagem de dados e schema SQLite
├── iniciar.bat                   # Script de inicialização automática
└── parar.bat                     # Script de finalização automática
```

---

## 🔒 Segurança & Boas Práticas

- Senhas administrativas são armazenadas com hash criptográfico `bcryptjs`.
- As credenciais de acesso não são expostas na tela de login administrativo (`/admin`).
- O token JWT é armazenado de forma isolada em `localStorage` com expiração configurável.
- Uploads de imagens e arquivos de mídia passam por validação de formato e sanitização de nomes.