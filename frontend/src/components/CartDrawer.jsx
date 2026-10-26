import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ShoppingBag, Trash2, Tag, Check, ArrowRight, MessageCircle, MapPin, 
  ShieldCheck, Zap, Truck, AlertCircle, Sparkles, ChevronLeft, Phone
} from 'lucide-react';

const IMPERATRIZ_NEIGHBORHOODS = [
  "Aero Clube", "Alto da Boa Vista", "Bacuri", "Beira Rio", "Boca da Mata", "Bom Jesus", "Bom Sucesso", "Caema", 
  "Centro", "Conjunto Vitória", "Entroncamento", "Jardim América", "Jardim Imperatriz", "Jardim São Luís", "Jardim Tropical", 
  "Juçara", "Maranhão Novo", "Mercadinho", "Mutirão", "Nova Imperatriz", "Parque Alvorada", "Parque Anhanguera", "Parque do Buriti", 
  "Parque Santa Lúcia", "Parque São José", "Planalto", "Santa Cruz", "Santa Inês", "Santa Rita", "Três Poderes", "Vila Cafeteira", 
  "Vila Fiquene", "Vila Ipiranga", "Vila Lobão", "Vila Machado", "Vila Mariana", "Vila Nova", "Vila Redenção", "Vila Vitória"
];

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Etapa do Carrinho: 'cart' | 'success'
  const [step, setStep] = useState('cart');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [botPublicConfig, setBotPublicConfig] = useState({ isBotEnabled: true, whatsappNumber: '' });

  useEffect(() => {
    fetch('/api/bot/public-config')
      .then(res => res.json())
      .then(data => setBotPublicConfig(data))
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    const numPrice = parseFloat(item.price) || 0;
    const numPromo = item.promoPrice ? parseFloat(item.promoPrice) : null;
    const hasPromo = numPromo !== null && numPromo > 0 && numPromo < numPrice;
    const effectivePrice = hasPromo ? numPromo : numPrice;
    return acc + effectivePrice * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim(), 
          amount: subtotal,
          items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity }))
        })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDirectWhatsAppCheckout = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod: 'WHATSAPP_DIRETO',
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        setCreatedOrderData(resData);
        setStep('success');
        onClearCart();

        if (resData.whatsappLink) {
          window.open(resData.whatsappLink, '_blank');
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao gerar solicitação de materiais.');
      }
    } catch (error) {
      alert('Erro de comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Container do Drawer: 100% da largura em mobile (<640px), fixo em 440px em desktop */}
      <div 
        className="w-full sm:max-w-md bg-white sm:border-l border-slate-200 text-slate-800 flex flex-col h-[100dvh] shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. HEADER ERGONÔMICO */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700 flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight uppercase leading-none text-slate-900 truncate">
                  {step === 'success' ? 'PEDIDO CONFIRMADO' : 'MEU CARRINHO'}
                </h3>
                {totalItemsCount > 0 && step === 'cart' && (
                  <span className="bg-forest-800 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block mt-1">
                {step === 'success' ? 'DISPARO CONCLUÍDO' : 'COMANDOS ARTIGOS MILITARES'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all flex-shrink-0 cursor-pointer"
            aria-label="Fechar carrinho"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. ETAPA 1: ITENS DO CARRINHO */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
            
            {/* Scroll Area dos Itens */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 min-w-0">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center mb-4 text-gray-600">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="font-tactical text-2xl font-bold text-gray-300 tracking-wider">CARRINHO VAZIO</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                    Nenhum equipamento operacional selecionado. Explore o catálogo tático e adicione materiais.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 bg-tactical-gold hover:bg-tactical-goldHover text-black font-tactical text-base font-bold px-6 py-2 rounded-sm transition-all shadow-md active:scale-95"
                  >
                    EXPLORAR CATÁLOGO
                  </button>
                </div>
              ) : (
                <>
                  {/* Lista de Produtos */}
                  {cartItems.map((item) => {
                    const itemKey = item.cartKey || item.id;
                    const numPrice = parseFloat(item.price) || 0;
                    const numPromo = item.promoPrice ? parseFloat(item.promoPrice) : null;
                    const hasPromo = numPromo !== null && numPromo > 0 && numPromo < numPrice;
                    const price = hasPromo ? numPromo : numPrice;
                    const originalPrice = hasPromo ? numPrice : null;

                    return (
                      <div 
                        key={itemKey} 
                        className="bg-[#171b24] p-3 rounded-lg border border-gray-800/90 flex gap-3 items-center min-w-0 shadow-sm transition-all hover:border-gray-700"
                      >
                        {/* Thumbnail */}
                        <img
                          src={item.media?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                          alt={item.title}
                          className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded bg-black/60 border border-gray-800 flex-shrink-0"
                        />

                        {/* Detalhes do Produto */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-snug">
                            {item.title}
                          </h4>

                          {/* Variantes (Cor/Tamanho) */}
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex flex-wrap gap-1 text-[10px] font-mono text-gray-300">
                              {item.selectedColor && (
                                <span className="bg-[#212631] px-1.5 py-0.5 rounded border border-gray-700/60">
                                  {item.selectedColor}
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="bg-[#212631] px-1.5 py-0.5 rounded border border-gray-700/60">
                                  Tam: {item.selectedSize}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Preço Unitário */}
                          <div className="flex items-baseline gap-1.5 font-mono">
                            <span className="text-tactical-gold font-bold text-xs sm:text-sm">
                              R$ {price.toFixed(2)}
                            </span>
                            {originalPrice !== null && (
                              <span className="text-gray-500 line-through text-[10px]">
                                R$ {originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Stepper de Quantidade Touch-Friendly (Mínimo 36px) */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                              className="w-8 h-8 rounded bg-[#252b37] hover:bg-tactical-gold hover:text-black text-gray-200 font-bold text-sm flex items-center justify-center border border-gray-700/80 active:scale-95 transition-all"
                              aria-label="Diminuir quantidade"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold w-6 text-center text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                              className="w-8 h-8 rounded bg-[#252b37] hover:bg-tactical-gold hover:text-black text-gray-200 font-bold text-sm flex items-center justify-center border border-gray-700/80 active:scale-95 transition-all"
                              aria-label="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Botão Remover com Touch Target Adequado */}
                        <button
                          onClick={() => onRemoveItem(itemKey)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex-shrink-0 active:scale-90 transition-all"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* 3. CARD DE GARANTIA & CONFIANÇA TÁTICA (Otimiza o espaço livre em mobile) */}
                  <div className="bg-[#141820]/90 border border-gray-800/80 rounded-lg p-3 text-xs space-y-2 mt-4 text-gray-400">
                    <div className="flex items-center gap-2 text-tactical-gold font-bold text-[11px] uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-tactical-gold flex-shrink-0" />
                      <span>Garantia & Procedimento Oficial</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-400 pl-1 leading-relaxed">
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Despacho prioritário para unidades operacionais.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-tactical-gold flex-shrink-0" />
                        <span>Envio para Imperatriz - MA e todo território nacional.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Cotação final e confirmação direta no WhatsApp.</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* 4. FOOTER DO CARRINHO (CUPOM + TOTAL + BOTÃO WHATSAPP) */}
            {cartItems.length > 0 && (
              <div className="p-3.5 sm:p-4 border-t border-gray-800/90 bg-[#0c0e12] space-y-3 flex-shrink-0">
                
                {/* Linha de Cupom sem corte horizontal */}
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2 min-w-0 items-center">
                    <div className="relative flex-1 min-w-0">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="CUPOM (EX: TACTICO5)"
                        className="w-full bg-[#181c24] border border-gray-700/80 text-white text-xs pl-8 pr-2 py-2.5 rounded focus:outline-none focus:border-tactical-gold uppercase font-mono tracking-wider min-w-0"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-[#262c38] hover:bg-tactical-gold hover:text-black text-gray-200 px-3.5 py-2.5 rounded text-xs font-tactical tracking-wider font-bold border border-gray-700 flex-shrink-0 active:scale-95 transition-all"
                    >
                      {couponLoading ? '...' : 'APLICAR'}
                    </button>
                  </div>

                  {couponError && <p className="text-red-400 text-[11px] font-bold pl-1">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-emerald-400 text-[11px] font-bold pl-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Cupom {appliedCoupon.code} ativado! (-R$ {discountAmount.toFixed(2)})
                    </p>
                  )}
                </form>

                {/* Resumo de Valores */}
                <div className="space-y-1.5 text-xs border-t border-gray-800/80 pt-2.5">
                  <div className="flex justify-between text-gray-400 min-w-0">
                    <span className="truncate pr-2">Subtotal da Solicitação:</span>
                    <span className="font-mono text-gray-300 font-semibold flex-shrink-0">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 min-w-0">
                      <span className="truncate pr-2">Desconto ({appliedCoupon.code}):</span>
                      <span className="font-mono font-bold flex-shrink-0">- R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-1 border-t border-gray-800/40">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Valor Estimado:</span>
                    <span className="font-mono font-black text-xl sm:text-2xl text-tactical-gold tracking-tight">
                      R$ {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botão de Finalização Direta via WhatsApp (Zero Burocracia) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleDirectWhatsAppCheckout}
                    className="w-full h-12 sm:h-13 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-tactical text-base sm:text-lg font-bold rounded shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5 flex-shrink-0 fill-white text-emerald-600" />
                    <span className="tracking-wider">{submitting ? 'GERANDO PEDIDO...' : 'FINALIZAR NO WHATSAPP'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${botPublicConfig.whatsappNumber || '5599991561407'}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre os equipamentos da Comandos Artigos Militares.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dúvidas com materiais? Falar com Atendente</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ETAPA 3: CONFIRMAÇÃO DE SUCESSO */}
        {step === 'success' && createdOrderData && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="font-tactical text-2xl sm:text-3xl font-bold text-white tracking-wider">
              SOLICITAÇÃO GERADA COM SUCESSO!
            </h3>
            
            <div className="bg-[#171b24] p-4 rounded-lg border border-gray-800 text-left w-full space-y-2 text-xs">
              <p className="text-gray-400">Código do Pedido: <strong className="text-tactical-gold font-mono">{createdOrderData.order?.orderNumber}</strong></p>
              <p className="text-gray-400">Cliente: <strong className="text-white">{createdOrderData.order?.customerName}</strong></p>
              <p className="text-gray-400">Valor Estimado: <strong className="text-emerald-400 font-bold font-mono">R$ {parseFloat(createdOrderData.order?.finalAmount || 0).toFixed(2)}</strong></p>
            </div>

            {createdOrderData.isBotEnabled ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded text-xs text-emerald-200 text-left w-full space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  🤖 Bot WhatsApp Integrado
                </p>
                <p className="text-[11px] text-emerald-300 leading-relaxed">
                  A confirmação com o descritivo de materiais foi direcionada para a central de atendimento.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/80 border border-amber-500/50 rounded text-xs text-amber-200 text-left w-full space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  🔗 WhatsApp Direto
                </p>
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  Clique no botão abaixo para abrir a conversa e enviar a lista de equipamentos solicitados.
                </p>
              </div>
            )}

            {createdOrderData.whatsappLink && (
              <a
                href={createdOrderData.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-tactical text-base sm:text-lg font-bold rounded flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>ABRIR WHATSAPP AGORA</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full h-11 bg-gray-800 hover:bg-gray-700 text-white font-tactical text-base font-bold rounded transition-colors"
            >
              FECHAR
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
