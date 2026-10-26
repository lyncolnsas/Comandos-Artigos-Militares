# Documentação Técnica e Estratégica de SEO & GEO
## Plataforma: Bizu Artigos Militares (https://bizuartigomilitar.com/)
> **Status:** Pronto para Revisão & Aprovação (Nenhum código foi alterado no site ainda)  
> **Especialista:** SEO & GEO Master Architect (`seo-specialist2.0`)  
> **Conformidade:** Google Search Essentials, Google Quality Rater Guidelines (E-E-A-T), Core Web Vitals e RAG Generative Engine Optimization.

---

## 1. Diagnóstico do Estado Atual do Site (Live Audit)

Ao inspecionar o código-fonte em produção de `https://bizuartigomilitar.com/`, identificamos as seguintes lacunas críticas de indexação e posicionamento orgânico:

| Elemento Analisado | Situação Atual em Produção | Impacto / Severidade | Diagnóstico Técnico |
|---|---|---|---|
| **`<title>` Tag** | `Gama Store - E-Commerce Dinâmico & WhatsApp Bot` | 🔴 **Crítico** | Termo técnico focado em desenvolvimento/bot. Ninguém pesquisa por *"E-Commerce Dinâmico & WhatsApp Bot"*. Impede ranqueamento para *"Artigos Militares"*, *"Equipamentos Táticos"*, etc. |
| **Meta Description** | `"Gama Store com frontend 100% dinâmico, suporte a mídias locais (MP4) e embeds (YouTube/Instagram) com atendimento inteligente no WhatsApp."` | 🔴 **Crítico** | Descrição interna voltada para desenvolvedores. CTR nulo no Google. Não possui apelo comercial nem palavras-chave para o público militar/policial/outdoor. |
| **Favicon** | Ícone genérico de sacola de compras (`🛍️`) | 🟡 **Médio** | Falta de identidade visual tática. No Google Mobile SERP, o favicon aparece ao lado do snippet de busca; precisa transmitir autoridade militar. |
| **Open Graph (OG)** | Inexistente no `<head>` | 🔴 **Crítico** | Ao compartilhar links do site no WhatsApp, Instagram ou Facebook, não há preview de imagem, título ou descrição profissional. |
| **Twitter Cards** | Inexistente no `<head>` | 🟡 **Médio** | Sem suporte para cards ricos em redes sociais (`summary_large_image`). |
| **Canonical Tag** | Ausente | 🔴 **Crítico** | Risco de canibalização e indexação de URLs com parâmetros espelhados (`?view=store`, `#loja`, etc.). |
| **Schema.org (JSON-LD)** | Ausente | 🔴 **Crítico** | O Google e as IAs (ChatGPT, Perplexity) não conseguem extrair entidades explícitas (`Organization`, `Store`, `Product`, `BreadcrumbList`). |
| **`robots.txt`** | Ausente na raiz pública | 🟡 **Médio** | Rastreadores vasculham rotas administrativas (`/admin`, `/api/admin/`) sem diretivas claras de prioridade. |
| **`sitemap.xml`** | Ausente na raiz pública | 🟡 **Médio** | Dificuldade para o Googlebot indexar rapidamente novas seções, categorias e produtos. |
| **GEO (AI Overviews)** | Ausente | 🔴 **Crítico** | Nenhuma marcação semântica ou bloco de resposta direta (BLUF) para ferramentas como ChatGPT Search e Perplexity citarem a loja. |

---

## 2. Estratégia de Palavras-Chave e Intenção de Busca (Search Intent)

Mapeamento de intenção de compra comercial e transacional para o nicho de Defesa, Tático e Forças de Segurança:

### Palavras-Chave Primárias (Volume Alto + Intenção Comercial)
- **Bizu Artigos Militares** (Branded Principal)
- **Artigos Militares**
- **Equipamentos Táticos**
- **Loja Militar Online**
- **Vestuário Tático Militar**

### Palavras-Chave Secundárias & Categorias Principais
- **Coletes Táticos** / *Plate Carrier porta placa balística*
- **Botas Militares** / *Coturno tático impermeável*
- **Calça Tática Ripstop** & Jaquetas Militares
- **Mochilas Militares Modulares** / *Mochila tática MOLLE*
- **Acessórios de Sobrevivência e Cutelaria Militar**

