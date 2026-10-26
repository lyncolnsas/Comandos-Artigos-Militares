import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando banco de dados completo do Comandos Artigos Militares...');

  // 1. Criar/Preservar Usuário Administrador
  const isProduction = process.env.NODE_ENV === 'production';
  const existingAdminCount = await prisma.user.count({
    where: { role: 'ADMIN' }
  });

  if (existingAdminCount > 0) {
    console.log(`🛡️ [SEGURANÇA] Administrador(es) já existem no banco (${existingAdminCount} encontrado(s)).`);
    // Atualiza o email para garantir o domínio comandosartigosmilitares.com
    await prisma.user.updateMany({
      where: { role: 'ADMIN' },
      data: { email: 'admin@comandosartigosmilitares.com' }
    });
  } else {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@comandosartigosmilitares.com').trim().toLowerCase();
    let adminRawPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    let isGenerated = false;

    if (!process.env.ADMIN_DEFAULT_PASSWORD && isProduction) {
      adminRawPassword = crypto.randomBytes(16).toString('hex');
      isGenerated = true;
    }

    const hashedPassword = await bcrypt.hash(adminRawPassword, 10);

    await prisma.user.create({
      data: {
        name: 'Administrador Geral',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('================================================================');
    console.log('🔐 [ADMIN SECURITY] Conta de Administrador criada com sucesso:');
    console.log(`👤 E-mail: ${adminEmail}`);
    if (isGenerated) {
      console.log(`🔑 Senha Segura Gerada: ${adminRawPassword}`);
    } else {
      console.log(`🔑 Senha Padrão: ${adminRawPassword}`);
    }
    console.log('================================================================');
  }

  // 2. Configuração do WhatsApp Bot Oficial
  await prisma.botConfig.upsert({
    where: { id: 'default' },
    update: {
      welcomeMessage: '🤖 *Atendimento Automático Comandos Artigos Militares*\n\nSeja bem-vindo ao nosso catálogo tático oficial!\nComo posso te ajudar?\n\n1️⃣ Ver produtos mais vendidos (Camisa Camuflada R$ 45, Coturnos e mais)\n2️⃣ Buscar produto por nome (ex: busca camuflada)\n3️⃣ Consultar status de pedido (ex: status GS-123456)\n4️⃣ Falar com atendente humano'
    },
    create: {
      id: 'default',
      isBotEnabled: true,
      whatsappNumber: '5511999998888',
      welcomeMessage: '🤖 *Atendimento Automático Comandos Artigos Militares*\n\nSeja bem-vindo ao nosso catálogo tático oficial!\nComo posso te ajudar?\n\n1️⃣ Ver produtos mais vendidos (Camisa Camuflada R$ 45, Coturnos e mais)\n2️⃣ Buscar produto por nome (ex: busca camuflada)\n3️⃣ Consultar status de pedido (ex: status GS-123456)\n4️⃣ Falar com atendente humano'
    }
  });

  // 3. Criar Todos os Módulos / Categorias Táticas
  const categoriesData = [
    {
      name: 'Vestuário & Fardamento',
      slug: 'vestuario-fardamento',
      image: '/gandola-militar.jpg',
      description: 'Camisas camufladas, gandolas, calças rip-stop e uniformes de instrução militar.'
    },
    {
      name: 'Coletes & Proteção',
      slug: 'coletes-protecao',
      image: '/colete-tatico.jpg',
      description: 'Porta-placas balísticas, coletes táticos modulares MOLLE e proteções corporais.'
    },
    {
      name: 'Calçados & Coturnos',
      slug: 'calcados-coturnos',
      image: '/coturno-tatico.jpg',
      description: 'Coturnos de operações especiais, botas impermeáveis e calçados táticos de alta tração.'
    },
    {
      name: 'Mochilas & Carga Tática',
      slug: 'mochilas-carga-tatica',
      image: '/mochila-tatica.jpg',
      description: 'Mochilas assault de 35L a 60L com sistema modular e bolsos utilitários.'
    },
    {
      name: 'Cutelaria & Sobrevivência',
      slug: 'cutelaria-sobrevivencia',
      image: '/faca-tatica.jpg',
      description: 'Facas de combate, canivetes táticos de saque rápido, pederneiras e kits de campo.'
    },
    {
      name: 'Acessórios & Insígnias',
      slug: 'acessorios-insignias',
      image: '/logo-comandos.png',
      description: 'Bordados militares, brevês, cintos táticos de guarnição, bandoleiras e luvas operacionais.'
    },
    {
      name: 'Iluminação & Óptica Tática',
      slug: 'iluminacao-optica',
      image: '/lanterna-tatica.jpg',
      description: 'Lanternas táticas de alta potência, baterias recarregáveis e relógios de sobrevivência.'
    }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image,
        description: cat.description
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description
      }
    });
    categoryMap[cat.slug] = upserted;
  }

  // 4. Cupons de Desconto Táticos
  await prisma.coupon.upsert({
    where: { code: 'COMANDOS5' },
    update: {},
    create: {
      code: 'COMANDOS5',
      discountType: 'PERCENTAGE',
      value: 5,
      minSpend: 90,
      usageLimit: 1000
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'FORCAS10' },
    update: {},
    create: {
      code: 'FORCAS10',
      discountType: 'PERCENTAGE',
      value: 10,
      minSpend: 250,
      usageLimit: 500
    }
  });

  // 5. Seções Editáveis do CMS
  const cmsSections = [
    {
      sectionKey: 'TOPBAR',
      title: 'Atendimento & Encomendas de Artigos Militares',
      subtitle: '★ 4.9/5.0 em Avaliações Oficiais',
      buttonText: 'EQUIPAMENTOS TÁTICOS & FORÇAS ESPECIAIS'
    },
    {
      sectionKey: 'HEADER',
      title: 'COMANDOS',
      subtitle: 'ARTIGOS MILITARES',
      buttonText: 'EQUIPAMENTOS TÁTICOS & DEFESA'
    },
    {
      sectionKey: 'HERO_MAIN',
      title: 'EQUIPAMENTOS TÁTICOS DE ALTA PERFORMANCE PARA OPERADORES DE ELITE',
      subtitle: 'Fardamento oficial, camisas camufladas, coturnos, coletes modulares e cutelaria de campo com despacho rápido para todo o Brasil.',
      mediaType: 'IMAGE',
      mediaUrl: '/banner-camisa-camuflada.png',
      buttonText: 'VER CATÁLOGO COMPLETO >',
      buttonLink: '#loja',
      secButtonText: 'SOLICITAR VIA WHATSAPP',
      secButtonLink: 'https://wa.me/5511999998888?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20uma%20encomenda%20na%20Comandos%20Artigos%20Militares'
    },
    {
      sectionKey: 'BESTSELLERS_HEADER',
      title: 'ARSENAL EM DESTAQUE',
      subtitle: 'Os itens operacionais mais requisitados por forças de segurança e operadores táticos.',
      buttonText: 'VER MAIS PRODUTOS',
      buttonLink: '#loja'
    },
    {
      sectionKey: 'POPULAR_CATEGORIES',
      title: 'EXPLORE NOSSOS MÓDULOS MILITARES',
      subtitle: 'Navegue por categorias especializadas em vestuário, proteção, calçados e equipamentos de campo.',
      buttonText: 'VER TODAS AS CATEGORIAS'
    },
    {
      sectionKey: 'VIDEO_FEATURE',
      title: 'ENGENHARIA E PADRÃO MILITAR',
      subtitle: 'Tecidos rip-stop, costuras duplas e materiais balísticos testados em condições extremas de solo, água e mata fechada.',
      mediaType: 'VIDEO_FILE',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      buttonText: 'CONFIRA OS TESTES DE CAMPO',
      buttonLink: '#loja'
    },
    {
      sectionKey: 'WARRIOR_PROMO',
      title: 'CAMISA CAMUFLADA SELVA',
      subtitle: 'APENAS R$ 45,00 • ENCOMENDE O SEU FARDAMENTO COM DESPACHO RÁPIDO',
      buttonText: 'FAÇA SUA ENCOMENDA >',
      buttonLink: '#loja',
      featuredLabel: 'SUPER OFERTA R$ 45'
    },
    {
      sectionKey: 'VALUE_PROPS',
      title: 'Por que escolher a Comandos Artigos Militares?',
      subtitle: 'ENVIO RÁPIDO|GARANTIA TOTAL|SUPORTE 24/7|PADRÃO MILITAR',
      buttonText: 'Despacho ágil com código de rastreamento para todo o país|30 dias para trocas e devoluções sem burocracia|Atendimento direto via WhatsApp e Bot inteligente|Equipamentos com padrão de durabilidade militar'
    },
    {
      sectionKey: 'FOOTER_CONTACT',
      title: 'COMANDOS ARTIGOS MILITARES',
      subtitle: 'Especialistas em fardamentos, camisas camufladas, coturnos operacionais e artigos de sobrevivência militar.',
      buttonText: 'WhatsApp: (11) 99999-8888|Email: contato@comandosartigosmilitares.com|Segunda a Sábado: 08h às 19h',
      featuredTitle: 'NAVEGAÇÃO RÁPIDA',
      featuredLabel: 'ATENDIMENTO',
      navLinks: 'Home:#home|Loja:#loja|Categorias:#categorias|Mídia e Vídeos:#video-feature|Ofertas:#loja',
      secTitle: 'SEGURANÇA & PAGAMENTO',
      secText: 'Transações criptografadas com chave PIX instantâneo, cartão e boleto.',
      paymentBadges: 'PIX|Cartão de Crédito|Boleto Bancário',
      copyrightText: '© 2026 COMANDOS ARTIGOS MILITARES. Todos os direitos reservados. comandosartigosmilitares.com'
    }
  ];

  for (const s of cmsSections) {
    const { sectionKey, title, subtitle, mediaType, mediaUrl, buttonText, buttonLink, ...extraFields } = s;
    const contentData = Object.keys(extraFields).length > 0 ? JSON.stringify(extraFields) : null;

    await prisma.siteSection.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle,
        buttonText,
        buttonLink: buttonLink || '#loja',
        mediaType: mediaType || 'IMAGE',
        mediaUrl: mediaUrl || '',
        contentData
      },
      create: {
        sectionKey,
        title,
        subtitle,
        buttonText,
        buttonLink: buttonLink || '#loja',
        mediaType: mediaType || 'IMAGE',
        mediaUrl: mediaUrl || '',
        contentData
      }
    });
  }

  // 6. Catálogo Completo com Todos os Módulos de Artigos Militares (Preços de Mercado Reais)
  const fullMilitaryCatalog = [
    // --- Módulo 1: Vestuário & Fardamento ---
    {
      title: 'Camisa Camuflada Selva Oficial',
      slug: 'camisa-camuflada-selva-oficial',
      description: 'Camisa camuflada tática padrão Exército Brasileiro. Tecido dry-fit respirável de secagem rápida com proteção UV50+, alta resistência para operações na selva, treinos e instrução militar.',
      price: 45.00,
      promoPrice: 45.00,
      stock: 120,
      isBestseller: true,
      categorySlug: 'vestuario-fardamento',
      mediaUrl: '/banner-camisa-camuflada.png'
    },
    {
      title: 'Gandola Tática Militar Rip-Stop Camuflada EB',
      slug: 'gandola-tatica-militar-ripstop-camuflada-eb',
      description: 'Gandola operacional de alta durabilidade confeccionada em tecido Rip-Stop militar (67% poliéster / 33% algodão). Conta com 4 bolsos táticos frontais inclinados, reforço cotovelo e velcros para identificação.',
      price: 149.90,
      promoPrice: 129.90,
      stock: 45,
      isBestseller: true,
      categorySlug: 'vestuario-fardamento',
      mediaUrl: '/gandola-militar.jpg'
    },
    {
      title: 'Calça Tática Operacional Rip-Stop 6 Bolsos',
      slug: 'calca-tatica-operacional-ripstop-6-bolsos',
      description: 'Calça tática de combate com 6 bolsos funcionais (cargo com fole, frontais e traseiros com velcro), costura dupla reforçada, joelho anatômico com compartimento para joelheira flexível.',
      price: 139.90,
      promoPrice: 119.90,
      stock: 60,
      isBestseller: true,
      categorySlug: 'vestuario-fardamento',
      mediaUrl: '/calca-tatica.jpg'
    },
    {
      title: 'Combat Shirt Tática Manga Longa Antichamas',
      slug: 'combat-shirt-tatica-manga-longa-antichamas',
      description: 'Combat Shirt projetada para ser usada sob coletes balísticos. Tronco em malha de alta absorção e mangas em Rip-Stop anti-rasgo com bolsos e painéis de velcro táticos.',
      price: 189.90,
      promoPrice: 159.90,
      stock: 35,
      isBestseller: true,
      categorySlug: 'vestuario-fardamento',
      mediaUrl: '/gandola-militar.jpg'
    },
    {
      title: 'Camiseta Tática Dry-Fit Lisa Verde Oliva / Preta',
      slug: 'camiseta-tatica-dryfit-lisa-vo-preta',
      description: 'Camiseta básica militar confeccionada em microfibra 100% poliéster texturizado com tratamento antibacteriano e secagem ultrarrápida. Essencial para treinamento físico militar (TFM).',
      price: 39.90,
      promoPrice: 34.90,
      stock: 150,
      isBestseller: false,
      categorySlug: 'vestuario-fardamento',
      mediaUrl: '/banner-camisa-camuflada.png'
    },

    // --- Módulo 2: Coletes & Proteção ---
    {
      title: 'Colete Tático Plate Carrier Modular MOLLE Spec-Ops',
      slug: 'colete-tatico-plate-carrier-modular-molle-spec-ops',
      description: 'Colete porta-placas balísticas de padrão militar internacional. Estrutura em Cordura 1000D, sistema MOLLE 360°, alça de resgate de emergência reforçada e fechos de desengate rápido.',
      price: 489.90,
      promoPrice: 429.00,
      stock: 20,
      isBestseller: true,
      categorySlug: 'coletes-protecao',
      mediaUrl: '/colete-tatico.jpg'
    },
    {
      title: 'Colete Tático Operacional Completo com Coldre e Porta-Carregadores',
      slug: 'colete-tatico-operacional-completo-coldre-portacarregadores',
      description: 'Colete tático montado com coldre universal embutido, 3 porta-carregadores de fuzil, 3 porta-carregadores de pistola, bolsa utilitária admin e porta-rádio comunicador.',
      price: 379.00,
      promoPrice: 329.90,
      stock: 28,
      isBestseller: false,
      categorySlug: 'coletes-protecao',
      mediaUrl: '/colete-tatico.jpg'
    },
    {
      title: 'Kit Joelheiras e Cotoveleiras Táticas com Shell Rígido',
      slug: 'kit-joelheiras-cotoveleiras-taticas-shell-rigido',
      description: 'Conjunto completo de proteção para operações táticas, CQB e airsoft. Concha em polímero injetado de alto impacto com acolchoamento interno em EVA e fecho de ajuste rápido.',
      price: 99.90,
      promoPrice: 79.90,
      stock: 40,
      isBestseller: false,
      categorySlug: 'coletes-protecao',
      mediaUrl: '/colete-tatico.jpg'
    },

    // --- Módulo 3: Calçados & Coturnos ---
    {
      title: 'Coturno Tático Operacional Acero Ultraleve com Zíper Lateral',
      slug: 'coturno-tatico-operacional-acero-ultraleve-ziper',
      description: 'Coturno em couro legítimo flor integral combinado com nylon balístico respirável. Solado em borracha blaqueada antiderrapante com absorção de impacto e palmilha ortopédica em gel.',
      price: 279.90,
      promoPrice: 249.90,
      stock: 35,
      isBestseller: true,
      categorySlug: 'calcados-coturnos',
      mediaUrl: '/coturno-tatico.jpg'
    },
    {
      title: 'Bota Tática Combat Assault Gore-Tex Impermeável',
      slug: 'bota-tatica-combat-assault-goretex-impermeavel',
      description: 'Bota tática impermeável para terrenos de lama, água e matas fechadas. Membrana interna respirável e travamento no tornozelo anti-torção para patrulhamento prolongado.',
      price: 389.00,
      promoPrice: 349.00,
      stock: 22,
      isBestseller: true,
      categorySlug: 'calcados-coturnos',
      mediaUrl: '/coturno-tatico.jpg'
    },
    {
      title: 'Meia Tática Militar Dry com Amortecimento Reforçado',
      slug: 'meia-tatica-militar-dry-amortecimento-reforcado',
      description: 'Meia cano médio para uso com coturno. Evita bolhas, absorve a umidade do pé e conta com compressão graduada para marcha de longa distância.',
      price: 24.90,
      promoPrice: 19.90,
      stock: 200,
      isBestseller: false,
      categorySlug: 'calcados-coturnos',
      mediaUrl: '/coturno-tatico.jpg'
    },

    // --- Módulo 4: Mochilas & Carga Tática ---
    {
      title: 'Mochila Tática Assault 3-Dias 45 Litros Militar',
      slug: 'mochila-tatica-assault-3-dias-45l-militar',
      description: 'Mochila tática de alta capacidade em poliéster 1000D resistente à água. Conta com 4 compartimentos independentes, zíperes duplos de alta densidade, fitas MOLLE e suporte para refil de hidratação.',
      price: 229.90,
      promoPrice: 189.90,
      stock: 45,
      isBestseller: true,
      categorySlug: 'mochilas-carga-tatica',
      mediaUrl: '/mochila-tatica.jpg'
    },
    {
      title: 'Bolsa Tática Transversal Shoulder Bag EDC',
      slug: 'bolsa-tatica-transversal-shoulder-bag-edc',
      description: 'Bolsa transversal de porte velado / EDC com coldre elástico interno, bolso rápido para celular, documentos, canivete e chaves. Compacta e extremamente funcional.',
      price: 89.90,
      promoPrice: 74.90,
      stock: 50,
      isBestseller: false,
      categorySlug: 'mochilas-carga-tatica',
      mediaUrl: '/mochila-tatica.jpg'
    },
    {
      title: 'Mochila Cargueira Militar Expedição 65 Litros',
      slug: 'mochila-cargueira-militar-expedicao-65l',
      description: 'Mochila de grande porte para acampamentos, travessias e sobrevivência na selva. Estrutura interna em alumínio com regulagem de altura e capa de chuva camuflada inclusa.',
      price: 369.00,
      promoPrice: 319.00,
      stock: 18,
      isBestseller: false,
      categorySlug: 'mochilas-carga-tatica',
      mediaUrl: '/mochila-tatica.jpg'
    },

    // --- Módulo 5: Cutelaria & Sobrevivência ---
    {
      title: 'Faca Tática de Combate Militar com Bainha Rígida',
      slug: 'faca-tatica-combate-militar-bainha-rigida',
      description: 'Lâmina Full Tang em aço inox 440C com revestimento preto antirreflexo fosco. Cabo ergonômico texturizado antiderrapante e bainha tática ambidestra com fixação no cinto ou colete.',
      price: 159.90,
      promoPrice: 139.90,
      stock: 30,
      isBestseller: true,
      categorySlug: 'cutelaria-sobrevivencia',
      mediaUrl: '/faca-tatica.jpg'
    },
    {
      title: 'Canivete Tático com Abertura Assistida e Quebra-Vidro',
      slug: 'canivete-tatico-abertura-assistida-quebra-vidro',
      description: 'Canivete tático de resgate e emergência com lâmina semi-serrilhada, abertura por mola (flipper), trava liner lock, clipe de bolso, corta-cintos e ponta quebra-vidros.',
      price: 79.90,
      promoPrice: 65.00,
      stock: 65,
      isBestseller: true,
      categorySlug: 'cutelaria-sobrevivencia',
      mediaUrl: '/faca-tatica.jpg'
    },
    {
      title: 'Pederneira Magnésio Militar com Apito de Resgate',
      slug: 'pederneira-magnesio-militar-apito-resgate',
      description: 'Iniciador de fogo à prova de água e vento. Barra de magnésio com raspador em régua graduada e apito de emergência de alta intensidade sonora (120dB).',
      price: 29.90,
      promoPrice: 22.90,
      stock: 120,
      isBestseller: false,
      categorySlug: 'cutelaria-sobrevivencia',
      mediaUrl: '/faca-tatica.jpg'
    },

    // --- Módulo 6: Acessórios & Insígnias ---
    {
      title: 'Cinto Tático Militar Riggers Belt com Fivela de Metal Rápida',
      slug: 'cinto-tatico-militar-riggers-belt-fivela-metal',
      description: 'Cinto de guarnição confeccionado em fita de nylon balístico de 38mm com trama densa. Fivela tática de pressão em liga de zinco com desengate instantâneo.',
      price: 69.90,
      promoPrice: 59.90,
      stock: 80,
      isBestseller: true,
      categorySlug: 'acessorios-insignias',
      mediaUrl: '/cinto-tatico.jpg'
    },
    {
      title: 'Luvas Táticas Operacionais Meio-Dedo com Proteção nos Nós',
      slug: 'luvas-taticas-operacionais-meio-dedo-protecao',
      description: 'Luvas táticas de alta sensibilidade e aderência com proteção termoplástica nos nós dos dedos, palma anti-impacto e fecho em velcro no punho.',
      price: 59.90,
      promoPrice: 49.90,
      stock: 70,
      isBestseller: true,
      categorySlug: 'acessorios-insignias',
      mediaUrl: '/luvas-taticas.jpg'
    },
    {
      title: 'Bandoleira Tática 2 Pontos com Engate Rápido e Acolchoamento',
      slug: 'bandoleira-tatica-2-pontos-engate-rapido-acolchoada',
      description: 'Bandoleira militar regulável com acolchoamento para alívio de peso no ombro, fechos tipo fastex para desengate rápido e fitas reforçadas em poliamida.',
      price: 75.00,
      promoPrice: 62.00,
      stock: 55,
      isBestseller: false,
      categorySlug: 'acessorios-insignias',
      mediaUrl: '/cinto-tatico.jpg'
    },
    {
      title: 'Patch Emborrachado Comandos Artigos Militares com Velcro',
      slug: 'patch-emborrachado-comandos-artigos-militares-velcro',
      description: 'Patch militar emborrachado em alto relevo 3D com o brasão oficial da Comandos Artigos Militares. Fixação padrão velcro macho para gandolas, coletes e mochilas.',
      price: 25.00,
      promoPrice: 20.00,
      stock: 150,
      isBestseller: true,
      categorySlug: 'acessorios-insignias',
      mediaUrl: '/logo-comandos.png'
    },

    // --- Módulo 7: Iluminação & Óptica ---
    {
      title: 'Lanterna Tática LED T6 Recarregável com Zoom e Bateria',
      slug: 'lanterna-tatica-led-t6-recarregavel-zoom-bateria',
      description: 'Lanterna tática em alumínio de alta resistência aeroespacial, resistente a quedas e respingos de chuva (IPX6). Foco com zoom ajustável de 1x a 2000x e 5 modos de iluminação.',
      price: 89.90,
      promoPrice: 74.90,
      stock: 60,
      isBestseller: true,
      categorySlug: 'iluminacao-optica',
      mediaUrl: '/lanterna-tatica.jpg'
    },
    {
      title: 'Smartwatch Militar Tático GPS & Sensores Físicos',
      slug: 'smartwatch-militar-tatico-gps-sensores-fisicos',
      description: 'Relógio inteligente de nível militar MIL-STD-810H resistente a impactos extremos, poeira e imersão em água. Monitor cardíaco, oxímetro, bússola eletrônica e bateria de 15 dias.',
      price: 499.00,
      promoPrice: 399.00,
      stock: 15,
      isBestseller: true,
      categorySlug: 'iluminacao-optica',
      mediaUrl: '/lanterna-tatica.jpg'
    }
  ];

  for (const prod of fullMilitaryCatalog) {
    const category = categoryMap[prod.categorySlug];
    const categoryId = category ? category.id : null;

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
      include: { media: true }
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: prod.slug },
        data: {
          title: prod.title,
          description: prod.description,
          price: prod.price,
          promoPrice: prod.promoPrice,
          stock: prod.stock,
          isBestseller: prod.isBestseller,
          categoryId
        }
      });
      // Garante que a imagem principal está correta
      if (existing.media.length > 0) {
        await prisma.productMedia.update({
          where: { id: existing.media[0].id },
          data: { url: prod.mediaUrl, isPrimary: true }
        });
      } else {
        await prisma.productMedia.create({
          data: {
            productId: existing.id,
            url: prod.mediaUrl,
            isPrimary: true,
            type: 'IMAGE'
          }
        });
      }
    } else {
      await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          promoPrice: prod.promoPrice,
          stock: prod.stock,
          isBestseller: prod.isBestseller,
          categoryId,
          media: {
            create: [
              {
                type: 'IMAGE',
                url: prod.mediaUrl,
                isPrimary: true
              }
            ]
          }
        }
      });
    }
  }

  console.log(`✅ Catálogo do Comandos Artigos Militares semeado com sucesso (${fullMilitaryCatalog.length} produtos em 7 módulos táticos)!`);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
