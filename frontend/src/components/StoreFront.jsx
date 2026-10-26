import React, { useState, useEffect, useRef, useMemo } from 'react';
import MediaViewer from './MediaViewer';
import ProductDetailModal from './ProductDetailModal';
import { 
  ShoppingBag, Star, ShieldCheck, Phone, Truck, RefreshCw, Award, MessageCircle, 
  User, LogOut, Heart, Search, ChevronDown, ChevronUp, Layers, Check, Clock, 
  Sparkles, X, Tag, FolderTree, Edit, ArrowRight, ArrowLeft, Filter, SlidersHorizontal,
  Zap, Lock, Headphones, Shield, Compass, ChevronRight, Mail, Instagram, Facebook,
  Youtube, Twitter, Send, Leaf, RotateCcw
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { renderSocialIcon, parseSocialNetworks } from '../utils/socialHelpers';

gsap.registerPlugin(ScrollTrigger);

// Helper para parsear os 4 Diferenciais Táticos com suporte a campos individuais ou strings com pipes
const parseValueProps = (valSection) => {
  const fallbackTitles = ['ENVIO RÁPIDO', 'GARANTIA TOTAL', 'SUPORTE 24/7', 'PADRÃO MILITAR'];
  const fallbackDescs = [
    'Entrega garantida para todo o Brasil',
    '30 dias para trocas e devoluções sem complicação',
    'Atendimento especializado via WhatsApp e Bot',
    'Equipamentos testados e homologados para operações'
  ];
  const fallbackIcons = [Truck, RotateCcw, Headphones, ShieldCheck];
  const iconLookup = {
    Truck, ShieldCheck, RefreshCw, Award, Zap, Lock, Headphones, Star, Shield, RotateCcw, Leaf
  };

  const rawTitles = (valSection?.subtitle || '').split('|');
  const rawDescs = (valSection?.buttonText || '').split('|');

  return [0, 1, 2, 3].map((idx) => {
    const num = idx + 1;
    const title = valSection?.[`prop${num}_title`] || rawTitles[idx] || fallbackTitles[idx];
    const desc = valSection?.[`prop${num}_desc`] || rawDescs[idx] || fallbackDescs[idx];
    const iconName = valSection?.[`prop${num}_icon`];
    const Icon = (iconName && iconLookup[iconName]) || fallbackIcons[idx] || ShieldCheck;
    return { title, desc, Icon };
  });
};

// Wrapper para seções editáveis no CMS
const EditableSection = ({ sectionKey, isCmsMode, onEditSection, children, className = '' }) => {
  if (!isCmsMode) return <div className={className}>{children}</div>;

  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if(onEditSection) onEditSection(sectionKey);
      }}
    >
      <div className="absolute inset-0 z-30 pointer-events-none group-hover:border-[3px] group-hover:border-forest-600 group-hover:bg-forest-600/10 transition-all rounded" />
      <button
        type="button"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40 bg-forest-700 text-white px-3 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 pointer-events-none flex items-center justify-center gap-1.5 font-sans tracking-wider text-xs font-bold"
      >
        <Edit className="w-3.5 h-3.5" /> <span className="hidden sm:inline">EDITAR SEÇÃO</span>
      </button>
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default function StoreFront({ 
  onOpenCart, 
  onOpenAuth, 
  onAddToCart, 
  cartCount = 0,
  currentUser,
  onLogout,
  isCmsMode = false,
  cmsSections = null,
  onEditSection = null,
  onSelectProductSlot = null
}) {
  // Navegação entre Modos: 'LANDING' (Home Estilo TrailPeak / Outdoor) vs 'STORE' (Catálogo Completo)
  const [activeView, setActiveView] = useState(() => {
    if (isCmsMode) return 'LANDING';
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#loja' || hash === '#catalogo' || hash === '#store' || hash === '#produtos' || hash === '#bestsellers') {
        return 'STORE';
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'store') return 'STORE';
      return 'LANDING';
    } catch (e) {
      return 'LANDING';
    }
  });

  // Filtro de apenas produtos em oferta
  const [filterOnlyPromos, setFilterOnlyPromos] = useState(false);

  // Aba ativa na seção Arsenal em Destaque (ALL, NOVIDADES, MAIS_VENDIDOS, COLECOES)
  const [activeArsenalTab, setActiveArsenalTab] = useState('ALL');

  // Alternar o filtro de ofertas
  const handleTogglePromosFilter = () => {
    if (activeView !== 'STORE') {
      setActiveView('STORE');
      setFilterOnlyPromos(true);
      setSelectedCategoryId('ALL');
      try { window.history.pushState(null, '', '#loja'); } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFilterOnlyPromos(prev => !prev);
    }
  };

  // Transição suave para a Loja Dedicada
  const goToStore = (categoryId = null, onlyPromos = false) => {
    setActiveView('STORE');
    if (categoryId) {
      setSelectedCategoryId(categoryId);
      setFilterOnlyPromos(false);
    } else if (onlyPromos) {
      setFilterOnlyPromos(true);
      setSelectedCategoryId('ALL');
    }
    try {
      window.history.pushState(null, '', '#loja');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Transição suave para a Landing Page (Apresentação)
  const goToLanding = (targetSectionId = null) => {
    setActiveView('LANDING');
    try {
      window.history.pushState(null, '', targetSectionId ? `#${targetSectionId}` : '#home');
    } catch (e) {}
    if (targetSectionId) {
      setTimeout(() => {
        document.getElementById(targetSectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navegação Inteligente por Link
  const handleNavigateLink = (link) => {
    if (!link || link === '#loja' || link === '#store' || link === '#catalogo' || link === '#produtos' || link === '#bestsellers') {
      goToStore();
      return;
    }
    if (link === '#ofertas' || link === '#promocao' || link === '#flash-sale') {
      goToStore(null, true);
      return;
    }
    if (link.startsWith('category:')) {
      const catId = link.replace('category:', '');
      goToStore(catId);
      return;
    }
    if (link.startsWith('product:')) {
      const prodId = link.replace('product:', '');
      const foundProduct = products.find(p => String(p.id) === String(prodId));
      if (foundProduct) {
        setActiveProductForModal(foundProduct);
        setIsDetailModalOpen(true);
      }
      return;
    }
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('wa.me')) {
      const targetUrl = link.startsWith('wa.me') ? `https://${link}` : link;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (link.startsWith('#')) {
      const sectionId = link.replace('#', '');
      goToLanding(sectionId);
      return;
    }
    goToStore();
  };

  // Suporte aos botões Voltar/Avançar do navegador
  useEffect(() => {
    if (isCmsMode) return;
    const handleHashOrPopState = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#loja' || hash === '#catalogo' || hash === '#store' || hash === '#produtos' || hash === '#bestsellers') {
        setActiveView('STORE');
      } else {
        setActiveView('LANDING');
      }
    };
    window.addEventListener('popstate', handleHashOrPopState);
    window.addEventListener('hashchange', handleHashOrPopState);
    return () => {
      window.removeEventListener('popstate', handleHashOrPopState);
      window.removeEventListener('hashchange', handleHashOrPopState);
    };
  }, [isCmsMode]);

  // Seções CMS Padrão
  const [localSections, setLocalSections] = useState({
    TOPBAR: {
      title: 'Frete Grátis acima de R$ 250 • Despacho Imediato',
      subtitle: 'Prontidão Operacional & Garantia Total',
      buttonText: 'SUPORTE WHATSAPP 24/7'
    },
    HEADER: {
      title: 'COMANDOS',
      subtitle: 'ARTIGOS MILITARES',
      buttonText: 'EQUIPAMENTOS TÁTICOS & DEFESA'
    },
    HERO_MAIN: {
      title: 'EQUIPAMENTOS DE HOJE PARA MISSÕES MAIORES AMANHÃ',
      subtitle: 'Descubra fardamentos de alta resistência, camisas camufladas oficiais, coletes modulares e cutelaria de campo projetados para operadores e aventureiros.',
      mediaType: 'IMAGE',
      mediaUrl: '/hero-landscape.jpg',
      buttonText: 'EXPLORAR EQUIPAMENTOS >',
      buttonLink: '#loja',
      featuredLabel: 'A AVENTURA VIVE AQUI'
    },
    BESTSELLERS_HEADER: {
      title: 'EQUIPAMENTOS EM DESTAQUE',
      subtitle: 'Os itens operacionais mais solicitados com garantia de entrega para todo o Brasil.'
    },
    VIDEO_FEATURE: {
      title: 'ENGENHARIA E RESISTÊNCIA MILITAR DE ALTA PERFORMANCE',
      subtitle: 'Desenvolvidos com base nos padrões mais exigentes das forças especiais. Nossos equipamentos combinam mobilidade, resistência balística e praticidade no campo de operação.',
      mediaType: 'IMAGE',
      mediaUrl: '/colete-tatico.jpg',
      buttonText: 'EXPLORAR EQUIPAMENTOS >',
      buttonLink: '#loja',
      featuredLabel: 'TESTADO EM MISSÃO'
    },
    WARRIOR_PROMO: {
      title: 'CAMISA CAMUFLADA SELVA',
      featuredTitle: 'Até 40% OFF nos Melhores Equipamentos Táticos',
      subtitle: 'APENAS R$ 45,00 • ENCOMENDE O SEU',
      buttonText: 'FAÇA SUA ENCOMENDA >',
      buttonLink: '#loja',
      featuredLabel: 'TERMINA EM'
    },
    POPULAR_CATEGORIES: {
      title: 'COLEÇÕES EM DESTAQUE',
      subtitle: 'Navegue pelas principais categorias e módulos táticos de nossa linha.',
      mediaUrl: '/hero-landscape.jpg',
      buttonText: 'VER TODAS AS CATEGORIAS',
      buttonLink: '#loja'
    },
    VALUE_PROPS: {
      title: 'POR QUE ESCOLHER A COMANDOS ARTIGOS MILITARES?',
      subtitle: 'ENVIO RÁPIDO|GARANTIA TOTAL|SUPORTE 24/7|PADRÃO MILITAR',
      buttonText: 'Entrega garantida para todo o Brasil|30 dias para trocas e devoluções sem burocracia|Atendimento direto via WhatsApp e Bot inteligente|Equipamentos com padrão de durabilidade militar'
    },
    FOOTER_CONTACT: {
      title: 'COMANDOS ARTIGOS MILITARES',
      subtitle: 'Especialistas em fardamentos oficiais, camisas camufladas, coturnos táticos e artigos de sobrevivência militar.',
      featuredTitle: 'NAVEGAÇÃO RÁPIDA',
      featuredLabel: 'ATENDIMENTO',
      secTitle: 'SEGURANÇA & PAGAMENTO',
      secText: 'Ambiente 100% seguro com criptografia de ponta a ponta.',
      buttonText: 'WhatsApp: (11) 99999-8888|Email: contato@comandosartigosmilitares.com|Segunda a Sábado: 08h às 19h',
      navLinks: 'Home:#home|Loja:#loja|Categorias:#categorias|Coleções:#colecoes|Ofertas:#flash-sale',
      paymentBadges: 'PIX|Cartão de Crédito|Boleto Bancário',
      copyrightText: '© 2026 COMANDOS ARTIGOS MILITARES. Todos os direitos reservados. comandosartigosmilitares.com'
    }
  });

  const sections = useMemo(() => {
    if (isCmsMode && cmsSections) {
      const map = {};
      cmsSections.forEach(s => {
        map[s.sectionKey] = {
          ...(localSections[s.sectionKey] || {}),
          ...s,
          featuredLabel: s.featuredLabel !== undefined ? s.featuredLabel : (localSections[s.sectionKey]?.featuredLabel || '')
        };
      });
      return { ...localSections, ...map };
    }
    return localSections;
  }, [isCmsMode, cmsSections, localSections]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeWhatsapp, setStoreWhatsapp] = useState('5599991561407');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const selectedCategoryName = selectedCategoryId === 'ALL' 
    ? 'Todas as Categorias' 
    : (categories.find(c => c.id === selectedCategoryId)?.name || 'Categoria');
  
  // Modal de Detalhes & Seleção de Tamanhos do Produto
  const [activeProductForModal, setActiveProductForModal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pesquisa em Tempo Real
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Contagem regressiva da Flash Sale (12h 36m 28s)
  const [flashTime, setFlashTime] = useState({ hrs: 12, mins: 36, secs: 28 });
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 12, mins: 36, secs: 28 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [secRes, catRes, prodRes, botRes] = await Promise.all([
          fetch('/api/sections').catch(() => null),
          fetch('/api/categories').catch(() => null),
          fetch('/api/products').catch(() => null),
          fetch('/api/bot/public-config').catch(() => null)
        ]);

        if (botRes && botRes.ok) {
          const botData = await botRes.json();
          if (botData?.whatsappNumber && isMounted) {
            setStoreWhatsapp(botData.whatsappNumber);
          }
        }

        if (secRes && secRes.ok) {
          const data = await secRes.json();
          const sectionMap = {};
          data.forEach(s => {
            sectionMap[s.sectionKey] = {
              ...(localSections[s.sectionKey] || {}),
              ...s,
              featuredLabel: s.featuredLabel !== undefined ? s.featuredLabel : (s.contentData ? '' : (localSections[s.sectionKey]?.featuredLabel || ''))
            };
          });
          if (isMounted) setLocalSections(prev => ({ ...prev, ...sectionMap }));
        }

        if (catRes && catRes.ok) {
          const cats = await catRes.json();
          if (isMounted) setCategories(cats);
        }

        if (prodRes && prodRes.ok) {
          const prods = await prodRes.json();
          if (isMounted) setProducts(prods);
        }
      } catch (e) {
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const containerRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    if (isCmsMode || loadingProducts) return;

    const ctx = gsap.context(() => {
      if (activeView === 'LANDING') {
        const heroContent = containerRef.current?.querySelector('.gsap-hero-content');
        if (heroContent) {
          gsap.fromTo('.gsap-hero-content > *',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isCmsMode, loadingProducts, activeView]);

  // Fechar janela de pesquisa ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Total de produtos em promoção
  const totalPromoProducts = useMemo(() => {
    return products.filter(p => p.promoPrice && Number(p.promoPrice) > 0 && Number(p.promoPrice) < Number(p.price)).length;
  }, [products]);

  // Total de produtos sem categoria
  const totalUncategorizedProducts = useMemo(() => {
    return products.filter(p => !p.categoryId || p.categoryId === '' || !p.category).length;
  }, [products]);

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategoryId === 'UNCATEGORIZED') {
      list = list.filter(p => !p.categoryId || p.categoryId === '' || !p.category);
    } else if (selectedCategoryId !== 'ALL') {
      list = list.filter(p => p.categoryId === selectedCategoryId);
    }
    if (filterOnlyPromos) {
      list = list.filter(p => p.promoPrice && Number(p.promoPrice) > 0 && Number(p.promoPrice) < Number(p.price));
    }
    return list;
  }, [products, selectedCategoryId, filterOnlyPromos]);

  // Resultados de Pesquisa Instantânea
  const searchResultsProducts = searchTerm.trim() === ''
    ? []
    : products.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const searchResultsCategories = searchTerm.trim() === ''
    ? []
    : categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Abrir Modal de Produto
  const handleOpenProductDetail = (product) => {
    setActiveProductForModal(product);
    setIsDetailModalOpen(true);
    setIsSearchOpen(false);
    if (product && product.id) {
      fetch(`/api/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
    }
  };

  // Ícones representativos para as bolhas de categoria no topo
  const categoryIconMap = {
    'vestuario-fardamento': '/gandola-militar.jpg',
    'coletes-protecao': '/colete-tatico.jpg',
    'calcados-coturnos': '/coturno-tatico.jpg',
    'mochilas-carga-tatica': '/mochila-tatica.jpg',
    'cutelaria-sobrevivencia': '/faca-tatica.jpg',
    'acessorios-insignias': '/cinto-tatico.jpg',
    'iluminacao-optica': '/lanterna-tatica.jpg',
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-forest-700 selection:text-white">
      
      {/* Modal de Detalhes do Produto */}
      <ProductDetailModal
        product={activeProductForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={onAddToCart}
      />

      {/* ── 1. TOP UTILITY ANNOUNCEMENT BAR (ESTILO TRAILPEAK: ESCURA, LIMPA E COM ÍCONES) ── */}
      <EditableSection sectionKey="TOPBAR" isCmsMode={isCmsMode} onEditSection={onEditSection}>
        <div className="bg-[#14231c] text-white/90 text-[11px] sm:text-xs py-2 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            
            {/* Esquerda: Benefício de Frete */}
            <div className="flex items-center gap-2 text-emerald-400/90 font-medium truncate">
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-white/90 truncate">{sections.TOPBAR?.title || 'Frete Grátis acima de R$ 250 • Despacho Imediato'}</span>
            </div>

            {/* Centro: Slogan Tático / Aventura (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 text-white/70 font-display tracking-wider text-xs uppercase">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sections.TOPBAR?.subtitle || 'Prontidão Operacional & Sobrevivência'}</span>
            </div>

            {/* Direita: Atendimento, Suporte & Usuário */}
            <div className="flex items-center gap-4 text-white/80 font-medium">
              <span className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => handleNavigateLink(`wa.me/${storeWhatsapp}`)}>
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suporte 24/7</span>
              </span>

              {currentUser ? (
                <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                  <span className="text-white font-bold flex items-center gap-1 text-[11px]">
                    <User className="w-3 h-3 text-emerald-400" /> {currentUser.name}
                  </span>
                  <button onClick={onLogout} title="Sair" className="text-white/60 hover:text-red-400 cursor-pointer">
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={onOpenAuth} className="hover:text-white flex items-center gap-1 cursor-pointer">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </EditableSection>

      {/* ── 2. MAIN HEADER (BARRA BRANCA LIMPA, LOGO, MENU DE CATEGORIAS, BUSCA E CARRINHO) ── */}
      <EditableSection sectionKey="HEADER" isCmsMode={isCmsMode} onEditSection={onEditSection}>
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo TrailPeak / Comandos Artigos Militares */}
            <div 
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => goToLanding()}
              title="Ir para a Página Inicial"
            >
              <img 
                src="/logo-comandos.png" 
                alt="Comandos Artigos Militares" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-forest-700 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-forest-900 leading-none group-hover:text-forest-700 transition-colors">
                  {sections.HEADER?.title || 'COMANDOS'}
                </span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-slate-500 uppercase mt-0.5">
                  {sections.HEADER?.subtitle || 'ARTIGOS MILITARES'}
                </span>
              </div>
            </div>

            {/* Menu de Navegação Horizontal (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
              <button 
                onClick={() => goToLanding()} 
                className={`hover:text-forest-700 transition-colors cursor-pointer ${activeView === 'LANDING' ? 'text-forest-700 font-bold border-b-2 border-forest-700 pb-0.5' : ''}`}
              >
                Início
              </button>

              <button 
                onClick={() => goToStore('ALL')} 
                className={`hover:text-forest-700 transition-colors cursor-pointer ${activeView === 'STORE' && !filterOnlyPromos ? 'text-forest-700 font-bold border-b-2 border-forest-700 pb-0.5' : ''}`}
              >
                Loja Completa
              </button>

              <button 
                onClick={() => { goToLanding('categorias'); }} 
                className="hover:text-forest-700 transition-colors cursor-pointer"
              >
                Categorias
              </button>

              <button 
                onClick={() => { goToLanding('colecoes'); }} 
                className="hover:text-forest-700 transition-colors cursor-pointer"
              >
                Coleções
              </button>

              <button 
                onClick={handleTogglePromosFilter} 
                className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ofertas</span>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-extrabold">SALE</span>
              </button>
            </nav>

            {/* Barra de Pesquisa com Ícone Lupa e Borda Suave */}
            <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md relative" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  className="w-full bg-slate-100/90 border border-slate-200 hover:border-slate-300 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20 transition-all"
                  placeholder="Pesquisar farda, coturno, colete, mochila..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Popover de Pesquisa em Tempo Real */}
              {isSearchOpen && searchTerm.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {searchResultsCategories.length > 0 && (
                    <div className="p-3 bg-slate-50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                        CATEGORIAS ENCONTRADAS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {searchResultsCategories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              goToStore(cat.id);
                              setIsSearchOpen(false);
                              setSearchTerm('');
                            }}
                            className="text-xs bg-white border border-slate-200 hover:border-forest-600 hover:text-forest-700 text-slate-700 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                      PRODUTOS ENCONTRADOS ({searchResultsProducts.length})
                    </span>
                    {searchResultsProducts.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4 text-center">
                        Nenhum produto encontrado para "{searchTerm}".
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {searchResultsProducts.slice(0, 6).map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              handleOpenProductDetail(prod);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <img 
                              src={prod.media?.[0]?.url || '/banner-camisa-camuflada.png'} 
                              alt={prod.title} 
                              className="w-10 h-10 rounded object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate">{prod.title}</div>
                              <div className="text-[10px] text-slate-500">{prod.category?.name || 'Tático'}</div>
                            </div>
                            <div className="font-bold text-xs text-forest-800 font-mono">
                              R$ {parseFloat(prod.promoPrice || prod.price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ações da Direita: Perfil & Carrinho */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <button 
                onClick={onOpenAuth}
                className="hidden sm:flex text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Minha Conta"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCart}
                className="relative bg-slate-100 hover:bg-slate-200 text-slate-800 p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center"
                title="Abrir Carrinho"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </header>
      </EditableSection>

      {/* ── 3. HERO BANNER PRINCIPAL (ESTILO TRAILPEAK: FOTO AMPLA DE MONTANHA / NATUREZA COM TIPOGRAFIA BRANCA E BOTÃO VERDE) ── */}
      {activeView === 'LANDING' && (
        <EditableSection sectionKey="HERO_MAIN" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <section className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] overflow-hidden bg-slate-900 flex items-center">
            {/* Foto de Fundo Panorâmica */}
            <img 
              src={sections.HERO_MAIN?.mediaUrl || '/hero-landscape.jpg'} 
              alt="Comandos Artigos Militares Outdoor" 
              className="absolute inset-0 w-full h-full object-cover object-center brightness-90 contrast-105"
            />
            {/* Gradiente escuro lateral para legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full z-10 gsap-hero-content">
              <div className="max-w-xl lg:max-w-2xl text-white space-y-4 sm:space-y-5">
                
                {/* Título Display em Oswald / Negrito Caixa Alta */}
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.95] drop-shadow-md">
                  {sections.HERO_MAIN?.title || 'EQUIPAMENTOS DE HOJE PARA MISSÕES MAIORES AMANHÃ'}
                </h1>

                {/* Subtítulo Clean */}
                <p className="text-white/90 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-lg drop-shadow">
                  {sections.HERO_MAIN?.subtitle || 'Explore. Equipe-se. Vivencie o verdadeiro padrão de durabilidade militar e outdoor.'}
                </p>

                {/* Botão de Ação Verde Floresta */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => goToStore()}
                    className="bg-[#2d5343] hover:bg-[#1e3d30] text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-md shadow-xl transition-all duration-200 inline-flex items-center gap-2.5 group cursor-pointer active:scale-95 border border-emerald-500/30"
                  >
                    <span>{sections.HERO_MAIN?.buttonText || 'EXPLORAR EQUIPAMENTOS'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Texto Manuscrito Decorativo no Canto Direito (Aura "Adventure Lives Here") */}
            <div className="hidden lg:block absolute bottom-12 right-12 z-10 text-white/90 transform rotate-[-6deg] select-none pointer-events-none">
              <span className="font-handwriting text-4xl font-bold tracking-wide drop-shadow-lg text-emerald-300">
                Aventura & Prontidão
              </span>
            </div>
          </section>
        </EditableSection>
      )}

      {/* ── 4. CATEGORY CIRCLE BUBBLES BAR (BARRA DE ÍCONES CIRCULARES DE CATEGORIA ESTILO TRAILPEAK) ── */}
      {activeView === 'LANDING' && (
        <section className="bg-white border-b border-slate-200 py-6 sm:py-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none sm:justify-center sm:gap-8 lg:gap-10">
              
              {/* Botão Todos */}
              <div 
                onClick={() => goToStore('ALL')} 
                className="flex flex-col items-center gap-2 cursor-pointer category-bubble flex-shrink-0 group"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-100 group-hover:bg-forest-700/10 border border-slate-200 group-hover:border-forest-600 flex items-center justify-center transition-all p-2.5 shadow-sm">
                  <Compass className="w-7 h-7 text-forest-700 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-forest-700 transition-colors">
                  Todos
                </span>
              </div>

              {/* Categorias Dinâmicas com Fotos Circulares */}
              {categories.map((cat) => {
                const iconSrc = categoryIconMap[cat.slug] || cat.image || '/gandola-militar.jpg';
                return (
                  <div 
                    key={cat.id}
                    onClick={() => goToStore(cat.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer category-bubble flex-shrink-0 group"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-100 border border-slate-200 group-hover:border-forest-600 overflow-hidden flex items-center justify-center transition-all shadow-sm">
                      <img 
                        src={iconSrc} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-forest-700 transition-colors text-center max-w-[80px] truncate">
                      {cat.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        </section>
      )}

      {/* ── 5. SEÇÃO: ARSENAL EM DESTAQUE (4 ABAS SELECIONÁVEIS + PRODUTOS EDITÁVEIS NO CMS) ── */}
      {activeView === 'LANDING' && (
        <EditableSection sectionKey="BESTSELLERS_HEADER" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4">
            
            {/* Header: Título, Subtítulo & 4 Abas Selecionáveis */}
            <div className="mb-8 pb-4 border-b border-slate-200">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-slate-900">
                    {sections.BESTSELLERS_HEADER?.title || 'ARSENAL EM DESTAQUE'}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    {sections.BESTSELLERS_HEADER?.subtitle || 'Os itens mais requisitados por operadores e aventureiros.'}
                  </p>
                </div>

                <button 
                  onClick={() => goToStore('ALL')} 
                  className="text-xs sm:text-sm font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 group cursor-pointer transition-colors self-start md:self-auto"
                >
                  <span>Ver Todos na Loja</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Barra das 4 Abas Selecionáveis */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { key: 'ALL', label: 'Todos os Equipamentos', icon: '⚔️' },
                  { key: 'NOVIDADES', label: 'Novidades & Chegadas Recentes', icon: '✨' },
                  { key: 'MAIS_VENDIDOS', label: 'Mais Vendidos', icon: '🔥' },
                  { key: 'COLECOES', label: 'Coleções Especiais', icon: '🎖️' }
                ].map(tab => {
                  const isActive = activeArsenalTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveArsenalTab(tab.key)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-forest-800 text-white shadow-md scale-102 ring-2 ring-forest-700/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolução dos Produtos da Aba Ativa (Customizados via CMS ou Inteligentes) */}
            {(() => {
              let tabMap = {};
              try {
                const raw = sections.BESTSELLERS_HEADER?.tabProductsData;
                if (raw) {
                  tabMap = typeof raw === 'string' ? JSON.parse(raw) : raw;
                }
              } catch (e) {
                tabMap = {};
              }

              const currentTabConfig = tabMap[activeArsenalTab] || {};
              const manualIds = currentTabConfig.productIds || [];

              let displayProducts = [];

              if (manualIds.length > 0 && !(activeArsenalTab === 'MAIS_VENDIDOS' && currentTabConfig.mode === 'AUTO')) {
                // Modo Manual configurado no CMS: carrega exatamente os produtos selecionados
                displayProducts = manualIds
                  .map(id => products.find(p => String(p.id) === String(id)))
                  .filter(Boolean);
              }

              // Fallback ou Modo Automático Inteligente
              if (displayProducts.length === 0) {
                if (activeArsenalTab === 'NOVIDADES') {
                  // Ordena por data de cadastro mais recente
                  displayProducts = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                } else if (activeArsenalTab === 'MAIS_VENDIDOS') {
                  // Filtra produtos marcados como isBestseller ou mais vistos/populares
                  displayProducts = [...products].filter(p => p.isBestseller);
                  if (displayProducts.length < 5) {
                    const others = [...products].filter(p => !p.isBestseller);
                    displayProducts = [...displayProducts, ...others];
                  }
                } else if (activeArsenalTab === 'COLECOES') {
                  // Produtos em oferta ou sob encomenda / coleções
                  displayProducts = [...products].filter(p => p.promoPrice || p.isMadeToOrder);
                  if (displayProducts.length < 5) {
                    displayProducts = products;
                  }
                } else {
                  // ALL
                  displayProducts = products;
                }
              }

              // Limita aos primeiros 10 itens para vitrine veloz e limpa
              const visibleList = displayProducts.slice(0, 10);

              if (visibleList.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm">Nenhum produto cadastrado nesta categoria ainda.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {visibleList.map((prod, slotIdx) => (
                    <div 
                      key={prod.id || slotIdx} 
                      className={`outdoor-card flex flex-col justify-between group overflow-hidden bg-white cursor-pointer relative ${
                        isCmsMode ? 'ring-2 ring-transparent hover:ring-amber-500 hover:shadow-xl transition-all' : ''
                      }`}
                      onClick={() => {
                        if (isCmsMode && onSelectProductSlot) {
                          onSelectProductSlot(activeArsenalTab, slotIdx);
                        } else {
                          handleOpenProductDetail(prod);
                        }
                      }}
                    >
                      {/* Badge / Indicador de Edição Rápida em Modo CMS */}
                      {isCmsMode && (
                        <div className="absolute top-2 left-2 z-30 bg-amber-500 text-black font-bold text-[9px] px-2 py-0.5 rounded shadow-lg font-mono flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <Edit className="w-2.5 h-2.5" />
                          <span>SLOT {slotIdx + 1}</span>
                        </div>
                      )}

                      <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                        <img 
                          src={prod.media?.[0]?.url || '/banner-camisa-camuflada.png'} 
                          alt={prod.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.promoPrice && Number(prod.promoPrice) < Number(prod.price) && (
                          <span className={`absolute ${isCmsMode ? 'bottom-2 left-2' : 'top-2 left-2'} bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow`}>
                            OFERTA
                          </span>
                        )}
                        {!isCmsMode && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); }} 
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm transition-all"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isCmsMode && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-tactical-gold text-black font-bold text-[10px] px-2.5 py-1 rounded shadow-lg font-mono uppercase">
                              Trocar Produto
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            {prod.category?.name || 'Comandos'}
                          </span>
                          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 mt-0.5 group-hover:text-forest-700 transition-colors">
                            {prod.title}
                          </h3>
                        </div>

                        {/* Avaliação em Estrelas Amarelas */}
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-slate-400 text-[10px] ml-1">(128)</span>
                        </div>

                        {/* Preço em Destaque */}
                        <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                          <span className="font-bold text-sm sm:text-base text-slate-900 font-mono">
                            R$ {parseFloat(prod.promoPrice || prod.price).toFixed(2)}
                          </span>
                          {prod.promoPrice && Number(prod.promoPrice) < Number(prod.price) && (
                            <span className="text-[11px] text-slate-400 line-through font-mono">
                              R$ {parseFloat(prod.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

          </section>
        </EditableSection>
      )}

      {/* ── 6. SEÇÃO: BANNER DE OFERTA RELÂMPAGO (FLASH SALE COM CONTAGEM REGRESSIVA ESTILO TRAILPEAK) ── */}
      {activeView === 'LANDING' && (
        <EditableSection sectionKey="WARRIOR_PROMO" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <section id="flash-sale" className="max-w-7xl mx-auto px-4 mb-16">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
              {/* Imagem de Fundo Escurecida */}
              <img 
                src="/hero-landscape.jpg" 
                alt="Flash Sale Comandos" 
                className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80" />

              <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Esquerda: Raio, Título e Desconto */}
                <div className="flex items-start gap-4 text-white text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center flex-shrink-0 text-orange-500 mt-1 shadow-lg">
                    <Zap className="w-7 h-7 fill-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                      {sections.WARRIOR_PROMO?.title || 'CAMISA CAMUFLADA SELVA'}
                    </h3>
                    <p className="text-orange-400 font-semibold text-sm sm:text-base">
                      {sections.WARRIOR_PROMO?.featuredTitle || 'Até 40% OFF nos Melhores Equipamentos Táticos'}
                    </p>
                    <p className="text-white/70 text-xs sm:text-sm max-w-md">
                      {sections.WARRIOR_PROMO?.subtitle || 'APENAS R$ 45,00 • ENCOMENDE O SEU'}
                    </p>
                  </div>
                </div>

                {/* Centro/Direita: Botão Laranja e Timer */}
                <div className="flex flex-col sm:flex-row items-center gap-6 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCmsMode) handleNavigateLink(sections.WARRIOR_PROMO?.buttonLink || '#ofertas');
                    }}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {sections.WARRIOR_PROMO?.buttonText || 'FAÇA SUA ENCOMENDA >'}
                  </button>

                  {/* Contador Regressivo Estilo TrailPeak */}
                  <div className="flex items-center gap-2 text-white">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1">
                      TERMINA EM:
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <div className="bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-md text-center min-w-[36px]">
                        <span className="font-bold text-sm text-white">{String(flashTime.hrs).padStart(2, '0')}</span>
                        <span className="text-[8px] text-slate-400 block -mt-1">HRS</span>
                      </div>
                      <span className="font-bold text-slate-500">:</span>
                      <div className="bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-md text-center min-w-[36px]">
                        <span className="font-bold text-sm text-white">{String(flashTime.mins).padStart(2, '0')}</span>
                        <span className="text-[8px] text-slate-400 block -mt-1">MIN</span>
                      </div>
                      <span className="font-bold text-slate-500">:</span>
                      <div className="bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-md text-center min-w-[36px]">
                        <span className="font-bold text-sm text-orange-400">{String(flashTime.secs).padStart(2, '0')}</span>
                        <span className="text-[8px] text-slate-400 block -mt-1">SEG</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </EditableSection>
      )}

      {/* ── 9. SEÇÃO: COLEÇÕES EM DESTAQUE (CURATED COLLECTIONS - 4 CARDS COM FOTOS DE AMBIENTE) ── */}
      {activeView === 'LANDING' && (
        <section id="colecoes" className="py-12 max-w-7xl mx-auto px-4">
          <div className="mb-8 pb-3 border-b border-slate-200">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-slate-900">
              Coleções Especiais
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Equipamentos selecionados por modalidade e ambiente de missão.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Operações em Selva */}
            <div 
              onClick={() => goToStore()}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer shadow-md"
            >
              <img 
                src="/banner-camisa-camuflada.png" 
                alt="Operações em Selva" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                  Operações em Selva
                </h3>
                <p className="text-white/80 text-xs">Fardamento e camisas camufladas EB</p>
              </div>
            </div>

            {/* Card 2: Proteção Balística & Coletes */}
            <div 
              onClick={() => goToStore()}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer shadow-md"
            >
              <img 
                src="/colete-tatico.jpg" 
                alt="Proteção Balística" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                  Proteção &amp; Coletes
                </h3>
                <p className="text-white/80 text-xs">Porta-placas e modulares MOLLE</p>
              </div>
            </div>

            {/* Card 3: Calçados de Alta Tração */}
            <div 
              onClick={() => goToStore()}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer shadow-md"
            >
              <img 
                src="/coturno-tatico.jpg" 
                alt="Calçados de Alta Tração" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                  Coturnos de Marcha
                </h3>
                <p className="text-white/80 text-xs">Impermeáveis e com zíper tático</p>
              </div>
            </div>

            {/* Card 4: Cutelaria & Sobrevivência */}
            <div 
              onClick={() => goToStore()}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer shadow-md"
            >
              <img 
                src="/faca-tatica.jpg" 
                alt="Cutelaria & Sobrevivência" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                  Cutelaria &amp; Campo
                </h3>
                <p className="text-white/80 text-xs">Facas full-tang e ferramentas EDC</p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── 10. SEÇÃO: RECOMENDAÇÃO DE ESPECIALISTA & DEPOIMENTOS DE CLIENTES / INSTAGRAM (DUAL CARD) ── */}
      {activeView === 'LANDING' && (
        <EditableSection sectionKey="TESTIMONIALS" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Recomendação do Especialista */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={sections.TESTIMONIALS?.mediaUrl || '/gandola-militar.jpg'} 
                  alt={sections.TESTIMONIALS?.title || 'Instrutor Tático'} 
                  className="w-28 h-28 rounded-full object-cover border-2 border-forest-600 flex-shrink-0 shadow-md"
                />
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-2 py-0.5 rounded inline-block">
                    {sections.TESTIMONIALS?.featuredLabel || 'RECOMENDAÇÃO OPERACIONAL'}
                  </span>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    "{sections.TESTIMONIALS?.subtitle || 'O equipamento certo não apenas te leva até o objetivo. Ele garante sua segurança e resposta rápida em qualquer terreno.'}"
                  </p>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {sections.TESTIMONIALS?.title || 'Capitão Roberto Mendes'}
                    </h4>
                    <p className="text-slate-400 text-xs">
                      {sections.TESTIMONIALS?.featuredTitle || 'Instrutor de Operações Especiais & Aventura'}
                    </p>
                  </div>
                  {sections.TESTIMONIALS?.buttonText !== '' && (
                    <button 
                      onClick={() => {
                        const link = sections.TESTIMONIALS?.buttonLink;
                        if (link && link.startsWith('http')) {
                          window.open(link, '_blank', 'noopener,noreferrer');
                        } else {
                          goToStore();
                        }
                      }} 
                      className="bg-[#2d5343] hover:bg-[#1e3d30] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors cursor-pointer"
                    >
                      {sections.TESTIMONIALS?.buttonText || 'Ver Escolhas do Especialista >'}
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: O Que Nossos Clientes Dizem / Comentários do Instagram */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
                      <span>{sections.TESTIMONIALS?.test2_heading || 'Avaliações de Quem Usa'}</span>
                    </h4>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(Number(sections.TESTIMONIALS?.test2_stars || 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{sections.TESTIMONIALS?.test2_comment || 'A camisa camuflada de R$ 45 é fantástica! Tecido leve, não desbota na lavagem e o corte ficou perfeito. A entrega chegou em 3 dias aqui em São Paulo.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-3">
                    {sections.TESTIMONIALS?.test2_avatar && sections.TESTIMONIALS.test2_avatar.startsWith('http') ? (
                      <img 
                        src={sections.TESTIMONIALS.test2_avatar} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold flex items-center justify-center font-mono text-sm shadow-sm">
                        {sections.TESTIMONIALS?.test2_avatar || 'MS'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span>{sections.TESTIMONIALS?.test2_author || 'Marcos Silva'}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {sections.TESTIMONIALS?.test2_role || 'Policial Militar & Praticante de Airsoft • Compra Verificada'}
                      </div>
                    </div>
                  </div>

                  {sections.TESTIMONIALS?.test2_link && (
                    <a
                      href={sections.TESTIMONIALS.test2_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#E1306C] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Ver no Instagram</span>
                      <span>→</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </section>
        </EditableSection>
      )}

      {/* ── 11. SEÇÃO: 4 BENEFÍCIOS TRAILPEAK (FREE SHIPPING, EASY RETURNS, RESISTÊNCIA, 24/7 SUPPORT) ── */}
      <EditableSection sectionKey="VALUE_PROPS" isCmsMode={isCmsMode} onEditSection={onEditSection}>
        <section className="bg-white border-y border-slate-200 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {parseValueProps(sections.VALUE_PROPS).map((item, idx) => {
                const Icon = item.Icon;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-800 border border-slate-200 shadow-sm">
                      <Icon className="w-6 h-6 text-forest-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ── 12. SEÇÃO: NEWSLETTER / COMUNIDADE COMANDOS (BANNER VERDE FLORESTA ESCURO) ── */}
      {activeView === 'LANDING' && (
        <section className="bg-[#14231c] text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                Junte-se à Comunidade Comandos
              </h3>
              <p className="text-white/70 text-xs sm:text-sm">
                Receba em primeira mão novidades táticas, dicas operacionais e cupons exclusivos.
              </p>
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Obrigado por se inscrever na Comandos Artigos Militares!'); }}
              className="flex w-full md:w-auto max-w-md items-center gap-2"
            >
              <input 
                type="email" 
                required 
                placeholder="Seu melhor e-mail..."
                className="w-full sm:w-80 bg-white text-slate-800 text-xs sm:text-sm px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button 
                type="submit" 
                className="bg-[#2d5343] hover:bg-[#1e3d30] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-md transition-colors flex-shrink-0 cursor-pointer"
              >
                Inscrever
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════
          MODO 2: VISUALIZAÇÃO DEDICADA DA LOJA (CATÁLOGO COMPLETO, FILTROS E PESQUISA)
         ════════════════════════════════════════════════════════════════════════════════ */}
      {activeView === 'STORE' && !isCmsMode && (
        <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
          
          {/* Breadcrumb e Topo da Loja */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => goToLanding()}
                  className="font-semibold text-forest-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Início</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 font-mono">
                  {selectedCategoryId === 'ALL' ? 'Catálogo Geral' : selectedCategoryName}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight text-slate-900">
                {sections.BESTSELLERS_HEADER?.title || 'LOJA & CATÁLOGO TÁTICO'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                {filteredProducts.length} itens encontrados para pronta entrega.
              </p>
            </div>

            {/* Filtros em Chips com Alto Contraste */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategoryId === 'ALL' && !filterOnlyPromos
                    ? 'bg-[#142b22] text-white border-[#142b22] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Todos ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterOnlyPromos(prev => !prev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filterOnlyPromos
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Ofertas ({totalPromoProducts})</span>
              </button>

              {totalUncategorizedProducts > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelectedCategoryId('UNCATEGORIZED'); setFilterOnlyPromos(false); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    selectedCategoryId === 'UNCATEGORIZED' && !filterOnlyPromos
                      ? 'bg-[#142b22] text-white border-[#142b22] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Sem Categoria ({totalUncategorizedProducts})
                </button>
              )}
            </div>
          </div>

          {/* Layout com Sidebar de Categorias à Esquerda e Grid à Direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Esquerda (Categorias) */}
            <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-forest-700" />
                <span>Categorias</span>
              </h3>

              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center cursor-pointer ${
                    selectedCategoryId === 'ALL' && !filterOnlyPromos ? 'bg-forest-50 text-forest-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Todas as Categorias</span>
                  <span className="font-mono text-[11px] text-slate-400">{products.length}</span>
                </button>

                <button
                  onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(true); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center cursor-pointer ${
                    filterOnlyPromos ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate pr-2">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    <span>Em Oferta / Desconto</span>
                  </span>
                  <span className="font-mono text-[11px] text-orange-600 font-bold">{totalPromoProducts}</span>
                </button>

                {totalUncategorizedProducts > 0 && (
                  <button
                    onClick={() => { setSelectedCategoryId('UNCATEGORIZED'); setFilterOnlyPromos(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center cursor-pointer ${
                      selectedCategoryId === 'UNCATEGORIZED' && !filterOnlyPromos ? 'bg-forest-50 text-forest-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">Sem Categoria</span>
                    <span className="font-mono text-[11px] text-slate-400">{totalUncategorizedProducts}</span>
                  </button>
                )}

                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  const isSelected = selectedCategoryId === cat.id && !filterOnlyPromos;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategoryId(cat.id); setFilterOnlyPromos(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center cursor-pointer ${
                        isSelected ? 'bg-forest-50 text-forest-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Grid de Produtos da Loja */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="outdoor-card flex flex-col justify-between group overflow-hidden bg-white cursor-pointer"
                    onClick={() => handleOpenProductDetail(prod)}
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                      <img 
                        src={prod.media?.[0]?.url || '/banner-camisa-camuflada.png'} 
                        alt={prod.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.promoPrice && Number(prod.promoPrice) < Number(prod.price) && (
                        <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          OFERTA
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {prod.category?.name || 'Comandos'}
                        </span>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 mt-0.5 group-hover:text-forest-700 transition-colors">
                          {prod.title}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-900 font-mono">
                          R$ {parseFloat(prod.promoPrice || prod.price).toFixed(2)}
                        </span>
                        {prod.promoPrice && Number(prod.promoPrice) < Number(prod.price) && (
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            R$ {parseFloat(prod.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* ── 13. FOOTER COMPLETO (FUNDO ESCURO VERDE FLORESTA / TRAILPEAK ELEGANTE) ── */}
      <EditableSection sectionKey="FOOTER_CONTACT" isCmsMode={isCmsMode} onEditSection={onEditSection}>
        <footer className="bg-[#0d1f18] text-white/80 pt-12 pb-8 text-xs border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Coluna 1: Logo & Missão */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-comandos.png" 
                  alt="Comandos Artigos Militares" 
                  className="w-10 h-10 rounded-full object-cover border border-white/20" 
                />
                <div>
                  <div className="font-display text-xl font-bold tracking-tight text-white leading-none">
                    COMANDOS
                  </div>
                  <div className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase">
                    ARTIGOS MILITARES
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {sections.FOOTER_CONTACT?.subtitle || 'Líder em camisas camufladas, fardamentos operacionais e equipamentos táticos com despacho rápido para todo o Brasil.'}
              </p>
            </div>

            {/* Coluna 2: Navegação */}
            <div>
              <h5 className="font-display text-sm font-bold text-white mb-3 tracking-wider uppercase">
                {sections.FOOTER_CONTACT?.featuredTitle || 'NAVEGAÇÃO RÁPIDA'}
              </h5>
              <ul className="space-y-2 text-white/70">
                {(sections.FOOTER_CONTACT?.navLinks || 'Home:#home|Loja:#loja|Categorias:#categorias|Mídia e Vídeos:#video-feature|Ofertas:#flash-sale')
                  .split('|').map((item, i) => {
                    const [label, target] = item.split(':');
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => handleNavigateLink(target || '#loja')}
                          className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Coluna 3: Atendimento & WhatsApp */}
            <div>
              <h5 className="font-display text-sm font-bold text-white mb-3 tracking-wider uppercase">
                {sections.FOOTER_CONTACT?.featuredLabel || 'ATENDIMENTO & SUPORTE'}
              </h5>
              <ul className="space-y-2 text-white/70">
                <li>WhatsApp: (11) 99999-8888</li>
                <li>E-mail: contato@comandosartigosmilitares.com</li>
                <li>Segunda a Sábado: 08h às 19h</li>
                <li className="pt-1 text-emerald-400 font-semibold">Atendimento Bot 24/7 Ativo</li>
              </ul>
            </div>

            {/* Coluna 4: Segurança & Redes Sociais */}
            <div>
              <h5 className="font-display text-sm font-bold text-white mb-3 tracking-wider uppercase">
                {sections.FOOTER_CONTACT?.secTitle || 'SEGURANÇA & REDES'}
              </h5>
              <p className="text-white/60 mb-3 text-xs leading-relaxed">
                {sections.FOOTER_CONTACT?.secText || 'Ambiente 100% seguro com criptografia de ponta a ponta.'}
              </p>

              {/* Redes Sociais Oficiais Dinâmicas (Habilitadas com Link) */}
              {(() => {
                const parsedSocials = parseSocialNetworks(sections.FOOTER_CONTACT?.socialNetworksData || sections.FOOTER_CONTACT?.socialLinks);
                const activeSocials = parsedSocials.filter(s => s.enabled && s.url);

                if (activeSocials.length === 0) return null;

                return (
                  <div className="flex flex-wrap gap-2 text-white/80 mb-4 items-center">
                    {activeSocials.map(social => (
                      <a
                        key={social.key}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full bg-white/10 ${social.brandColor} hover:text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-md flex items-center justify-center`}
                        title={`Acompanhe a Comandos no ${social.label}`}
                        aria-label={social.label}
                      >
                        {renderSocialIcon(social.iconType, "w-4 h-4")}
                      </a>
                    ))}
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-1.5">
                {(sections.FOOTER_CONTACT?.paymentBadges || 'PIX|Cartão de Crédito|Boleto Bancário')
                  .split('|').map((badge, idx) => (
                    <span key={idx} className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
                      {badge.trim()}
                    </span>
                  ))}
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center text-white/40 text-[11px]">
            {sections.FOOTER_CONTACT?.copyrightText || `© ${new Date().getFullYear()} COMANDOS ARTIGOS MILITARES. Todos os direitos reservados. comandosartigosmilitares.com`}
          </div>
        </footer>
      </EditableSection>

      {/* Barra Flutuante de Carrinho Mobile */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={onOpenCart}
            className="w-full bg-forest-800 hover:bg-forest-700 text-white font-display text-base font-bold py-3.5 px-4 rounded-xl shadow-2xl flex items-center justify-between border border-white/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Pedido ({cartCount} {cartCount === 1 ? 'item' : 'itens'})</span>
            </div>
            <span className="text-emerald-400 font-mono text-xs">FINALIZAR &gt;</span>
          </button>
        </div>
      )}

      {/* Botão Flutuante de WhatsApp Oficial Comandos */}
      {!isCmsMode && (
        <aside aria-label="Atendimento via WhatsApp" className={`fixed ${cartCount > 0 ? 'bottom-20 lg:bottom-6' : 'bottom-6'} right-4 sm:right-6 z-40 flex items-center gap-2 group`}>
          <a
            href={`https://wa.me/${storeWhatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da Comandos Artigos Militares.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white pl-4 pr-3.5 py-3 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.4)] border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Fale direto com a Comandos Artigos Militares no WhatsApp"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            </div>
            <div className="flex flex-col text-left leading-tight pr-1">
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Atendimento Oficial</span>
              <span className="font-display font-black text-xs text-white uppercase tracking-tight">Falar no WhatsApp</span>
            </div>
          </a>
        </aside>
      )}

    </div>
  );
}