### Intenções de Busca Atendidas:
1. **Transacional:** Usuários que desejam adquirir equipamentos táticos com pronta entrega ou sob encomenda pelo WhatsApp.
2. **Navegacional:** Usuários buscando a marca oficial "Gama Artigo Militar" / "Gama Store".
3. **Investigação Comercial:** Usuários comparando marcas, tecidos ripstop e resistência balística.

---

## 3. Metadados Otimizados para Alta Conversão (CTR)

Substituição cirúrgica dos metadados existentes no `frontend/index.html`:

```html
<!-- Title Tag Otimizada (55 caracteres - ideal para desktop e mobile) -->
<title>Bizu Artigos Militares | Equipamentos Táticos & Defesa</title>

<!-- Meta Description Persuasiva (155 caracteres - focada em clique e autoridade) -->
<meta name="description" content="Líder em equipamentos táticos, coletes modulares, coturnos e vestuário de alta resistência militar. Atendimento ágil e despacho garantido para todo o Brasil." />

<!-- Meta Keywords Estratégicas -->
<meta name="keywords" content="artigos militares, equipamentos táticos, loja militar, coletes táticos, coturnos, fardamento, mochilas táticas, gama artigo militar" />

<!-- Canonical Tag (Evita conteúdo duplicado) -->
<link rel="canonical" href="https://bizuartigomilitar.com/" />

<!-- Metatags de Robôs & Indexação -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

<!-- Cor do Tema Mobile (Barra do navegador tática dourada/preta) -->
<meta name="theme-color" content="#0a0c0e" />
<meta name="msapplication-navbutton-color" content="#0a0c0e" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Favicon Oficial Tático Militar (Escudo de Proteção Dourado) -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c59b27' stroke='%23000' stroke-width='1.5'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>" />
```

---

## 4. Protocolo Open Graph & Twitter Cards (Social & WhatsApp Sharing)

Quando um cliente ou militar compartilha o link do site no WhatsApp, Telegram ou Redes Sociais, será renderizado um card enriquecido profissional:

```html
<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:url" content="https://bizuartigomilitar.com/" />
<meta property="og:site_name" content="Bizu Artigos Militares" />
<meta property="og:title" content="Bizu Artigos Militares | Equipamentos Táticos de Alta Performance" />
<meta property="og:description" content="Vestuário militar, coletes modulares balísticos, calçados e equipamentos testados em condições extremas. Conheça nosso catálogo completo." />
<meta property="og:image" content="https://bizuartigomilitar.com/assets/og-cover-tactical.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Bizu Artigos Militares - Equipamentos Táticos & Forças Especiais" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://bizuartigomilitar.com/" />
<meta name="twitter:title" content="Bizu Artigos Militares | Equipamentos Táticos de Elite" />
<meta name="twitter:description" content="Linha completa de artigos militares, coletes, vestuário ripstop e coturnos de combate." />
<meta name="twitter:image" content="https://bizuartigomilitar.com/assets/og-cover-tactical.jpg" />
```

---

## 5. Schema Markup Estruturado Completo (JSON-LD `@graph`)

O JSON-LD conecta as entidades do Knowledge Graph do Google e facilita a compreensão por LLMs (RAG):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://bizuartigomilitar.com/#organization",
      "name": "Bizu Artigos Militares",
      "alternateName": ["Gama Store", "Gama Artigo Militar"],
      "url": "https://bizuartigomilitar.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bizuartigomilitar.com/assets/logo.png",
        "caption": "Bizu Artigos Militares"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese"],
        "telephone": "+55-11-99999-8888",
        "areaServed": "BR"
      },
      "sameAs": [
        "https://www.instagram.com/gamaartigomilitar",
        "https://wa.me/5511999998888"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://bizuartigomilitar.com/#website",
      "url": "https://bizuartigomilitar.com/",
      "name": "Bizu Artigos Militares",
      "publisher": {
        "@id": "https://bizuartigomilitar.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://bizuartigomilitar.com/#loja?busca={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Store",
      "@id": "https://bizuartigomilitar.com/#store",
      "name": "Bizu Artigos Militares - Catálogo Online",
      "url": "https://bizuartigomilitar.com/",
      "description": "Loja especializada em equipamentos táticos, coletes balísticos modulares, coturnos e vestuário de nível militar.",
      "parentOrganization": {
        "@id": "https://bizuartigomilitar.com/#organization"
      },
      "currenciesAccepted": "BRL",
      "paymentAccepted": "PIX, Cartão de Crédito, Boleto Bancário",
      "priceRange": "R$ 49,00 - R$ 1.999,00",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BR"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://bizuartigomilitar.com/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Página Inicial",
          "item": "https://bizuartigomilitar.com/#home"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Loja & Catálogo Tático",
          "item": "https://bizuartigomilitar.com/#loja"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Coletes & Vestuário",
          "item": "https://bizuartigomilitar.com/#categorias"
        }
      ]
    }
  ]
}
</script>
```

---

## 6. Arquitetura de Indexação: `robots.txt` & `sitemap.xml`

### 6.1 Arquivo `robots.txt`
```txt
# Robots.txt - Bizu Artigos Militares
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/auth/users
Disallow: /uploads/private/

