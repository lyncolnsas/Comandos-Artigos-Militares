import React, { useState, useEffect } from 'react';
import MediaViewer from './MediaViewer';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Clock, Sparkles, Star, Tag } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeMediaUrl, setActiveMediaUrl] = useState(null);
  const [activeMediaType, setActiveMediaType] = useState('IMAGE');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      const variants = product.variants || [];
      const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
      
      const initialColor = colors[0] || null;
      setSelectedColor(initialColor);

      const colorVariants = initialColor 
        ? variants.filter(v => v.color === initialColor)
        : variants;
      
      setSelectedSize(colorVariants[0]?.size || null);

      const primaryMedia = product.media?.find(m => m.isPrimary) || product.media?.[0];
      setActiveMediaUrl(primaryMedia?.url || '');
      setActiveMediaType(primaryMedia?.type || 'IMAGE');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  const mediaList = product.media || [];
  const availableColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  
  const availableSizesForColor = selectedColor
    ? variants.filter(v => v.color === selectedColor)
    : variants;

  const currentVariant = variants.find(v => 
    (!selectedColor || v.color === selectedColor) && 
    (!selectedSize || v.size === selectedSize)
  );

  const displayMediaList = selectedColor
    ? mediaList.filter(m => !m.color || m.color === selectedColor)
    : mediaList;

  const numBasePrice = parseFloat(product.price) || 0;
  const numPromoPrice = product.promoPrice ? parseFloat(product.promoPrice) : null;
  const hasPromo = numPromoPrice !== null && numPromoPrice > 0 && numPromoPrice < numBasePrice;
  const discountPercent = hasPromo ? Math.round(((numBasePrice - numPromoPrice) / numBasePrice) * 100) : 0;

  const currentPrice = currentVariant?.price 
    ? parseFloat(currentVariant.price) 
    : (hasPromo ? numPromoPrice : numBasePrice);

  const originalStrikePrice = (!currentVariant?.price && hasPromo) ? numBasePrice : null;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const colorSizes = variants.filter(v => v.color === color);
    if (colorSizes.length > 0) {
      setSelectedSize(colorSizes[0].size);
    }
    const colorMedia = mediaList.find(m => m.color === color);
    if (colorMedia) {
      setActiveMediaUrl(colorMedia.url);
      setActiveMediaType(colorMedia.type);
    }
  };

  const handleConfirmAddToCart = () => {
    if (variants.length > 0 && !selectedSize) {
      alert('Por favor, selecione um tamanho ou medida antes de adicionar ao pedido.');
      return;
    }

    const itemToAdd = {
      ...product,
      selectedColor,
      selectedSize,
      variantId: currentVariant?.id,
      sku: currentVariant?.sku || product.sku || 'N/A',
      price: currentPrice,
      promoPrice: (!currentVariant?.price && hasPromo) ? numPromoPrice : undefined
    };

    onAddToCart(itemToAdd);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative text-slate-800 flex flex-col md:flex-row my-auto max-h-[92vh] md:max-h-[90vh]">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Lado Esquerdo: Galeria e Mídias */}
        <div className="md:w-1/2 bg-slate-50 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div className="relative h-48 sm:h-64 md:h-full md:aspect-square w-full rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-4">
            <MediaViewer mediaUrl={activeMediaUrl} mediaType={activeMediaType} className="w-full h-full object-contain" />
            
            {/* Badges no modal */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
              {product.isMadeToOrder && (
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1 border border-amber-300">
                  <Clock className="w-3 h-3" /> SOB ENCOMENDA ({product.productionDays || 5}D)
                </span>
              )}
              {hasPromo && !currentVariant?.price && (
                <span className="bg-orange-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Carrossel de Miniaturas */}
          {displayMediaList.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              {displayMediaList.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMediaUrl(m.url);
                    setActiveMediaType(m.type);
                  }}
                  className={`w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0 bg-white transition-all cursor-pointer p-1 ${
                    activeMediaUrl === m.url ? 'border-forest-600 ring-2 ring-forest-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <MediaViewer mediaUrl={m.url} mediaType={m.type} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Especificações, Cores, Tamanhos e Botão */}
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-forest-700 uppercase tracking-widest block mb-1">
                {product.category?.name || 'EQUIPAMENTOS TÁTICOS & OUTDOOR'}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900">
                {product.title}
              </h2>

              <div className="flex items-center gap-1 text-amber-500 text-xs mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-slate-400 text-xs ml-1 font-sans">(128 avaliações de operadores)</span>
              </div>
            </div>

            {/* Preços com Contraste Perfeito */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                R$ {currentPrice.toFixed(2)}
              </span>
              {originalStrikePrice !== null && (
                <span className="text-sm text-slate-400 line-through font-mono">
                  R$ {originalStrikePrice.toFixed(2)}
                </span>
              )}
              {hasPromo && !currentVariant?.price && (
                <span className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-2 py-0.5 rounded">
                  Economize {discountPercent}%
                </span>
              )}
            </div>

            {/* Aviso de Sob Encomenda */}
            {product.isMadeToOrder && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-xs space-y-0.5">
                <span className="font-bold flex items-center gap-1.5 text-amber-800 text-xs">
                  <Clock className="w-3.5 h-3.5" /> Produto Sob Encomenda
                </span>
                <p className="text-[11px] text-amber-700">
                  Prazo de produção de <strong>{product.productionDays || 5} dias úteis</strong> antes do despacho imediato.
                </p>
              </div>
            )}

            {/* Seleção de Cor */}
            {availableColors.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Cor / Padrão: <span className="text-forest-700">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'bg-forest-800 text-white shadow-sm ring-2 ring-forest-800/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de Tamanho */}
            {availableSizesForColor.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase text-slate-700 flex justify-between">
                  <span>Tamanho ou Medida *</span>
                  {currentVariant && (
                    <span className="text-[10px] font-mono text-slate-400">SKU: {currentVariant.sku}</span>
                  )}
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {availableSizesForColor.map((v) => {
                    const isSelected = selectedSize === v.size;
                    return (
                      <button
                        key={v.id || v.size}
                        onClick={() => setSelectedSize(v.size)}
                        className={`p-2 rounded-lg text-center text-xs font-bold font-mono transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-forest-600'
                        }`}
                      >
                        <div className="text-xs">{v.size}</div>
                        <div className="text-[9px] font-sans font-normal opacity-70">
                          {v.stock > 0 ? `${v.stock} un.` : 'Pronta entrega'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Descrição Detalhada */}
            {product.description && (
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs text-slate-600">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">DETALHES DO PRODUTO:</span>
                <p className="leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Rodapé e Botão Adicionar */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            {addedToast ? (
              <div className="bg-emerald-600 text-white p-3 rounded-lg font-bold text-center text-xs flex items-center justify-center gap-2 animate-bounce shadow">
                <Check className="w-4 h-4" /> ITEM ADICIONADO AO PEDIDO!
              </div>
            ) : (
              <button
                onClick={handleConfirmAddToCart}
                className="w-full bg-[#2d5343] hover:bg-[#1e3d30] text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADICIONAR AO PEDIDO</span>
              </button>
            )}

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-slate-600"><ShieldCheck className="w-3.5 h-3.5 text-forest-700" /> Garantia Oficial Comandos</span>
              <span className="flex items-center gap-1 text-slate-600"><Truck className="w-3.5 h-3.5 text-forest-700" /> Despacho para todo o Brasil</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
