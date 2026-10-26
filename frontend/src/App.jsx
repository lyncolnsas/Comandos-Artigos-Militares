import React, { useState, useEffect } from 'react';
import StoreFront from './components/StoreFront';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Preloader from './components/Preloader';

// Preloader Inteligente com Cooldown de 30 minutos (Cookies + LocalStorage)
const PRELOADER_STORAGE_KEY = 'comandos_preloader_last_shown';
const PRELOADER_COOKIE_NAME = 'comandos_preloader_seen';
const PRELOADER_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutos em milissegundos

function isPreloaderOnCooldown() {
  try {
    // 1. Verificar Cookie
    if (typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + PRELOADER_COOKIE_NAME + '=([^;]*)'));
      if (match) return true;
    }

    // 2. Verificar LocalStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(PRELOADER_STORAGE_KEY);
      if (stored) {
        const elapsed = Date.now() - parseInt(stored, 10);
        if (elapsed < PRELOADER_COOLDOWN_MS) {
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
}

function markPreloaderAsShown() {
  try {
    // Grava Cookie com validade de 30 minutos (1800s)
    if (typeof document !== 'undefined') {
      document.cookie = `${PRELOADER_COOKIE_NAME}=1; max-age=1800; path=/; SameSite=Lax`;
    }
    // Grava LocalStorage com timestamp
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRELOADER_STORAGE_KEY, Date.now().toString());
    }
  } catch (e) {}
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Se estiver dentro dos 30 minutos, preloaderDone já nasce true (pula o preloader)
  const [preloaderDone, setPreloaderDone] = useState(() => isPreloaderOnCooldown());
  
  const handlePreloaderComplete = () => {
    markPreloaderAsShown();
    setPreloaderDone(true);
  };
  
  // 1. Carregar carrinho persistido do localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('comandos_store_cart') || localStorage.getItem('bizu_store_cart') || localStorage.getItem('gama_store_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);

  // 2. Persistir carrinho no localStorage sempre que cartItems mudar
  useEffect(() => {
    try {
      localStorage.setItem('comandos_store_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    // Detectar rota discreta de admin (/admin ou ?admin=1)
    const path = window.location.pathname;
    const search = window.location.search;
    if (path === '/admin' || path.startsWith('/admin/') || search.includes('admin=true')) {
      setIsAdminRoute(true);
    }

    // Carregar usuário logado do localStorage
    const savedUser = localStorage.getItem('comandos_store_user') || localStorage.getItem('bizu_store_user') || localStorage.getItem('gama_store_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Escutar eventos de alteração de storage entre abas
    const handleStorageChange = (e) => {
      if (e.key === 'comandos_store_cart' || e.key === 'bizu_store_cart' || e.key === 'gama_store_cart') {
        try {
          setCartItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddToCart = (product) => {
    // Criar chave única para o item no carrinho (considerando cor e tamanho se existirem)
    const itemKey = product.variantId 
      ? `${product.id}_${product.selectedColor || ''}_${product.selectedSize || ''}`
      : (product.cartKey || product.id);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => (i.cartKey || i.id) === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (product.quantity || 1)
        };
        return updated;
      }
      return [...prevItems, { ...product, cartKey: itemKey, quantity: product.quantity || 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => ((i.cartKey || i.id) === itemKey ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((i) => (i.cartKey || i.id) !== itemKey));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('comandos_store_cart');
    localStorage.removeItem('bizu_store_cart');
    localStorage.removeItem('gama_store_cart');
  };

  const handleLogout = () => {
    localStorage.removeItem('comandos_store_token');
    localStorage.removeItem('comandos_store_user');
    localStorage.removeItem('bizu_store_token');
    localStorage.removeItem('bizu_store_user');
    localStorage.removeItem('gama_store_token');
    localStorage.removeItem('gama_store_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 font-sans selection:bg-tactical-gold selection:text-black">
      
      {/* High-Tech GSAP Tactical Preloader (Apenas no Storefront com Cooldown Inteligente de 30 min) */}
      {!isAdminRoute && !preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Roteamento discreto: Se rota for /admin exibe o Painel Admin, senão a Landing Page */}
      {isAdminRoute ? (
        <AdminPanel onGoToStore={() => {
          window.location.href = '/';
        }} />
      ) : (
        <StoreFront
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onAddToCart={handleAddToCart}
          cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Drawer do Carrinho */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

    </div>
  );
}