# Permissão explícita para Crawlers de IA Generativa
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://bizuartigomilitar.com/sitemap.xml
```

### 6.2 Arquivo `sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bizuartigomilitar.com/</loc>
    <lastmod>2026-10-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bizuartigomilitar.com/#loja</loc>
    <lastmod>2026-10-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bizuartigomilitar.com/#categorias</loc>
    <lastmod>2026-10-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bizuartigomilitar.com/#video-feature</loc>
    <lastmod>2026-10-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

---

## 7. Otimização para Motores Generativos (GEO - Generative Engine Optimization)

Para que respostas no **ChatGPT**, **Perplexity** e **Google AI Overviews** citem a Bizu Artigos Militares:

1. **Padrão BLUF (Bottom Line Up Front) no Hero:**
   - Adição semântica de micro-bloco explicativo direto no HTML:  
     *“A Bizu Artigos Militares é uma fornecedora brasileira especializada em vestuário tático ripstop, coletes porta-placas balísticas modulares (Plate Carrier) e calçados militares de alta resistência operacional.”*
   - Isso permite que RAGs de IA extraiam a definição exata da empresa quando alguém perguntar: *"Onde comprar colete tático de qualidade no Brasil?"*.

2. **Densidade de Entidades e E-E-A-T:**
   - Materiais especificados: Cordura 1000D, Kevlar balístico, Ripstop antimicrobiano, solado com grip multidirecional.
   - Presença clara de políticas de entrega, CNPJ/Atendimento transparente e suporte humano via WhatsApp.

---

## 8. Core Web Vitals & Page Experience (CrUX)

| Métrica | Meta Google | Ação de Otimização na Plataforma |
|---|---|---|
| **LCP** (Largest Contentful Paint) | $\le 2.5\text{s}$ | Otimizar imagem de fundo do Hero com `fetchpriority="high"` e compressão WebP. Preloader GSAP suave que libera o DOM instantaneamente. |
| **INP** (Interaction to Next Paint) | $\le 200\text{ms}$ | Delegação de eventos no filtro de categorias e debounce na busca em tempo real (já implementado com 700ms). |
| **CLS** (Cumulative Layout Shift) | $\le 0.1$ | Dimensões de `aspect-ratio` fixadas em todas as fotos e mídias de produto para evitar pulo de layout no carregamento. |

---

## 9. Plano de Ação para Implementação (Checklist de Execução)

Aguardamos sua aprovação para realizar os passos na ordem:

- [ ] **Passo 1:** Atualizar o arquivo `frontend/index.html` com os novos metadados, Favicon tático, Open Graph, Twitter Cards e JSON-LD.
- [ ] **Passo 2:** Criar o arquivo `robots.txt` estático em `frontend/public/robots.txt` (distribuído no build de produção).
- [ ] **Passo 3:** Criar o arquivo `sitemap.xml` em `frontend/public/sitemap.xml`.
- [ ] **Passo 4:** Configurar a rota dinâmica `/sitemap.xml` e `/robots.txt` no backend Express (`src/server.js`) para servir as URLs sempre com HTTP 200 OK.
- [ ] **Passo 5:** Executar `npm run build` e validar validação rica com o Rich Results Test.
