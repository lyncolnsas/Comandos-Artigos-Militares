import React, { useState, useEffect, useRef, useMemo } from 'react';
import MediaViewer from './MediaViewer';
import ProductDetailModal from './ProductDetailModal';
import { 
  ShoppingBag, Star, ShieldCheck, Phone, Truck, RefreshCw, Award, MessageCircle, 
  User, LogOut, Heart, Search, ChevronDown, ChevronUp, Layers, Check, Clock, 
  Sparkles, X, Tag, FolderTree, Edit, ArrowRight, ArrowLeft, Filter, SlidersHorizontal,
  Zap, Lock, Headphones, Shield
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper para parsear os 4 Diferenciais Táticos com suporte a campos individuais ou strings com pipes
const parseValueProps = (valSection) => {
  const fallbackTitles = ['ENVIO RÁPIDO', 'GARANTIA TOTAL', 'SUPORTE 24/7', 'QUALIDADE MILITAR'];
  const fallbackDescs = [
    'Entrega garantida para todo o Brasil',
    '30 dias para trocas e devoluções',
    'Atendimento via WhatsApp e Bot',
    'Produtos testados e homologados'
  ];
  const fallbackIcons = [Truck, ShieldCheck, RefreshCw, Award];
  const iconLookup = {
    Truck, ShieldCheck, RefreshCw, Award, Zap, Lock, Headphones, Star, Shield
  };

  const rawTitles = (valSection?.subtitle || '').split('|');
  const rawDescs = (valSection?.buttonText || '').split('|');

  return [0, 1, 2, 3].map((idx) => {
    const num = idx + 1;
    const title = valSection?.[`prop${num}_title`] || rawTitles[idx] || fallbackTitles[idx];
    const desc = valSection?.[`prop${num}_desc`] || rawDescs[idx] || fallbackDescs[idx];
    const iconName = valSection?.[`prop${num}_icon`];
    const Icon = (iconName && iconLookup[iconName]) || fallbackIcons[idx] || Award;
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
      <div className="absolute inset-0 z-30 pointer-events-none group-hover:border-[3px] group-hover:border-tactical-gold group-hover:bg-tactical-gold/10 transition-all rounded" />
      <button
        type="button"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40 bg-tactical-gold text-black px-3 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 pointer-events-none flex items-center justify-center gap-1.5 font-tactical tracking-wider text-sm font-bold"
      >
        <Edit className="w-4 h-4" /> <span className="hidden sm:inline">EDITAR</span>
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
  onEditSection = null
}) {
  // Navegação entre Modos: 'LANDING' (Apresentação Limpa) vs 'STORE' (Loja & Catálogo de Produtos Dedicado)
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

  // Alternar o filtro de ofertas (Toggle inteligente com suporte a navegação)
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

  // Navegação Inteligente por Link (Suporta Âncoras, Categorias, Ofertas, Produtos e URLs externas)
  const handleNavigateLink = (link) => {
    if (!link || link === '#loja' || link === '#store' || link === '#catalogo' || link === '#produtos' || link === '#bestsellers') {
      goToStore();
      return;
    }
    if (link === '#ofertas' || link === '#promocao') {
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
    // Fallback padrão
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

  // Seções CMS
  const [localSections, setLocalSections] = useState({
    TOPBAR: {
      title: 'Atendimento Especializado',
      subtitle: '★ Avaliação 4.9/5.0',
      buttonText: 'EQUIPAMENTOS TÁTICOS DE ELITE'
    },
    HEADER: {
      title: 'COMANDOS',
      subtitle: 'ARTIGOS MILITARES',
      buttonText: 'EQUIPAMENTOS TÁTICOS & DEFESA'
    },
    HERO_MAIN: {
      title: 'COMANDOS ARTIGOS MILITARES',
      subtitle: 'Vestuário tático de alta resistência, coletes modulares, camisas camufladas e equipamentos de forças especiais.',
      mediaType: 'IMAGE',
      mediaUrl: '/banner-camisa-camuflada.png',
      buttonText: 'IR PARA A LOJA >',
      buttonLink: '#loja',
      featuredLabel: '★ PRODUTOS HOMOLOGADOS'
    },
    BESTSELLERS_HEADER: {
      title: 'BESTSELLERS & CATÁLOGO',
      subtitle: 'Clique nos produtos para ver todas as especificações e selecionar tamanhos/medidas.'
    },
    VIDEO_FEATURE: {
      title: 'TACTICAL EQUIPMENT AND MILITARY GEAR',
      subtitle: 'Desenvolvidos com base nos padrões mais exigentes das forças especiais. Nossos equipamentos combinam mobilidade, resistência balística e praticidade no campo de operação.',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
      buttonText: 'EXPLORAR EQUIPAMENTOS >',
      buttonLink: '#loja',
      featuredLabel: 'ENGENHARIA E RESISTÊNCIA MILITAR'
    },
    WARRIOR_PROMO: {
      title: 'CAMISA CAMUFLADA SELVA',
      subtitle: 'APENAS R$ 45,00 • ENCOMENDE O SEU FARDAMENTO COM DESPACHO RÁPIDO',
      buttonText: 'FAÇA SUA ENCOMENDA >',
      buttonLink: '#loja',
      featuredLabel: 'SUPER OFERTA R$ 45'
    },
    POPULAR_CATEGORIES: {
      title: 'POPULAR CATEGORIES',
      subtitle: 'Navegue pelas nossas categorias principais de alta demanda.',
      mediaUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
      buttonText: 'VER CATEGORIA >',
      buttonLink: '#loja',
      featuredTitle: 'OUTERWEAR & PROTEÇÃO',
      featuredLabel: 'CATEGORIA DESTAQUE'
    },
    VALUE_PROPS: {
      title: 'POR QUE ESCOLHER A COMANDOS ARTIGOS MILITARES?',
      subtitle: 'ENVIO RÁPIDO|GARANTIA TOTAL|SUPORTE 24/7|QUALIDADE MILITAR',
      buttonText: 'Entrega garantida para todo o Brasil|30 dias para trocas e devoluções|Atendimento via WhatsApp e Bot|Produtos testados e homologados'
    },
    FOOTER_CONTACT: {
      title: 'COMANDOS ARTIGOS MILITARES',
      subtitle: 'Líder em camisas camufladas, vestuário operacional e equipamentos táticos com atendimento direto.',
      featuredTitle: 'NAVEGAÇÃO RÁPIDA',
      featuredLabel: 'ATENDIMENTO',
      secTitle: 'SEGURANÇA & PAGAMENTO',
      secText: 'Ambiente 100% seguro com criptografia de ponta a ponta.',
      buttonText: 'WhatsApp: Central de Atendimento|Email: contato@comandosartigosmilitares.com|Segunda a Sexta: 08h às 18h',
      navLinks: 'Home:#home|Loja:#loja|Categorias:#categorias|Mídia e Vídeos:#video-feature|Ofertas:#loja',
      paymentBadges: 'PIX|Cartão|Boleto',
      copyrightText: '© 2026 COMANDOS ARTIGOS MILITARES. Todos os direitos reservados.'
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

  // Filtro Sanfona de Categorias (Mobile)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [secRes, catRes, prodRes] = await Promise.all([
          fetch('/api/sections').catch(() => null),
          fetch('/api/categories').catch(() => null),
          fetch('/api/products').catch(() => null)
        ]);

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

  // Animações de Scroll com GSAP & ScrollTrigger Ultra-Profissionais
  useEffect(() => {
    if (isCmsMode || loadingProducts) return;

    const ctx = gsap.context(() => {
      if (activeView === 'LANDING') {
        const heroContent = containerRef.current?.querySelector('.gsap-hero-content');
        if (heroContent) {
          const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          heroTl
            .fromTo('.gsap-hero-content > *',
              { y: 50, opacity: 0, filter: 'blur(4px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.12, delay: 0.15 }
            )
            .fromTo('.gsap-hero-media',
              { scale: 0.92, opacity: 0, filter: 'blur(8px)' },
              { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2 },
              '-=0.8'
            );

          gsap.to('.gsap-hero-media', {
            y: 40,
            ease: 'none',
            scrollTrigger: {
              trigger: '.gsap-hero-content',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5
            }
          });
        }

        if (containerRef.current?.querySelector('#categorias')) {
          gsap.fromTo('.gsap-category-card',
            { y: 45, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: '#categorias',
                start: 'top 80%',
                toggleActions: 'play none none none'
              }
            }
          );
        }

        if (containerRef.current?.querySelector('#video-feature')) {
          gsap.fromTo('.gsap-video-media',
            { x: -50, opacity: 0, rotateY: 8 },
            {
              x: 0,
              opacity: 1,
              rotateY: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '#video-feature',
                start: 'top 75%',
                toggleActions: 'play none none none'
              }
            }
          );
          gsap.fromTo('.gsap-video-text',
            { x: 50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '#video-feature',
                start: 'top 75%',
                toggleActions: 'play none none none'
              }
            }
          );
        }

        if (containerRef.current?.querySelector('#promocao')) {
          gsap.fromTo('.gsap-promo-banner',
            { scale: 0.93, opacity: 0, filter: 'brightness(0.6)' },
            {
              scale: 1,
              opacity: 1,
              filter: 'brightness(1)',
              duration: 0.9,
              ease: 'back.out(1.3)',
              scrollTrigger: {
                trigger: '#promocao',
                start: 'top 85%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      }

      if (activeView === 'STORE') {
        if (containerRef.current?.querySelector('.gsap-bestseller-card')) {
          gsap.fromTo('.gsap-bestseller-card',
            { y: 35, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power3.out'
            }
          );
        }
      }

      if (containerRef.current?.querySelector('.gsap-value-container')) {
        gsap.fromTo('.gsap-value-item',
          { y: 35, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.gsap-value-container',
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
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

  // Total de produtos em promoção com desconto ativo
  const totalPromoProducts = useMemo(() => {
    return products.filter(p => p.promoPrice && Number(p.promoPrice) > 0 && Number(p.promoPrice) < Number(p.price)).length;
  }, [products]);

  // Produtos filtrados por categoria e por oferta
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategoryId !== 'ALL') {
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

  // Rastreamento de Pesquisas de Clientes (Analytics)
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    const timer = setTimeout(() => {
      const term = searchTerm.trim();
      const count = products.filter(p => 
        p.title.toLowerCase().includes(term.toLowerCase()) ||
        p.description?.toLowerCase().includes(term.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(term.toLowerCase())
      ).length;

      fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term, resultsCount: count })
      }).catch(() => {});
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm, products]);

  // Abrir Modal de Produto
  const handleOpenProductDetail = (product) => {
    setActiveProductForModal(product);
    setIsDetailModalOpen(true);
    setIsSearchOpen(false);
    if (product && product.id) {
      fetch(`/api/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
    }
  };

  // Tratamento ao Clicar em Adicionar ao Pedido
  const handleProductCardAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      handleOpenProductDetail(product);
    } else {
      const numBase = parseFloat(product.price) || 0;
      const numPromo = product.promoPrice ? parseFloat(product.promoPrice) : null;
      const hasPromo = numPromo !== null && numPromo > 0 && numPromo < numBase;
      const effectivePrice = hasPromo ? numPromo : numBase;

      onAddToCart({
        ...product,
        price: effectivePrice,
        promoPrice: hasPromo ? numPromo : undefined
      });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-tactical-gold selection:text-black">
      
      {/* Modal de Detalhes do Produto & Seleção de Tamanho */}
      <ProductDetailModal
        product={activeProductForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={onAddToCart}
      />

      {/* ── BARRA FIXA SUPERIOR COMPLETA (TOPBAR + HEADER STICKY PERMANENTE) ── */}
      <div className="sticky top-0 z-50 shadow-2xl transition-all">
        {/* 1. TOP UTILITY BAR (CONTATO, AVALIAÇÃO, CUPOM, USUÁRIO) */}
        <EditableSection sectionKey="TOPBAR" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <div className="bg-[#0a0c0e] border-b border-gray-800 text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
              <div className="flex items-center gap-3 sm:gap-4 text-gray-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-tactical-gold" /> 
                  <span className="truncate">{sections.TOPBAR?.title || 'Atendimento Especializado'}</span>
                </span>
                <span className="hidden md:flex items-center gap-1 border-l border-gray-800 pl-4 font-mono">
                  <Star className="w-3.5 h-3.5 text-tactical-gold fill-tactical-gold" /> {sections.TOPBAR?.subtitle || 'Avaliação 4.9/5.0'}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-gray-400">
                {sections.TOPBAR?.featuredLabel && (
                  <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded shadow uppercase font-mono tracking-wider text-[10px] sm:text-xs animate-pulse flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {sections.TOPBAR?.featuredLabel}
                  </span>
                )}
                <span className="bg-tactical-gold/10 text-tactical-gold px-2 sm:px-2.5 py-0.5 rounded font-bold border border-tactical-gold/30 text-[10px] sm:text-xs">
                  {sections.TOPBAR?.buttonText || 'EQUIPAMENTOS TÁTICOS'}
                </span>
                
                {currentUser && (
                  <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
                    <span className="text-white font-bold flex items-center gap-1 text-[11px]">
                      <User className="w-3 h-3 text-tactical-gold" /> {currentUser.name}
                    </span>
                    <button onClick={onLogout} title="Sair" className="text-gray-500 hover:text-red-400 cursor-pointer">
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </EditableSection>

        {/* 2. MAIN HEADER (LOGO, BUSCA INSTANTÂNEA, NAVEGAÇÃO E CARRINHO) */}
        <EditableSection sectionKey="HEADER" isCmsMode={isCmsMode} onEditSection={onEditSection}>
          <header className="bg-[#0f1115]/95 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
              
              {/* Logo com clique para ir para a Home */}
              <div 
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0" 
                onClick={() => goToLanding()}
                title="Ir para a Apresentação"
              >
                <img 
                  src="/logo-comandos.png" 
                  alt="Comandos Artigos Militares" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-tactical-gold/60 shadow-md group-hover:scale-105 transition-transform" 
                />
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-tactical text-xl sm:text-2xl text-white tracking-widest font-black leading-none group-hover:text-tactical-gold transition-colors">
                      {sections.HEADER?.title || 'COMANDOS'}
                    </span>
                    {sections.HEADER?.featuredLabel && (
                      <span className="bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {sections.HEADER?.featuredLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-tactical-gold font-bold tracking-[0.2em] uppercase leading-none block mt-0.5">
                    {sections.HEADER?.subtitle || 'ARTIGOS MILITARES'}
                  </span>
                </div>
              </div>

              {/* BARRA DE PESQUISA EM TEMPO REAL */}
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md relative" ref={searchRef}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    className="w-full bg-[#171a21] border border-gray-700 hover:border-gray-600 rounded-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-tactical-gold focus:ring-1 focus:ring-tactical-gold transition-all"
                    placeholder="Pesquisar por nome, bota, jaqueta, cinto..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                  />
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-3 sm:left-3.5" />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 text-xs text-gray-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* JANELINHA DE PESQUISA EM TEMPO REAL (LIVE POPOVER) */}
                {isSearchOpen && searchTerm.trim() !== '' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-[92vw] sm:w-[110%] max-w-lg md:w-full mt-2 bg-[#141619] border border-gray-700 rounded-lg shadow-2xl z-50 max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-gray-800">
                    
                    {/* Categorias Encontradas */}
                    {searchResultsCategories.length > 0 && (
                      <div className="p-2.5 sm:p-3 bg-[#0f1115]">
                        <span className="text-[10px] font-bold uppercase text-tactical-gold tracking-wider block mb-1.5">
                          🏷️ CATEGORIAS ENCONTRADAS
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
                              className="text-xs bg-gray-800 hover:bg-tactical-gold hover:text-black text-gray-200 px-2.5 py-1 rounded font-bold transition-colors cursor-pointer"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Produtos Encontrados */}
                    <div className="p-2.5 sm:p-3">
                      <span className="text-[10px] font-bold uppercase text-tactical-gold tracking-wider block mb-2">
                        📦 PRODUTOS ENCONTRADOS ({searchResultsProducts.length})
                      </span>
                      
                      {searchResultsProducts.length === 0 ? (
                        <div className="text-xs text-gray-500 py-4 text-center">
                          Nenhum produto encontrado para "{searchTerm}".
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {searchResultsProducts.map(prod => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                handleOpenProductDetail(prod);
                                setIsSearchOpen(false);
                              }}
                              className="flex items-start gap-3 p-2 bg-[#171a21] hover:bg-[#1e232d] rounded-lg cursor-pointer transition-all border border-gray-800 hover:border-tactical-gold/50"
                            >
                              <div className="w-12 h-12 bg-black rounded border border-gray-800 overflow-hidden flex-shrink-0 mt-0.5">
                                <MediaViewer mediaUrl={prod.media?.[0]?.url} mediaType={prod.media?.[0]?.type} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="text-xs font-bold text-white leading-snug">{prod.title}</div>
                                <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                                  <span className="text-[10px] text-gray-400">{prod.category?.name || 'Tático'}</span>
                                  <div className="flex items-baseline gap-1.5 font-mono">
                                    {prod.promoPrice && Number(prod.promoPrice) > 0 && Number(prod.promoPrice) < Number(prod.price) ? (
                                      <>
                                        <span className="text-xs font-black text-tactical-gold whitespace-nowrap">
                                          R$ {parseFloat(prod.promoPrice).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-gray-500 line-through">
                                          R$ {parseFloat(prod.price).toFixed(2)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-xs font-black text-tactical-gold whitespace-nowrap">
                                        R$ {parseFloat(prod.price).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* NAVEGAÇÃO DESKTOP: ABAS LIMPAS ENTRE APRESENTAÇÃO E LOJA */}
              <nav className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider font-tactical">
                <button
                  type="button"
                  onClick={() => goToLanding()}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'LANDING'
                      ? 'bg-tactical-gold text-black shadow-sm'
                      : 'text-gray-300 hover:text-tactical-gold hover:bg-gray-800/60'
                  }`}
                >
                  <span>HOME</span>
                </button>

                <button
                  type="button"
                  onClick={() => goToStore('ALL')}
                  className={`px-3.5 py-1.5 rounded transition-all cursor-pointer flex items-center gap-2 ${
                    activeView === 'STORE'
                      ? 'bg-tactical-gold text-black shadow-sm'
                      : 'bg-[#181c24] text-tactical-gold border border-tactical-gold/40 hover:bg-tactical-gold hover:text-black'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>LOJA / CATÁLOGO</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                    activeView === 'STORE' ? 'bg-black text-tactical-gold' : 'bg-black/60 text-tactical-gold'
                  }`}>
                    {products.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeView === 'LANDING') {
                      goToLanding('categorias');
                    } else {
                      setIsAccordionOpen(prev => !prev);
                    }
                  }}
                  className="px-3 py-1.5 rounded text-gray-300 hover:text-tactical-gold hover:bg-gray-800/60 transition-all cursor-pointer"
                >
                  CATEGORIAS
                </button>

                <button
                  type="button"
                  onClick={() => goToLanding('video-feature')}
                  className="px-3 py-1.5 rounded text-gray-300 hover:text-tactical-gold hover:bg-gray-800/60 transition-all cursor-pointer"
                >
                  MÍDIA & VÍDEOS
                </button>

                <button
                  type="button"
                  onClick={handleTogglePromosFilter}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterOnlyPromos && activeView === 'STORE'
                      ? 'bg-red-600 text-white font-black shadow-lg ring-2 ring-red-400/40'
                      : 'text-red-400 hover:text-red-300 hover:bg-red-950/40'
                  }`}
                  title="Filtrar catálogo por produtos em oferta"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>OFERTAS</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                    filterOnlyPromos && activeView === 'STORE' ? 'bg-black text-white' : 'bg-red-900/60 text-red-200'
                  }`}>
                    {totalPromoProducts}
                  </span>
                </button>
              </nav>

              {/* BOTÃO DO CARRINHO */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={onOpenCart}
                  className="relative bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-base sm:text-lg font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm transition-all flex items-center gap-1.5 sm:gap-2 shadow active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">PEDIDO</span>
                  {cartCount > 0 && (
                    <span className="bg-black text-tactical-gold text-xs font-sans font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* SUB-BARRA MOBILE PARA TROCA RÁPIDA DE VISUALIZAÇÃO (lg:hidden) */}
            <div className="lg:hidden border-t border-gray-800/80 bg-[#12151b] px-3 py-1.5 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => goToLanding()}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-tactical font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeView === 'LANDING'
                    ? 'bg-tactical-gold text-black shadow'
                    : 'text-gray-400 hover:text-white bg-gray-800/50'
                }`}
              >
                <span>HOME</span>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); goToStore('ALL'); }}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-tactical font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeView === 'STORE' && !filterOnlyPromos
                    ? 'bg-tactical-gold text-black shadow'
                    : 'text-tactical-gold hover:text-white bg-tactical-gold/10 border border-tactical-gold/30'
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>LOJA ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePromosFilter}
                className={`py-1 px-2 rounded text-[11px] font-tactical font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeView === 'STORE' && filterOnlyPromos
                    ? 'bg-red-600 text-white shadow font-black'
                    : 'text-red-400 hover:text-white bg-red-950/40 border border-red-800/60'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>OFERTAS ({totalPromoProducts})</span>
              </button>
            </div>
          </header>
        </EditableSection>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════════
          MODO 1: VISUALIZAÇÃO DEDICADA DA LOJA (PRODUTOS, FILTROS, SEM O HERO GIGANTE)
         ════════════════════════════════════════════════════════════════════════════════ */}
      {activeView === 'STORE' && !isCmsMode && (
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 animate-fadeIn">
          
          {/* Barra de Topo da Loja com Breadcrumb, Contador e Filtros Rápidos (Compacta e Dinâmica) */}
          <div className="bg-[#141619] border border-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToLanding()}
                  className="text-xs font-bold text-tactical-gold hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-tactical-gold/10 hover:bg-tactical-gold/20 px-2 py-0.5 rounded"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar à Apresentação</span>
                </button>
                <span className="text-gray-600">/</span>
                <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
                  {selectedCategoryId === 'ALL' ? 'Todas as Categorias' : selectedCategoryName}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                <h1 className="font-tactical text-xl sm:text-3xl font-bold text-white tracking-wide">
                  {sections.BESTSELLERS_HEADER?.title || 'LOJA & CATÁLOGO TÁTICO'}
                </h1>
                {sections.BESTSELLERS_HEADER?.featuredLabel && (
                  <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {sections.BESTSELLERS_HEADER?.featuredLabel}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs">
                {sections.BESTSELLERS_HEADER?.subtitle || 'Equipamentos de elite e vestuário tático para pronta entrega.'}
              </p>
            </div>

            {/* Chips de Oferta — aparecem SOMENTE se houver ofertas cadastradas (totalPromoProducts > 0) */}
            {totalPromoProducts > 0 && (
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryId === 'ALL' && !filterOnlyPromos
                      ? 'bg-tactical-gold text-black font-extrabold shadow'
                      : 'bg-gray-800 text-gray-300 hover:text-white border border-gray-700'
                  }`}
                >
                  Todos ({products.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterOnlyPromos(prev => !prev)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterOnlyPromos
                      ? 'bg-red-600 text-white font-extrabold shadow'
                      : 'bg-red-950/40 text-red-300 border border-red-900/60 hover:bg-red-900/60'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>Oferta ({totalPromoProducts})</span>
                </button>

                {(selectedCategoryId !== 'ALL' || filterOnlyPromos) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); }}
                    className="text-xs text-gray-400 hover:text-white underline ml-1 cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Banner de Aviso Visual Quando o Filtro de Ofertas Estiver Ativo */}
          {filterOnlyPromos && (
            <div className="bg-red-950/40 border border-red-800/80 rounded-lg p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-200 text-xs sm:text-sm animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-600/30 flex items-center justify-center text-red-400 flex-shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-2">
                    <span>Filtro Ativo: Produtos em Oferta</span>
                    <span className="bg-red-600 text-white text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
                    </span>
                  </p>
                  <p className="text-xs text-red-300/80">Exibindo apenas produtos com desconto e preço promocional ativo.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFilterOnlyPromos(false)}
                className="bg-red-900/60 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ver Todos os Produtos ({products.length})</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* 1. MENU LATERAL DE CATEGORIAS (DESKTOP) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              <div className="bg-[#141619] border border-gray-800 rounded-lg p-4 space-y-3 sticky top-36 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-tactical-gold" />
                    <span className="text-sm font-bold text-white font-tactical tracking-wider uppercase">
                      CATEGORIAS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">
                    {categories.length} grupos
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                  <button
                    onClick={() => setSelectedCategoryId('ALL')}
                    className={`p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      selectedCategoryId === 'ALL'
                        ? 'bg-tactical-gold text-black border-tactical-gold font-bold shadow'
                        : 'bg-[#171a21] text-gray-300 border-gray-800 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center text-tactical-gold font-bold text-xs">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Todas as Categorias</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedCategoryId === 'ALL' ? 'bg-black/30 text-black' : 'bg-black/50 text-tactical-gold'}`}>
                      {products.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-tactical-gold text-black border-tactical-gold font-bold shadow'
                            : 'bg-[#171a21] text-gray-300 border-gray-800 hover:border-gray-600 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-7 h-7 rounded object-cover flex-shrink-0 border border-gray-700/50"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                              <Tag className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="text-xs truncate">{cat.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${isSelected ? 'bg-black/30 text-black' : 'bg-black/50 text-tactical-gold'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. MENU SANFONA DE CATEGORIAS (MOBILE) */}
            <div className="lg:hidden col-span-full mb-3 space-y-2">
              <div className="flex items-center justify-between bg-[#141619] border border-gray-800 p-2.5 rounded-lg shadow">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-tactical-gold" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">FILTRAR CATEGORIA:</span>
                  <span className="text-[10px] font-mono bg-tactical-gold/20 text-tactical-gold px-1.5 py-0.5 rounded font-bold truncate max-w-[120px]">
                    {selectedCategoryName}
                  </span>
                </div>

                <button
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="flex items-center gap-1 text-xs font-bold text-tactical-gold bg-tactical-gold/10 hover:bg-tactical-gold/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <span>{isAccordionOpen ? 'FECHAR' : 'VER LISTA'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Menu Expandido Celular */}
              {isAccordionOpen && (
                <div className="bg-[#141619] border border-gray-800 rounded-lg p-3 space-y-2 animate-fadeIn shadow-xl">
                  <span className="text-[10px] font-bold text-tactical-gold uppercase tracking-wider block border-b border-gray-800 pb-1.5">
                    SELECIONE UMA CATEGORIA:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedCategoryId('ALL'); setIsAccordionOpen(false); }}
                      className={`p-2.5 rounded-lg border text-left flex justify-between items-center cursor-pointer ${
                        selectedCategoryId === 'ALL' ? 'bg-tactical-gold text-black font-bold' : 'bg-[#171a21] text-gray-300 border-gray-800'
                      }`}
                    >
                      <span className="text-xs font-bold">Todas as Categorias</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/30">{products.length}</span>
                    </button>

                    {categories.map((cat) => {
                      const count = products.filter(p => p.categoryId === cat.id).length;
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategoryId(cat.id); setIsAccordionOpen(false); }}
                          className={`p-2.5 rounded-lg border text-left flex justify-between items-center cursor-pointer ${
                            isSelected ? 'bg-tactical-gold text-black font-bold' : 'bg-[#171a21] text-gray-300 border-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                            ) : (
                              <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-xs truncate">{cat.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-black/30 text-black' : 'bg-black/50 text-tactical-gold'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. GRADE DE PRODUTOS RESPONSIVA */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {loadingProducts ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#171a21] border border-gray-800 rounded-sm overflow-hidden animate-pulse flex flex-col justify-between h-[360px] p-3 space-y-3">
                      <div className="aspect-square bg-gray-800/80 rounded w-full" />
                      <div className="space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="h-2.5 bg-gray-800 rounded w-1/3" />
                          <div className="h-4 bg-gray-800 rounded w-3/4" />
                        </div>
                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                        <div className="h-9 bg-gray-800 rounded w-full mt-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  filteredProducts.map((prod) => {
                    const primaryMedia = prod.media?.[0];
                    const hasVariants = prod.variants && prod.variants.length > 0;
                    const numPrice = parseFloat(prod.price) || 0;
                    const numPromo = prod.promoPrice ? parseFloat(prod.promoPrice) : null;
                    const hasPromo = numPromo !== null && numPromo > 0 && numPromo < numPrice;
                    const discountPercent = hasPromo ? Math.round(((numPrice - numPromo) / numPrice) * 100) : 0;
                    const displayPrice = hasPromo ? numPromo : numPrice;
                    const originalPrice = hasPromo ? numPrice : null;

                    return (
                      <div key={prod.id} className="product-card-light gsap-bestseller-card rounded-sm overflow-hidden flex flex-col justify-between group border border-gray-200 shadow-md">
                        
                        {/* Imagem Clicável (Abre Detalhes do Produto) */}
                        <div 
                          className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                          onClick={() => handleOpenProductDetail(prod)}
                        >
                          <MediaViewer
                            mediaUrl={primaryMedia?.url}
                            mediaType={primaryMedia?.type}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Badges de Destaque / Promoção / Sob Encomenda */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
                            {prod.isMadeToOrder && (
                              <span className="bg-amber-500 text-black font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded shadow uppercase font-mono tracking-wider flex items-center gap-1">
                                🚚 SOB ENCOMENDA
                              </span>
                            )}
                            {hasPromo && (
                              <span className="bg-red-600 text-white font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded shadow uppercase font-mono tracking-wider">
                                -{discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          <button className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/80 hover:bg-white p-1 sm:p-1.5 rounded-full text-gray-700 shadow transition-all cursor-pointer">
                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Categoria do Produto */}
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                              {prod.category?.name || 'TÁTICO'}
                            </span>
                            
                            {/* Título Clicável */}
                            <h3 
                              onClick={() => handleOpenProductDetail(prod)}
                              className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-amber-600 cursor-pointer transition-colors"
                            >
                              {prod.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 text-[10px] sm:text-xs">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-gray-500 text-[9px] sm:text-[10px] ml-0.5">({prod.reviewsCount || 12})</span>
                          </div>

                          {/* Badge de indicação de Variantes/Tamanhos */}
                          {hasVariants && (
                            <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono bg-gray-100 p-1 sm:p-1.5 rounded border border-gray-200 truncate">
                              📏 Vários Tamanhos
                            </div>
                          )}

                          <div className="pt-1.5 sm:pt-2 border-t border-gray-100">
                            <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <span className="text-sm sm:text-lg font-black text-gray-900 font-mono">
                                R$ {displayPrice.toFixed(2)}
                              </span>
                              {originalPrice !== null && (
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                                  R$ {originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleProductCardAddToCart(prod)}
                              className="w-full h-9 sm:h-10 bg-[#141619] hover:bg-tactical-gold hover:text-black text-white font-tactical text-sm sm:text-base font-bold rounded-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                            >
                              <ShoppingBag className="w-4 h-4 flex-shrink-0" /> 
                              <span className="tracking-wider">{hasVariants ? 'VER TAMANHOS' : 'ADICIONAR'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {filteredProducts.length === 0 && !loadingProducts && (
                  <div className="col-span-full py-16 text-center text-gray-400 bg-[#141619] rounded-lg border border-gray-800 p-8 space-y-3">
                    <p className="text-sm">Nenhum produto encontrado com os filtros selecionados.</p>
                    <button
                      onClick={() => { setSelectedCategoryId('ALL'); setFilterOnlyPromos(false); }}
                      className="bg-tactical-gold text-black font-bold px-4 py-2 rounded text-xs cursor-pointer"
                    >
                      Ver Todos os Produtos
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Diferenciais Táticos ao final da Loja (Reforço de Confiança) */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <EditableSection sectionKey="VALUE_PROPS" isCmsMode={isCmsMode} onEditSection={onEditSection}>
              <div className="bg-[#0a0c0e] p-6 sm:p-8 rounded-lg border border-gray-800/80">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {parseValueProps(sections.VALUE_PROPS).map((item, idx) => {
                    const Icon = item.Icon;
                    return (
                      <div key={idx} className="flex flex-col items-center space-y-1.5">
                        <Icon className="w-6 h-6 text-tactical-gold" />
                        <h4 className="font-tactical text-base font-bold text-white tracking-wider">{item.title}</h4>
                        <p className="text-gray-500 text-[11px]">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </EditableSection>
          </div>

        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════
          MODO 2: LANDING PAGE DE APRESENTAÇÃO (LIMPA, CONCEITUAL & ALTA CONVERSÃO)
         ════════════════════════════════════════════════════════════════════════════════ */}
      {(activeView === 'LANDING' || isCmsMode) && (
        <>
          {/* 3. HERO BANNER PRINCIPAL COM BOTÃO CTA LEVANDO DIRETO PARA A LOJA */}
          <EditableSection sectionKey="HERO_MAIN" isCmsMode={isCmsMode} onEditSection={onEditSection}>
            <section className="relative bg-[#0f1115] border-b border-gray-800 overflow-hidden">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center min-h-[480px] sm:min-h-[520px]">
                
                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 space-y-5 sm:space-y-6 z-10 gsap-hero-content">
                  {sections.HERO_MAIN?.featuredLabel && (
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white border border-red-500 shadow-md px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-sm animate-pulse">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{sections.HERO_MAIN?.featuredLabel}</span>
                    </div>
                  )}

                  <h1 className="font-tactical text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
                    {sections.HERO_MAIN?.title || 'COMBAT ESSENTIALS'}
                  </h1>

                  <p className="text-gray-300 text-xs sm:text-base leading-relaxed max-w-lg">
                    {sections.HERO_MAIN?.subtitle}
                  </p>

                  {/* BOTÃO PRINCIPAL DE AÇÃO: LEVA EXCLUSIVAMENTE PARA A LOJA DE PRODUTOS */}
                  <div className="pt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCmsMode) handleNavigateLink(sections.HERO_MAIN?.buttonLink || '#loja');
                      }}
                      className="bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-lg sm:text-2xl font-bold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-sm shadow-xl transition-all inline-flex items-center gap-2.5 group cursor-pointer active:scale-95"
                    >
                      <span>{sections.HERO_MAIN?.buttonText || 'IR PARA A LOJA >'}</span>
                      <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isCmsMode) goToLanding('categorias');
                      }}
                      className="text-gray-300 hover:text-tactical-gold font-tactical text-sm sm:text-lg font-bold px-3 py-2 transition-colors cursor-pointer"
                    >
                      {sections.HERO_MAIN?.secondaryButtonText || 'VER CATEGORIAS ↓'}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 h-full min-h-[280px] sm:min-h-[350px] relative bg-black gsap-hero-media">
                  <MediaViewer
                    mediaUrl={sections.HERO_MAIN?.mediaUrl}
                    mediaType={sections.HERO_MAIN?.mediaType}
                    className="w-full h-full min-h-[280px] sm:min-h-[400px] object-cover"
                  />
                </div>
              </div>
            </section>
          </EditableSection>

          {/* CARD RESUMO EXCLUSIVO DO CMS QUANDO EM isCmsMode (SUBSTITUI OS 20 PRODUTOS NO CMS) */}
          {isCmsMode && (
            <EditableSection sectionKey="BESTSELLERS_HEADER" isCmsMode={isCmsMode} onEditSection={onEditSection}>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-[#141619] border border-tactical-gold/40 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1.5 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2.5 text-tactical-gold font-bold text-sm uppercase flex-wrap">
                      <ShoppingBag className="w-5 h-5" />
                      <span>{sections.BESTSELLERS_HEADER?.title || 'BESTSELLERS & CATÁLOGO'}</span>
                      {sections.BESTSELLERS_HEADER?.featuredLabel && (
                        <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {sections.BESTSELLERS_HEADER?.featuredLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-xs max-w-xl">
                      {sections.BESTSELLERS_HEADER?.subtitle || 'Clique nos produtos para ver todas as especificações e selecionar tamanhos/medidas.'}
                    </p>
                    <p className="text-gray-500 text-[11px] pt-1">
                      🛡️ <em>Área CMS da Landing Page: A grade completa de produtos é exibida na Loja pública e gerenciada na aba "PRODUTOS" do Admin.</em>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-gray-800 text-tactical-gold font-mono font-bold px-3 py-1.5 rounded border border-gray-700">
                      {products.length} Produtos Cadastrados
                    </span>
                  </div>
                </div>
              </div>
            </EditableSection>
          )}

          {/* 4. POPULAR CATEGORIES (5 BANNERS COM CLIQUE DIRETO PARA A LOJA FILTRADA) */}
          <EditableSection sectionKey="POPULAR_CATEGORIES" isCmsMode={isCmsMode} onEditSection={onEditSection}>
            <section id="categorias" className="bg-[#141619] py-10 sm:py-16 border-y border-gray-800">
              <div className="max-w-7xl mx-auto px-4">
                
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h2 className="font-tactical text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide">
                      {sections.POPULAR_CATEGORIES?.title || 'POPULAR CATEGORIES'}
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      {sections.POPULAR_CATEGORIES?.subtitle || 'Navegue pelas nossas categorias principais de alta demanda.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { if (!isCmsMode) goToStore('ALL'); }}
                    className="text-tactical-gold hover:text-white font-tactical text-sm sm:text-base font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{sections.POPULAR_CATEGORIES?.secondaryButtonText || 'VER TODOS OS PRODUTOS'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Banner Destaque da Categoria Principal (Esquerda) */}
                  <div
                    className="lg:col-span-7 relative h-[380px] sm:h-[440px] rounded-sm overflow-hidden group cursor-pointer border border-gray-800 gsap-category-card"
                    onClick={() => {
                      if (!isCmsMode) {
                        handleNavigateLink(sections.POPULAR_CATEGORIES?.buttonLink || '#loja');
                      }
                    }}
                  >
                    <img
                      src={sections.POPULAR_CATEGORIES?.mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80'}
                      alt={sections.POPULAR_CATEGORIES?.featuredTitle || 'Categoria Destaque'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                      {sections.POPULAR_CATEGORIES?.featuredLabel !== '' && (
                        <span className="text-tactical-gold text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {sections.POPULAR_CATEGORIES?.featuredLabel || 'CATEGORIA DESTAQUE'}
                        </span>
                      )}
                      <h3 className="font-tactical text-3xl sm:text-5xl font-bold text-white tracking-widest leading-tight">
                        {sections.POPULAR_CATEGORIES?.featuredTitle || 'OUTERWEAR & PROTEÇÃO'}
                      </h3>
                      <button className="mt-4 bg-tactical-gold text-black font-tactical text-lg sm:text-xl font-bold px-6 py-2.5 w-fit group-hover:bg-white transition-colors">
                        {sections.POPULAR_CATEGORIES?.buttonText || 'EXPLORAR NA LOJA >'}
                      </button>
                    </div>
                  </div>

                  {/* 4 Quadros Menores da Direita */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
                    {(() => {
                      const rawSlotIds = sections.POPULAR_CATEGORIES?.subCategoryIds
                        ? sections.POPULAR_CATEGORIES.subCategoryIds.split(',')
                        : [];

                      const secondaryCategories = [0, 1, 2, 3].map((idx) => {
                        const chosenId = rawSlotIds[idx];
                        if (chosenId) {
                          const found = categories.find(c => String(c.id) === String(chosenId));
                          if (found) return found;
                        }
                        return categories[idx] || null;
                      }).filter(Boolean);

                      return secondaryCategories.map((cat, i) => (
                        <div
                          key={cat.id || i}
                          className="relative h-44 sm:h-52 rounded-sm overflow-hidden group cursor-pointer border border-gray-800 z-10 pointer-events-auto gsap-category-card"
                          onClick={(e) => {
                            if (!isCmsMode) {
                              goToStore(cat.id);
                            } else {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-3 sm:p-4 flex items-end">
                            <h4 className="font-tactical text-base sm:text-lg font-bold text-white leading-tight">{cat.name}</h4>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-tactical-gold text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                            {products.filter(p => p.categoryId === cat.id).length} itens
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </section>
          </EditableSection>

          {/* 5. VÍDEO FEATURE (DEMONSTRAÇÃO INSTITUCIONAL & BALÍSTICA) */}
          <EditableSection sectionKey="VIDEO_FEATURE" isCmsMode={isCmsMode} onEditSection={onEditSection}>
            <section id="video-feature" className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                <div className="lg:col-span-6 relative rounded-sm overflow-hidden border border-gray-800 shadow-2xl bg-black gsap-video-media">
                  <div className="relative aspect-video">
                    <MediaViewer
                      mediaUrl={sections.VIDEO_FEATURE?.mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80'}
                      mediaType={sections.VIDEO_FEATURE?.mediaType || 'IMAGE'}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4 sm:space-y-6 gsap-video-text">
                  {sections.VIDEO_FEATURE?.featuredLabel !== '' && (
                    <span className="text-tactical-gold text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {sections.VIDEO_FEATURE?.featuredLabel || 'ENGENHARIA E RESISTÊNCIA MILITAR'}
                    </span>
                  )}
                  <h2 className="font-tactical text-3xl sm:text-5xl font-bold text-white leading-tight">
                    {sections.VIDEO_FEATURE?.title || 'TACTICAL EQUIPMENT AND MILITARY GEAR'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {sections.VIDEO_FEATURE?.subtitle}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => { if (!isCmsMode) handleNavigateLink(sections.VIDEO_FEATURE?.buttonLink || '#loja'); }}
                      className="bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-lg sm:text-2xl font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm shadow transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                    >
                      <span>{sections.VIDEO_FEATURE?.buttonText || 'EXPLORAR EQUIPAMENTOS >'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </EditableSection>

          {/* 6. PROMOTIONAL WARRIOR BANNER (CTA DE OFERTA PARA A LOJA) */}
          <EditableSection sectionKey="WARRIOR_PROMO" isCmsMode={isCmsMode} onEditSection={onEditSection}>
            <section id="promocao" className="relative bg-gradient-to-r from-black via-[#141619] to-black py-12 sm:py-16 border-y border-gray-800 overflow-hidden gsap-promo-banner">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-2 text-center md:text-left">
                  {sections.WARRIOR_PROMO?.featuredLabel && (
                    <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-sm uppercase tracking-wider">
                      {sections.WARRIOR_PROMO?.featuredLabel}
                    </span>
                  )}
                  <h2 className="font-tactical text-4xl sm:text-6xl font-bold text-white tracking-widest leading-none">
                    {sections.WARRIOR_PROMO?.title || 'WARRIOR ASSAULT SYSTEMS'}
                  </h2>
                  <p className="text-tactical-gold font-bold text-base sm:text-xl">{sections.WARRIOR_PROMO?.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() => { if (!isCmsMode) handleNavigateLink(sections.WARRIOR_PROMO?.buttonLink || '#ofertas'); }}
                  className="bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-2xl sm:text-3xl font-bold px-8 sm:px-10 py-3 rounded-sm shadow-2xl transition-all flex-shrink-0 cursor-pointer active:scale-95"
                >
                  {sections.WARRIOR_PROMO?.buttonText || 'SHOP NOW >'}
                </button>
              </div>
            </section>
          </EditableSection>

          {/* 7. PROPOSIÇÕES DE VALOR (DIFERENCIAIS TÁTICOS) */}
          <EditableSection sectionKey="VALUE_PROPS" isCmsMode={isCmsMode} onEditSection={onEditSection}>
            <section className="bg-[#0a0c0e] py-10 sm:py-14 border-b border-gray-800">
              <div className="max-w-7xl mx-auto px-4">
                {sections.VALUE_PROPS?.featuredLabel && (
                  <div className="text-center mb-3">
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-3 py-1 rounded shadow uppercase font-mono tracking-wider animate-pulse inline-flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      {sections.VALUE_PROPS?.featuredLabel}
                    </span>
                  </div>
                )}
                {sections.VALUE_PROPS?.title && (
                  <div className="text-center mb-8">
                    <h2 className="font-tactical text-2xl sm:text-3xl font-bold text-white tracking-wide">{sections.VALUE_PROPS?.title}</h2>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 gsap-value-container">
                  {parseValueProps(sections.VALUE_PROPS).map((item, idx) => {
                    const Icon = item.Icon;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center space-y-2 gsap-value-item">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-tactical-gold" />
                        <h4 className="font-tactical text-lg sm:text-xl font-bold text-white tracking-wider">{item.title}</h4>
                        <p className="text-gray-500 text-[11px] sm:text-xs">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </EditableSection>
        </>
      )}

      {/* 8. FOOTER - 100% EDITÁVEL VIA CMS (SEMPRE VISÍVEL) */}
      <EditableSection sectionKey="FOOTER_CONTACT" isCmsMode={isCmsMode} onEditSection={onEditSection}>
        <footer className="bg-black text-gray-400 py-10 sm:py-12 text-xs border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Coluna 1: Nome da Loja & Descrição */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src="/logo-comandos.png" 
                  alt="Comandos Artigos Militares" 
                  className="w-9 h-9 rounded-full object-cover border border-tactical-gold/50 shadow" 
                />
                <div className="font-tactical text-2xl sm:text-3xl font-bold text-white tracking-wider">
                  {sections.FOOTER_CONTACT?.title || 'COMANDOS ARTIGOS MILITARES'}
                </div>
              </div>
              <p className="text-gray-500 leading-relaxed text-[11px] sm:text-xs">
                {sections.FOOTER_CONTACT?.subtitle || 'Líder em camisas camufladas, vestuário operacional e equipamentos táticos com atendimento direto.'}
              </p>
            </div>

            {/* Coluna 2: Navegação Rápida */}
            <div>
              <h5 className="font-tactical text-base sm:text-lg font-bold text-white mb-3 tracking-wider">
                {sections.FOOTER_CONTACT?.featuredTitle || 'NAVEGAÇÃO RÁPIDA'}
              </h5>
              <ul className="space-y-1.5">
                {(sections.FOOTER_CONTACT?.navLinks || 'Home:#home|Loja:#loja|Categorias:#categorias|Mídia e Vídeos:#video-feature|Ofertas:#loja')
                  .split('|').map((item, i) => {
                    const parts = item.split(':');
                    const label = parts[0];
                    const target = parts[1] || '#';
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => {
                            if (target.includes('loja') || target.includes('store') || target.includes('catalogo')) {
                              goToStore();
                            } else {
                              const sec = target.replace('#', '');
                              goToLanding(sec);
                            }
                          }}
                          className="hover:text-tactical-gold transition-colors cursor-pointer text-left"
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Coluna 3: Atendimento */}
            <div>
              <h5 className="font-tactical text-base sm:text-lg font-bold text-white mb-3 tracking-wider">
                {sections.FOOTER_CONTACT?.featuredLabel || 'ATENDIMENTO'}
              </h5>
              <ul className="space-y-1.5">
                {(sections.FOOTER_CONTACT?.buttonText || 'WhatsApp: Central de Atendimento|Email: contato@comandosartigosmilitares.com|Segunda a Sexta: 08h às 18h')
                  .split('|').map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>

            {/* Coluna 4: Segurança & Pagamento */}
            <div>
              <h5 className="font-tactical text-base sm:text-lg font-bold text-white mb-3 tracking-wider">
                {sections.FOOTER_CONTACT?.secTitle || 'SEGURANÇA & PAGAMENTO'}
              </h5>
              <p className="text-gray-500 mb-2 text-[11px] sm:text-xs">
                {sections.FOOTER_CONTACT?.secText || 'Ambiente 100% seguro com criptografia de ponta a ponta.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(sections.FOOTER_CONTACT?.paymentBadges || 'PIX|Cartão|Boleto')
                  .split('|').map((badge, idx) => (
                    <span key={idx} className="bg-gray-900 px-2 py-1 rounded text-[10px] font-bold text-gray-300 border border-gray-800">
                      {badge.trim()}
                    </span>
                  ))}
              </div>
            </div>

          </div>

          {/* Rodapé / Copyright */}
          <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-900 text-center text-gray-600 text-[11px]">
            {sections.FOOTER_CONTACT?.copyrightText || `© ${new Date().getFullYear()} COMANDOS ARTIGOS MILITARES. Todos os direitos reservados.`}
          </div>
        </footer>
      </EditableSection>

      {/* 9. BARRA FLUTUANTE DE CARRINHO MOBILE (DISPATCH RÁPIDO) */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={onOpenCart}
            className="w-full bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-lg font-bold py-3 px-4 rounded-lg shadow-2xl flex items-center justify-between border border-black/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-black text-tactical-gold text-[10px] font-sans font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="tracking-wider text-base sm:text-lg">SOLICITAÇÃO DE MATERIAIS</span>
            </div>

            <div className="flex items-center gap-1 bg-black/20 text-black px-2.5 py-1 rounded font-mono text-xs font-bold">
              <span>VER</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
