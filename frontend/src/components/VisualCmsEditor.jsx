import React, { useState, useEffect } from 'react';
import MediaPickerModal from './MediaPickerModal';
import MediaViewer from './MediaViewer';
import StoreFront from './StoreFront';
import {
  Sparkles, Save, Edit, HardDriveUpload, Check, X, Upload, Image as ImageIcon, Film, FolderTree, Tag,
  Truck, ShieldCheck, RefreshCw, Award, Zap, Lock, Headphones, Star, Shield, Link2, ExternalLink,
  Megaphone, Mountain, Flame, MapPin, Eye, Info, CheckCircle, Share2, MessageSquare, Search, Package
} from 'lucide-react';
import { renderSocialIcon, parseSocialNetworks, serializeSocialNetworks } from '../utils/socialHelpers';

const SECTION_KEYS = [
  { key: 'TOPBAR',             label: 'BARRA TOPO', icon: Megaphone       },
  { key: 'HEADER',             label: 'LOGO / NAVEGAÇÃO', icon: Shield },
  { key: 'HERO_MAIN',          label: 'HERO PRINCIPAL', icon: Mountain   },
  { key: 'BESTSELLERS_HEADER', label: 'ARSENAL EM DESTAQUE (4 ABAS & PRODUTOS)', icon: Flame },
  { key: 'WARRIOR_PROMO',      label: 'FLASH SALE (OFERTA RELÂMPAGO)', icon: Zap },
  { key: 'POPULAR_CATEGORIES', label: 'CATEGORIAS', icon: FolderTree       },
  { key: 'TESTIMONIALS',       label: 'RECOMENDAÇÃO & AVALIAÇÕES INSTAGRAM', icon: MessageSquare },
  { key: 'VIDEO_FEATURE',      label: 'VÍDEO FEATURE', icon: Film    },
  { key: 'VALUE_PROPS',        label: 'DIFERENCIAIS', icon: Award      },
  { key: 'FOOTER_CONTACT',     label: 'RODAPÉ / CONTATO', icon: MapPin },
];

export default function VisualCmsEditor({
  sections,
  categories = [],
  products = [],
  showNotification,
  onSectionSaved,
  mediaLibrary,
  onUpload,
  uploading,
  onDelete,
}) {
  // Lê o token sempre do localStorage (evita race condition com estado React do componente pai)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('comandos_store_token') || localStorage.getItem('bizu_store_token') || localStorage.getItem('gama_store_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  // Estado local sincronizado para preview instantâneo sem delay de rede
  const [currentSections, setCurrentSections] = useState(sections || []);
  useEffect(() => {
    setCurrentSections(sections || []);
  }, [sections]);

  const [activeKey, setActiveKey] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  // Estado para seleção e pesquisa de produtos no Arsenal em Destaque
  const [selectedArsenalTab, setSelectedArsenalTab] = useState('ALL');
  const [productPickerSlot, setProductPickerSlot] = useState(null); // { tabKey, slotIndex }
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Triggered when a section's edit button is clicked inside StoreFront
  const handleEditSection = (sectionKey) => {
    setActiveKey(sectionKey);
    const found = (currentSections || []).find(s => s.sectionKey === sectionKey) || (sections || []).find(s => s.sectionKey === sectionKey);
    
    // Para VALUE_PROPS, garante extração transparente dos 4 cards de benefícios
    let extraValueProps = {};
    if (sectionKey === 'VALUE_PROPS') {
      const rawTitles = (found?.subtitle || 'ENVIO RÁPIDO|GARANTIA TOTAL|SUPORTE 24/7|QUALIDADE MILITAR').split('|');
      const rawDescs = (found?.buttonText || 'Entrega garantida para todo o Brasil|30 dias para trocas e devoluções|Atendimento via WhatsApp e Bot|Produtos testados e homologados').split('|');
      extraValueProps = {
        prop1_title: found?.prop1_title !== undefined ? found.prop1_title : (rawTitles[0] || 'ENVIO RÁPIDO'),
        prop1_desc: found?.prop1_desc !== undefined ? found.prop1_desc : (rawDescs[0] || 'Entrega garantida para todo o Brasil'),
        prop1_icon: found?.prop1_icon || 'Truck',

        prop2_title: found?.prop2_title !== undefined ? found.prop2_title : (rawTitles[1] || 'GARANTIA TOTAL'),
        prop2_desc: found?.prop2_desc !== undefined ? found.prop2_desc : (rawDescs[1] || '30 dias para trocas e devoluções'),
        prop2_icon: found?.prop2_icon || 'ShieldCheck',

        prop3_title: found?.prop3_title !== undefined ? found.prop3_title : (rawTitles[2] || 'SUPORTE 24/7'),
        prop3_desc: found?.prop3_desc !== undefined ? found.prop3_desc : (rawDescs[2] || 'Atendimento via WhatsApp e Bot'),
        prop3_icon: found?.prop3_icon || 'RefreshCw',

        prop4_title: found?.prop4_title !== undefined ? found.prop4_title : (rawTitles[3] || 'QUALIDADE MILITAR'),
        prop4_desc: found?.prop4_desc !== undefined ? found.prop4_desc : (rawDescs[3] || 'Produtos testados e homologados'),
        prop4_icon: found?.prop4_icon || 'Award',
      };
    }

    if (found) {
      setForm({
        ...found,
        title: found.title || (found.sectionKey === 'WARRIOR_PROMO' ? 'CAMISA CAMUFLADA SELVA' : (found.title || '')),
        subtitle: found.subtitle || (found.sectionKey === 'WARRIOR_PROMO' ? 'APENAS R$ 45,00 • ENCOMENDE O SEU' : (found.subtitle || '')),
        featuredTitle: (found.featuredTitle !== undefined && found.featuredTitle !== '')
          ? found.featuredTitle 
          : (found.sectionKey === 'WARRIOR_PROMO' ? 'Até 40% OFF nos Melhores Equipamentos Táticos' : ''),
        featuredLabel: found.featuredLabel !== undefined ? found.featuredLabel : '',
        buttonText: found.buttonText || (found.sectionKey === 'WARRIOR_PROMO' ? 'FAÇA SUA ENCOMENDA >' : (found.buttonText || '')),
        secondaryButtonText: found.secondaryButtonText !== undefined ? found.secondaryButtonText : '',
        ...extraValueProps
      });
    } else {
      setForm({
        sectionKey,
        title: sectionKey === 'WARRIOR_PROMO' ? 'CAMISA CAMUFLADA SELVA' : '',
        subtitle: sectionKey === 'WARRIOR_PROMO' ? 'APENAS R$ 45,00 • ENCOMENDE O SEU' : '',
        mediaType: 'IMAGE', 
        mediaUrl: '', 
        buttonText: sectionKey === 'WARRIOR_PROMO' ? 'FAÇA SUA ENCOMENDA >' : '', 
        buttonLink: '#loja', 
        featuredTitle: sectionKey === 'WARRIOR_PROMO' ? 'Até 40% OFF nos Melhores Equipamentos Táticos' : '', 
        featuredLabel: '', 
        secondaryButtonText: '', 
        isActive: true,
        ...extraValueProps
      });
    }
    setHasUnsaved(false);
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsaved(true);
  };

  const handleSelectMedia = (url, type = 'IMAGE') => {
    updateField('mediaUrl', url);
    updateField('mediaType', type);
    setIsMediaOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanForm = {
        ...form,
        featuredLabel: form.featuredLabel !== undefined ? String(form.featuredLabel).trim() : ''
      };

      // Se for VALUE_PROPS, sintetiza os 4 títulos e descrições em subtitle e buttonText garantindo retrocompatibilidade
      if (cleanForm.sectionKey === 'VALUE_PROPS') {
        const p1T = cleanForm.prop1_title || 'ENVIO RÁPIDO';
        const p2T = cleanForm.prop2_title || 'GARANTIA TOTAL';
        const p3T = cleanForm.prop3_title || 'SUPORTE 24/7';
        const p4T = cleanForm.prop4_title || 'QUALIDADE MILITAR';

        const p1D = cleanForm.prop1_desc || 'Entrega garantida para todo o Brasil';
        const p2D = cleanForm.prop2_desc || '30 dias para trocas e devoluções';
        const p3D = cleanForm.prop3_desc || 'Atendimento via WhatsApp e Bot';
        const p4D = cleanForm.prop4_desc || 'Produtos testados e homologados';

        cleanForm.subtitle = `${p1T}|${p2T}|${p3T}|${p4T}`;
        cleanForm.buttonText = `${p1D}|${p2D}|${p3D}|${p4D}`;
      }

      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(cleanForm),
      });
      if (res.ok) {
        const savedData = await res.json().catch(() => cleanForm);
        const mergedData = { ...cleanForm, ...(savedData && savedData.sectionKey ? savedData : {}) };

        // Atualiza imediatamente o estado de seções da visualização local
        setCurrentSections(prev => {
          const list = [...(prev || [])];
          const idx = list.findIndex(s => s.sectionKey === cleanForm.sectionKey);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...mergedData };
          } else {
            list.push(mergedData);
          }
          return list;
        });

        showNotification(`Seção "${cleanForm.sectionKey}" salva com sucesso!`);
        setHasUnsaved(false);
        setActiveKey(null); // Fecha o modal após salvar
        if (onSectionSaved) onSectionSaved();
      } else {
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.error || errData.message || 'Erro ao salvar seção.', 'error');
      }
    } catch {
      showNotification('Erro de conexão com o servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeSectionLabel = SECTION_KEYS.find(s => s.key === activeKey)?.label || activeKey;

  return (
    <div className="relative bg-[#0f1115] h-[calc(100vh-140px)] rounded-lg overflow-hidden border border-gray-800 flex flex-col">
      
      {/* Cms Header Sticky Toolbar */}
      <div className="z-50 bg-[#171a21]/95 backdrop-blur border-b border-tactical-gold/40 p-4 shadow-2xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tactical-gold text-black rounded-md font-bold animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-tactical text-xl sm:text-2xl font-bold text-tactical-gold leading-none">
              EDITOR VISUAL INLINE (WYSIWYG)
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-300 mt-1">
              Edição visual da Landing Page de Apresentação & Hero. Passe o mouse e clique no botão dourado <strong className="text-tactical-gold">EDITAR</strong> para personalizar qualquer seção.
            </p>
          </div>
        </div>
      </div>

      {/* StoreFront Rendering IN CMS MODE */}
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar relative">
         <StoreFront 
           isCmsMode={true} 
           cmsSections={currentSections} 
           onEditSection={handleEditSection} 
           onSelectProductSlot={(tabKey, slotIndex) => {
             // Garante que o form de BESTSELLERS_HEADER esteja aberto com essa aba e slot
             handleEditSection('BESTSELLERS_HEADER');
             setSelectedArsenalTab(tabKey || 'ALL');
             setProductPickerSlot({ tabKey: tabKey || 'ALL', slotIndex });
             setProductSearchQuery('');
           }}
           onOpenCart={() => {}}
           onOpenAuth={() => {}}
           onAddToCart={() => {}}
           cartCount={0}
           currentUser={null}
           onLogout={() => {}}
         />
      </div>

      {/* Modal de Edição */}
      {activeKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`bg-[#171a21] border border-gray-800 rounded-lg w-full ${activeKey === 'VALUE_PROPS' || activeKey === 'FOOTER_CONTACT' || activeKey === 'WARRIOR_PROMO' || activeKey === 'TESTIMONIALS' || activeKey === 'BESTSELLERS_HEADER' ? 'max-w-4xl' : 'max-w-xl'} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f1115]">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-tactical-gold" />
                <span className="font-tactical font-bold text-white text-xl">
                  {activeSectionLabel}
                </span>
                {hasUnsaved && (
                  <span className="text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded ml-2">
                    NÃO SALVO
                  </span>
                )}
              </div>
              <button onClick={() => setActiveKey(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">

              {/* SELETOR ESPECIAL: ARSENAL EM DESTAQUE (4 ABAS & SELEÇÃO DE PRODUTOS COM PESQUISA) */}
              {activeKey === 'BESTSELLERS_HEADER' && (() => {
                const tabsList = [
                  { key: 'ALL', label: 'Todos os Equipamentos', icon: '⚔️' },
                  { key: 'NOVIDADES', label: 'Novidades & Chegadas Recentes', icon: '✨' },
                  { key: 'MAIS_VENDIDOS', label: 'Mais Vendidos', icon: '🔥', hasAuto: true },
                  { key: 'COLECOES', label: 'Coleções Especiais', icon: '🎖️' }
                ];

                // Extrai ou inicializa o mapa de produtos por aba (JSON)
                let tabMap = {};
                try {
                  if (form.tabProductsData) {
                    tabMap = typeof form.tabProductsData === 'string' ? JSON.parse(form.tabProductsData) : form.tabProductsData;
                  }
                } catch (e) {
                  tabMap = {};
                }

                // Garante que cada aba tem um array de até 10 slots
                const getSlotIds = (tKey) => {
                  const arr = tabMap[tKey]?.productIds || [];
                  return Array.isArray(arr) ? arr : [];
                };

                const isAutoBestseller = tabMap['MAIS_VENDIDOS']?.mode !== 'MANUAL';

                const setTabMode = (tKey, mode) => {
                  const updatedMap = {
                    ...tabMap,
                    [tKey]: {
                      ...(tabMap[tKey] || {}),
                      mode
                    }
                  };
                  updateField('tabProductsData', JSON.stringify(updatedMap));
                };

                const assignProductToSlot = (tKey, slotIndex, productId) => {
                  const currentIds = [...getSlotIds(tKey)];
                  if (productId === null) {
                    // Remover do slot
                    currentIds.splice(slotIndex, 1);
                  } else {
                    currentIds[slotIndex] = productId;
                  }
                  const updatedMap = {
                    ...tabMap,
                    [tKey]: {
                      ...(tabMap[tKey] || {}),
                      productIds: currentIds.filter(Boolean)
                    }
                  };
                  updateField('tabProductsData', JSON.stringify(updatedMap));
                  setProductPickerSlot(null);
                  setProductSearchQuery('');
                };

                const currentTabSlots = getSlotIds(selectedArsenalTab);

                // Filtra produtos para o modal de pesquisa
                const filteredSearchProducts = products.filter(p => {
                  if (!productSearchQuery) return true;
                  const q = productSearchQuery.toLowerCase();
                  return (
                    (p.title && p.title.toLowerCase().includes(q)) ||
                    (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
                    (p.slug && p.slug.toLowerCase().includes(q))
                  );
                });

                return (
                  <div className="bg-[#0f1115] p-4 rounded-xl border border-tactical-gold/50 space-y-4 shadow-xl text-xs">
                    {/* Cabeçalho da Seção */}
                    <div className="border-b border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-tactical font-bold text-tactical-gold uppercase text-sm flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                          ARSENAL EM DESTAQUE — GESTÃO DAS 4 ABAS DE PRODUTOS
                        </span>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Configure o título e escolha quais produtos aparecem em cada uma das 4 abas, com busca rápida no catálogo.
                        </p>
                      </div>
                    </div>

                    {/* Título & Subtítulo da Seção */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#171a21] p-3 rounded-lg border border-gray-700/70">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-tactical-gold mb-1">
                          Título Principal da Seção
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                          value={form.title !== undefined ? form.title : 'ARSENAL EM DESTAQUE'}
                          onChange={e => updateField('title', e.target.value)}
                          placeholder="Ex: ARSENAL EM DESTAQUE"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-tactical-gold mb-1">
                          Subtítulo / Descrição
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.subtitle !== undefined ? form.subtitle : 'Os itens mais requisitados por operadores e aventureiros.'}
                          onChange={e => updateField('subtitle', e.target.value)}
                          placeholder="Ex: Os itens mais requisitados por operadores e aventureiros."
                        />
                      </div>
                    </div>

                    {/* SELETOR DAS 4 ABAS */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                          Selecione qual Aba deseja gerenciar:
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {products.length} produtos cadastrados na loja
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {tabsList.map(tab => {
                          const isSel = selectedArsenalTab === tab.key;
                          const count = tab.key === 'MAIS_VENDIDOS' && isAutoBestseller
                            ? 'Auto (Banco)'
                            : `${getSlotIds(tab.key).length} selecionados`;

                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setSelectedArsenalTab(tab.key)}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-tactical-gold/15 border-tactical-gold shadow-md text-white'
                                  : 'bg-[#171a21] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold font-tactical">
                                <span>{tab.icon}</span>
                                <span className="truncate">{tab.label}</span>
                              </div>
                              <span className="text-[9px] block text-tactical-gold font-mono mt-1">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CONTEÚDO DA ABA SELECIONADA */}
                    <div className="bg-[#171a21] p-4 rounded-xl border border-gray-700 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-700/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white uppercase font-tactical flex items-center gap-1.5">
                            <span>{tabsList.find(t => t.key === selectedArsenalTab)?.icon}</span>
                            <span>Aba: {tabsList.find(t => t.key === selectedArsenalTab)?.label}</span>
                          </span>
                        </div>

                        {/* Opção Inteligente para MAIS VENDIDOS */}
                        {selectedArsenalTab === 'MAIS_VENDIDOS' && (
                          <div className="flex items-center gap-2 bg-[#0f1115] px-3 py-1 rounded-md border border-orange-500/40">
                            <span className="text-[10px] text-gray-300 font-bold uppercase">Modo:</span>
                            <button
                              type="button"
                              onClick={() => setTabMode('MAIS_VENDIDOS', 'AUTO')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                                isAutoBestseller
                                  ? 'bg-orange-600 text-white shadow'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              ⚡ INTELIGENTE (BANCO)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTabMode('MAIS_VENDIDOS', 'MANUAL')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                                !isAutoBestseller
                                  ? 'bg-tactical-gold text-black shadow'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              MANUAL
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Aviso Modo Inteligente no Mais Vendidos */}
                      {selectedArsenalTab === 'MAIS_VENDIDOS' && isAutoBestseller ? (
                        <div className="p-4 bg-orange-950/20 border border-orange-500/40 rounded-lg text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-orange-400 font-bold text-xs uppercase font-tactical">
                            <Sparkles className="w-4 h-4" />
                            Modo Inteligente Ativado
                          </div>
                          <p className="text-[11px] text-gray-300 max-w-xl mx-auto">
                            O sistema busca automaticamente do banco de dados os itens com maior volume de pedidos e vendas reais registradas, atualizando a vitrine sem necessidade de seleção manual.
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            Para escolher itens específicos manualmente nesta aba, clique em <strong>MANUAL</strong> acima.
                          </p>
                        </div>
                      ) : (
                        /* Grid de Slots de Produtos Escolhidos */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-300">
                              Clique em qualquer slot para abrir a <strong>caixa de pesquisa</strong> e selecionar o produto:
                            </p>
                            <button
                              type="button"
                              onClick={() => setProductPickerSlot({ tabKey: selectedArsenalTab, slotIndex: currentTabSlots.length })}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors shadow"
                            >
                              + ADICIONAR PRODUTO
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                            {currentTabSlots.map((prodId, sIdx) => {
                              const foundProd = products.find(p => String(p.id) === String(prodId));
                              return (
                                <div
                                  key={sIdx}
                                  className="bg-[#0f1115] border border-gray-700/80 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-tactical-gold transition-colors group"
                                >
                                  <div
                                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                                    onClick={() => setProductPickerSlot({ tabKey: selectedArsenalTab, slotIndex: sIdx })}
                                    title="Clique para trocar este produto"
                                  >
                                    <div className="w-10 h-10 rounded bg-[#171a21] border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                                      {foundProd?.media?.[0]?.url ? (
                                        <img src={foundProd.media[0].url} alt="" className="w-full h-full object-contain" />
                                      ) : (
                                        <Package className="w-5 h-5 text-gray-500" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[9px] font-bold text-tactical-gold block font-mono">
                                        SLOT {sIdx + 1}
                                      </span>
                                      <h6 className="text-xs font-bold text-white truncate group-hover:text-tactical-gold transition-colors">
                                        {foundProd ? foundProd.title : `Produto ID ${prodId} (Não encontrado)`}
                                      </h6>
                                      {foundProd && (
                                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                          R$ {parseFloat(foundProd.promoPrice || foundProd.price).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setProductPickerSlot({ tabKey: selectedArsenalTab, slotIndex: sIdx })}
                                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                      title="Trocar produto"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => assignProductToSlot(selectedArsenalTab, sIdx, null)}
                                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                                      title="Remover produto deste slot"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {currentTabSlots.length === 0 && (
                              <div
                                onClick={() => setProductPickerSlot({ tabKey: selectedArsenalTab, slotIndex: 0 })}
                                className="sm:col-span-2 md:col-span-3 border-2 border-dashed border-gray-700/80 hover:border-tactical-gold rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#0f1115]/50 group"
                              >
                                <Package className="w-8 h-8 text-gray-600 group-hover:text-tactical-gold mx-auto mb-2 transition-colors" />
                                <span className="text-xs font-bold text-gray-300 block">
                                  Nenhum produto fixado manualmente nesta aba
                                </span>
                                <span className="text-[10px] text-gray-500 block mt-1">
                                  Clique aqui para abrir a pesquisa e selecionar o primeiro produto (ou a loja exibirá os produtos mais recentes).
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* MODAL / CAIXA DE PESQUISA PARA SELEÇÃO DO PRODUTO */}
              {productPickerSlot && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#171a21] border border-tactical-gold/60 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    
                    {/* Header da Busca */}
                    <div className="p-4 border-b border-gray-800 bg-[#0f1115] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-tactical-gold" />
                        <div>
                          <h4 className="font-tactical font-bold text-white text-sm">
                            SELECIONAR PRODUTO CADASTRADO
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            Aba: {productPickerSlot.tabKey} • Slot {productPickerSlot.slotIndex + 1}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setProductPickerSlot(null); setProductSearchQuery(''); }}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Input com Busca Rápida */}
                    <div className="p-4 bg-[#0a0c0e] border-b border-gray-800">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          autoFocus
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          placeholder="Digite o nome, categoria ou código do produto..."
                          className="w-full bg-[#171a21] border border-gray-700 focus:border-tactical-gold text-white text-xs pl-9 pr-8 py-2 rounded-lg focus:outline-none transition-colors"
                        />
                        {productSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setProductSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
                        <span>{products.filter(p => {
                          if (!productSearchQuery) return true;
                          const q = productSearchQuery.toLowerCase();
                          return (p.title && p.title.toLowerCase().includes(q)) || (p.category?.name && p.category.name.toLowerCase().includes(q));
                        }).length} itens encontrados</span>
                        <span className="text-tactical-gold font-mono">Clique no produto para selecionar</span>
                      </div>
                    </div>

                    {/* Lista com Resultados da Pesquisa */}
                    <div className="p-3 overflow-y-auto custom-scrollbar space-y-1.5 flex-1 max-h-[50vh]">
                      {products
                        .filter(p => {
                          if (!productSearchQuery) return true;
                          const q = productSearchQuery.toLowerCase();
                          return (p.title && p.title.toLowerCase().includes(q)) || (p.category?.name && p.category.name.toLowerCase().includes(q));
                        })
                        .map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              // Extrai e atribui
                              let tMap = {};
                              try {
                                if (form.tabProductsData) {
                                  tMap = typeof form.tabProductsData === 'string' ? JSON.parse(form.tabProductsData) : form.tabProductsData;
                                }
                              } catch (e) {}

                              const tKey = productPickerSlot.tabKey;
                              const currentIds = [...(tMap[tKey]?.productIds || [])];
                              currentIds[productPickerSlot.slotIndex] = prod.id;

                              const updatedMap = {
                                ...tMap,
                                [tKey]: {
                                  ...(tMap[tKey] || {}),
                                  productIds: currentIds.filter(Boolean)
                                }
                              };
                              updateField('tabProductsData', JSON.stringify(updatedMap));
                              setProductPickerSlot(null);
                              setProductSearchQuery('');
                            }}
                            className="p-2.5 rounded-lg bg-[#0f1115] border border-gray-800 hover:border-emerald-500 hover:bg-[#141820] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded bg-slate-900 border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                                {prod.media?.[0]?.url ? (
                                  <img src={prod.media[0].url} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">
                                  {prod.category?.name || 'Comandos'}
                                </span>
                                <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                                  {prod.title}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-emerald-400 font-mono">
                                    R$ {parseFloat(prod.promoPrice || prod.price).toFixed(2)}
                                  </span>
                                  {prod.promoPrice && Number(prod.promoPrice) < Number(prod.price) && (
                                    <span className="text-[10px] text-gray-500 line-through font-mono">
                                      R$ {parseFloat(prod.price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-[10px] font-mono px-3 py-1.5 rounded transition-all shrink-0 shadow"
                            >
                              SELECIONAR
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Footer da Busca */}
                    <div className="p-3 bg-[#0f1115] border-t border-gray-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setProductPickerSlot(null); setProductSearchQuery(''); }}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-4 py-1.5 rounded font-mono transition-colors"
                      >
                        CANCELAR
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Seletor Especial de Categorias para POPULAR_CATEGORIES */}
              {activeKey === 'POPULAR_CATEGORIES' && (
                <div className="bg-[#0f1115] p-4 rounded-lg border border-tactical-gold/50 space-y-4 shadow-xl">
                  
                  {/* 1. Categoria Principal (Banner Esquerdo Grande) */}
                  <div className="space-y-2 pb-3 border-b border-gray-800">
                    <label className="block text-xs font-bold uppercase text-tactical-gold flex items-center gap-1.5 font-tactical">
                      <FolderTree className="w-4 h-4 text-tactical-gold" /> Banner Principal da Esquerda (Grande Destaque)
                    </label>
                    <select
                      className="w-full bg-[#171a21] border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                      value={form.featuredCategoryId || ''}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const selectedCat = categories.find(c => String(c.id) === String(catId));
                        if (selectedCat) {
                          setForm(prev => ({
                            ...prev,
                            featuredCategoryId: catId,
                            featuredTitle: selectedCat.name.toUpperCase(),
                            mediaUrl: selectedCat.image || prev.mediaUrl,
                            buttonLink: `category:${selectedCat.id}`
                          }));
                          setHasUnsaved(true);
                        } else {
                          updateField('featuredCategoryId', '');
                        }
                      }}
                    >
                      <option value="">-- Selecione a Categoria do Banner Principal --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          ⭐ {cat.name} ({products.filter(p => p.categoryId === cat.id).length} itens)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Seleção das 4 Categorias da Grade Direita */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase text-tactical-gold font-tactical">
                      Seleção dos 4 Quadros da Grade Direita
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((slotIndex) => {
                        const currentSlots = form.subCategoryIds ? form.subCategoryIds.split(',') : [];
                        const currentSlotVal = currentSlots[slotIndex] || '';

                        return (
                          <div key={slotIndex} className="bg-[#171a21] p-2.5 rounded border border-gray-700 space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">
                              Quadro {slotIndex + 1} {slotIndex === 0 ? '(Sup. Esquerdo)' : slotIndex === 1 ? '(Sup. Direito)' : slotIndex === 2 ? '(Inf. Esquerdo)' : '(Inf. Direito)'}
                            </span>
                            <select
                              className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                              value={currentSlotVal}
                              onChange={(e) => {
                                const newCatId = e.target.value;
                                const slots = form.subCategoryIds ? form.subCategoryIds.split(',') : ['', '', '', ''];
                                while (slots.length < 4) slots.push('');
                                slots[slotIndex] = newCatId;
                                updateField('subCategoryIds', slots.join(','));
                              }}
                            >
                              <option value="">-- Padrão ({categories[slotIndex]?.name || 'Auto'}) --</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name} ({products.filter(p => p.categoryId === cat.id).length} itens)
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight pt-1">
                      Cada quadro selecionado exibirá automaticamente a imagem, o nome e a contagem de itens da categoria escolhida na Landing Page.
                    </p>
                  </div>
                </div>
              )}

              {/* Seletor Especial para RODAPÉ / CONTATO (FOOTER_CONTACT 100% VISUAL E INTUITIVO) */}
              {activeKey === 'FOOTER_CONTACT' && (() => {
                // Decompõe navLinks (ex: Home:#home|Loja:#loja) de forma transparente
                const rawNav = (form.navLinks || 'Home:#home|Loja:#loja|Categorias:#categorias|Mídia e Vídeos:#video-feature|Ofertas:#flash-sale').split('|');
                const navItems = [0, 1, 2, 3, 4].map(idx => {
                  const part = rawNav[idx] || '';
                  const [label, target] = part.split(':');
                  return {
                    label: label || (idx === 0 ? 'Home' : idx === 1 ? 'Loja' : idx === 2 ? 'Categorias' : idx === 3 ? 'Vídeos' : 'Ofertas'),
                    target: target || (idx === 0 ? '#home' : idx === 1 ? '#loja' : idx === 2 ? '#categorias' : idx === 3 ? '#video-feature' : '#flash-sale')
                  };
                });

                // Decompõe contatos (WhatsApp, Email, Horário)
                const rawContacts = (form.buttonText || 'WhatsApp: (11) 99999-8888|Email: contato@comandosartigosmilitares.com|Segunda a Sábado: 08h às 19h').split('|');
                const contactWhats = rawContacts[0] || 'WhatsApp: (11) 99999-8888';
                const contactEmail = rawContacts[1] || 'Email: contato@comandosartigosmilitares.com';
                const contactHours = rawContacts[2] || 'Segunda a Sábado: 08h às 19h';

                // Decompõe badges de pagamento
                const rawBadges = (form.paymentBadges || 'PIX|Cartão de Crédito|Boleto Bancário').split('|').map(s => s.trim()).filter(Boolean);

                const updateNavItem = (index, field, val) => {
                  const newItems = [...navItems];
                  newItems[index] = { ...newItems[index], [field]: val };
                  const serialized = newItems.map(it => `${it.label || 'Link'}:${it.target || '#loja'}`).join('|');
                  updateField('navLinks', serialized);
                };

                const updateContactLine = (index, val) => {
                  const cList = [contactWhats, contactEmail, contactHours];
                  cList[index] = val;
                  updateField('buttonText', cList.join('|'));
                };

                const toggleBadge = (badgeName) => {
                  let updated = [...rawBadges];
                  if (updated.includes(badgeName)) {
                    updated = updated.filter(b => b !== badgeName);
                  } else {
                    updated.push(badgeName);
                  }
                  updateField('paymentBadges', updated.join('|'));
                };

                return (
                  <div className="space-y-4 text-xs">
                    
                    {/* Banner Informativo */}
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-tactical font-bold text-sm tracking-wide">
                        <span>RODAPÉ & CONTATOS DA LOJA</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Edite facilmente cada coluna do rodapé preenchendo os campos abaixo. Não precisa de códigos nem símbolos estranhos!
                      </p>
                    </div>

                    {/* Coluna 1: Marca & Descrição */}
                    <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-gray-800">
                        <span className="font-tactical font-bold text-tactical-gold uppercase text-xs">
                          Coluna 1: Nome da Marca & Missão
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título da Marca</label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-tactical-gold rounded px-3 py-2 text-white text-xs font-bold uppercase focus:outline-none"
                          value={form.title || 'COMANDOS ARTIGOS MILITARES'}
                          onChange={e => updateField('title', e.target.value)}
                          placeholder="COMANDOS ARTIGOS MILITARES"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Texto Descritivo / Institucional</label>
                        <textarea
                          rows={2}
                          className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-tactical-gold rounded px-3 py-2 text-white/90 text-xs focus:outline-none resize-none"
                          value={form.subtitle !== undefined ? form.subtitle : 'Líder em camisas camufladas, fardamentos operacionais e equipamentos táticos com despacho rápido para todo o Brasil.'}
                          onChange={e => updateField('subtitle', e.target.value)}
                          placeholder="Descrição abaixo da marca no rodapé..."
                        />
                      </div>
                    </div>

                    {/* Coluna 2: Navegação Rápida (Campos Claros) */}
                    <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                        <span className="font-tactical font-bold text-tactical-gold uppercase text-xs">
                          Coluna 2: Links de Navegação Rápida
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título da Coluna</label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-1.5 text-white text-xs font-bold uppercase focus:border-tactical-gold focus:outline-none"
                          value={form.featuredTitle !== undefined ? form.featuredTitle : 'NAVEGAÇÃO RÁPIDA'}
                          onChange={e => updateField('featuredTitle', e.target.value)}
                          placeholder="NAVEGAÇÃO RÁPIDA"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-400">
                          Links Exibidos (Nome do Link e Onde Leva):
                        </label>
                        {navItems.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0f1115] p-2 rounded border border-gray-800">
                            <div>
                              <span className="text-[9px] text-gray-500 uppercase block font-mono">Nome #{idx + 1}</span>
                              <input
                                type="text"
                                className="w-full bg-[#171a21] border border-gray-700 rounded px-2 py-1 text-white text-xs font-semibold focus:border-tactical-gold focus:outline-none"
                                value={item.label}
                                onChange={e => updateNavItem(idx, 'label', e.target.value)}
                                placeholder="ex: Loja Completa"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 uppercase block font-mono">Destino</span>
                              <select
                                className="w-full bg-[#171a21] border border-gray-700 rounded px-2 py-1 text-emerald-400 text-xs font-semibold focus:border-tactical-gold focus:outline-none cursor-pointer"
                                value={item.target}
                                onChange={e => updateNavItem(idx, 'target', e.target.value)}
                              >
                                <option value="#home">Início / Topo</option>
                                <option value="#loja">Catálogo de Produtos</option>
                                <option value="#categorias">Seção Categorias</option>
                                <option value="#flash-sale">Oferta Relâmpago</option>
                                <option value="#video-feature">Vídeo Feature</option>
                                <option value="#contato">Contato & Rodapé</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 3: Atendimento & Contatos (WhatsApp, Email, Horário) */}
                    <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-gray-800">
                        <span className="font-tactical font-bold text-tactical-gold uppercase text-xs">
                          Coluna 3: Atendimento ao Cliente
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título da Coluna</label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-1.5 text-white text-xs font-bold uppercase focus:border-tactical-gold focus:outline-none"
                          value={form.featuredLabel !== undefined ? form.featuredLabel : 'ATENDIMENTO & SUPORTE'}
                          onChange={e => updateField('featuredLabel', e.target.value)}
                          placeholder="ATENDIMENTO & SUPORTE"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">
                            WhatsApp / Telefone
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-3 py-2 text-white text-xs focus:border-tactical-gold focus:outline-none"
                            value={contactWhats}
                            onChange={e => updateContactLine(0, e.target.value)}
                            placeholder="WhatsApp: (11) 99999-8888"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">
                            E-mail de Suporte
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-3 py-2 text-white text-xs focus:border-tactical-gold focus:outline-none"
                            value={contactEmail}
                            onChange={e => updateContactLine(1, e.target.value)}
                            placeholder="E-mail: contato@comandosartigosmilitares.com"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">
                            Horário de Atendimento
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-3 py-2 text-white text-xs focus:border-tactical-gold focus:outline-none"
                            value={contactHours}
                            onChange={e => updateContactLine(2, e.target.value)}
                            placeholder="Segunda a Sábado: 08h às 19h"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Coluna 4: Segurança & Formas de Pagamento (Com Checkboxes Visuais) */}
                    <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-gray-800">
                        <span className="font-tactical font-bold text-tactical-gold uppercase text-xs">
                          Coluna 4: Segurança & Formas de Pagamento
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título da Coluna</label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-1.5 text-white text-xs font-bold uppercase focus:border-tactical-gold focus:outline-none"
                          value={form.secTitle !== undefined ? form.secTitle : 'SEGURANÇA & REDES'}
                          onChange={e => updateField('secTitle', e.target.value)}
                          placeholder="SEGURANÇA & REDES"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Texto de Garantia / Segurança</label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.secText !== undefined ? form.secText : 'Ambiente 100% seguro com criptografia de ponta a ponta.'}
                          onChange={e => updateField('secText', e.target.value)}
                          placeholder="Ambiente 100% seguro com criptografia de ponta a ponta."
                        />
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-bold uppercase text-tactical-gold">
                          Badges de Pagamento Aceitos (Clique para ativar/desativar):
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {['PIX', 'Cartão de Crédito', 'Boleto Bancário', 'Transferência', 'Mercado Pago'].map(opt => {
                            const active = rawBadges.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleBadge(opt)}
                                className={`text-xs px-3 py-1.5 rounded-md font-mono font-bold transition-all border cursor-pointer ${active ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105' : 'bg-[#0f1115] text-gray-400 border-gray-700 hover:text-white'}`}
                              >
                                {active ? `OK: ${opt}` : `+ ${opt}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* REDES SOCIAIS OFICIAIS EDITÁVEIS */}
                    {(() => {
                      const currentSocials = parseSocialNetworks(form.socialNetworksData || form.socialLinks);
                      const updateSocial = (key, field, val) => {
                        const updated = currentSocials.map(s => s.key === key ? { ...s, [field]: val } : s);
                        const serialized = serializeSocialNetworks(updated);
                        updateField('socialNetworksData', serialized);
                        updateField('socialLinks', serialized);
                      };

                      return (
                        <div className="bg-[#171a21] p-4 rounded-lg border border-tactical-gold/40 space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-700/60 pb-2">
                            <div className="flex items-center gap-2">
                              <Share2 size={16} className="text-tactical-gold" />
                              <span className="font-tactical font-bold text-tactical-gold uppercase text-xs">
                                🌐 Redes Sociais Oficiais da Loja
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Ative/Desative e configure o link de cada rede
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-400">
                            Ative ou desative qualquer rede social abaixo e insira o link direto do perfil oficial da Comandos Artigos Militares. As redes ativadas aparecerão com seus respectivos ícones no rodapé.
                          </p>

                          <div className="space-y-2 pt-1">
                            {currentSocials.map(soc => (
                              <div
                                key={soc.key}
                                className={`p-3 rounded-lg border transition-all ${
                                  soc.enabled
                                    ? 'bg-[#0f1115] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                                    : 'bg-[#0a0c0e]/60 border-gray-800/80 opacity-60'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {/* Logo Oficial e Nome Específico */}
                                  <div className="flex items-center gap-2.5 min-w-[160px]">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                                        soc.enabled
                                          ? `${soc.brandBg || 'bg-white/10'} text-white ring-2 ring-white/20`
                                          : 'bg-gray-800 text-gray-500'
                                      }`}
                                      title={`Logo oficial: ${soc.label}`}
                                    >
                                      {renderSocialIcon(soc.iconType || soc.key, "w-5 h-5 drop-shadow")}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-bold uppercase font-tactical ${soc.enabled ? 'text-white' : 'text-gray-400'}`}>
                                          {soc.label}
                                        </span>
                                      </div>
                                      <span className={`text-[10px] font-mono block ${soc.enabled ? (soc.badgeText || 'text-emerald-400') : 'text-gray-500'}`}>
                                        {soc.enabled ? '● Ativo no rodapé' : '○ Desativado'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Campo de Link / URL Específico */}
                                  <div className="flex-1">
                                    <div className="relative">
                                      <input
                                        type="url"
                                        disabled={!soc.enabled}
                                        value={soc.url || ''}
                                        onChange={(e) => updateSocial(soc.key, 'url', e.target.value)}
                                        placeholder={soc.placeholder || `https://${soc.key}.com/...`}
                                        className="w-full bg-[#0a0c0e] border border-gray-700 disabled:border-gray-800 disabled:text-gray-600 rounded-md px-3 py-1.5 text-xs text-white focus:border-tactical-gold focus:outline-none transition-colors placeholder:text-gray-600"
                                      />
                                    </div>
                                  </div>

                                  {/* Botão Liga/Desliga */}
                                  <button
                                    type="button"
                                    onClick={() => updateSocial(soc.key, 'enabled', !soc.enabled)}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold font-mono uppercase transition-all cursor-pointer shrink-0 ${
                                      soc.enabled
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-400/40'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                                    }`}
                                  >
                                    {soc.enabled ? '✓ ATIVADO' : '✕ DESATIVADO'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Copyright */}
                    <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-2">
                      <span className="font-tactical font-bold text-tactical-gold uppercase text-xs block">
                        ©️ Linha de Direitos Autorais (Copyright)
                      </span>
                      <input
                        type="text"
                        className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:border-tactical-gold focus:outline-none"
                        value={form.copyrightText !== undefined ? form.copyrightText : `© ${new Date().getFullYear()} COMANDOS ARTIGOS MILITARES. Todos os direitos reservados. comandosartigosmilitares.com`}
                        onChange={e => updateField('copyrightText', e.target.value)}
                        placeholder="© 2026 COMANDOS ARTIGOS MILITARES. Todos os direitos reservados."
                      />
                    </div>

                    {/* Mini Preview ao Vivo do Rodapé */}
                    {(() => {
                      const activeSocials = parseSocialNetworks(form.socialNetworksData || form.socialLinks).filter(s => s.enabled);
                      return (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                            Pré-visualização do Rodapé (Como fica no site):
                          </span>
                          <div className="bg-[#0d1f18] text-white/80 p-4 rounded-xl border border-white/10 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                              <div>
                                <span className="font-bold text-white uppercase block mb-1">{form.title || 'COMANDOS'}</span>
                                <p className="text-white/60 text-[9px] line-clamp-2">{form.subtitle || 'Líder em artigos militares.'}</p>
                              </div>
                              <div>
                                <span className="font-bold text-white uppercase block mb-1">{form.featuredTitle || 'NAVEGAÇÃO'}</span>
                                <div className="space-y-0.5 text-[9px] text-emerald-400">
                                  {navItems.slice(0, 3).map((it, idx) => (
                                    <div key={idx}>• {it.label}</div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-white uppercase block mb-1">{form.featuredLabel || 'CONTATO'}</span>
                                <div className="text-[9px] text-white/70 space-y-0.5">
                                  <div>{contactWhats}</div>
                                  <div>{contactEmail}</div>
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-white uppercase block mb-1">{form.secTitle || 'PAGAMENTO & REDES'}</span>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {rawBadges.map((b, idx) => (
                                    <span key={idx} className="bg-white/10 px-1 py-0.2 rounded text-[8px] text-emerald-300 font-mono">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1.5 pt-1">
                                  {activeSocials.map(soc => (
                                    <div
                                      key={soc.key}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm ${soc.brandBg || 'bg-white/20'}`}
                                      title={soc.label}
                                    >
                                      {renderSocialIcon(soc.iconType || soc.key, "w-3 h-3")}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-center text-[9px] text-white/40 pt-2 border-t border-white/10">
                              {form.copyrightText || `© 2026 COMANDOS ARTIGOS MILITARES.`}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                );
              })()}

              {/* Seletor Especial para DIFERENCIAIS TÁTICOS (VALUE_PROPS 100% EDITÁVEL) */}
              {activeKey === 'VALUE_PROPS' && (
                <div className="bg-[#0f1115] p-4 rounded-lg border border-tactical-gold/50 space-y-4 shadow-xl text-xs">
                  <div className="border-b border-gray-800 pb-2">
                    <span className="font-tactical font-bold text-tactical-gold uppercase text-sm block flex items-center gap-2">
                      <Award className="w-4 h-4 text-tactical-gold" />
                      DIFERENCIAIS TÁTICOS & PROPOSIÇÃO DE VALOR (100% EDITÁVEL)
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Edite de forma independente os 4 cartões de diferenciais exibidos na Landing Page e no rodapé da Loja.
                    </p>
                  </div>

                  {/* Título Geral da Seção (Opcional) */}
                  <div className="bg-[#171a21] p-3 rounded border border-gray-700 space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-tactical-gold">
                      Título da Seção (Opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                      value={form.title || ''}
                      onChange={e => updateField('title', e.target.value)}
                      placeholder="Ex: POR QUE ESCOLHER A COMANDOS ARTIGOS MILITARES?"
                    />
                  </div>

                  {/* Tag de Oferta / Selo em Destaque */}
                  <div className="bg-[#171a21] p-3 rounded border border-red-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Tag de Destaque / Selo Superior (Opcional)</span>
                      </label>
                      {form.featuredLabel && (
                        <span className="bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow uppercase font-mono">
                          {form.featuredLabel}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-red-500 rounded px-2.5 py-1.5 text-white text-xs font-bold focus:outline-none"
                      value={form.featuredLabel || ''}
                      onChange={e => updateField('featuredLabel', e.target.value)}
                      placeholder="Ex: BENEFÍCIOS EXCLUSIVOS ou GARANTIA DE QUALIDADE"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['BENEFÍCIOS EXCLUSIVOS', 'GARANTIA & SEGURANÇA MÁXIMA', 'QUALIDADE TESTADA E APROVADA'].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => updateField('featuredLabel', sug)}
                          className="text-[9px] bg-[#111317] hover:bg-tactical-gold hover:text-black text-gray-300 px-2 py-0.5 rounded border border-gray-700 font-mono cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Os 4 Cards de Diferenciais */}
                  <div className="space-y-3">
                    <span className="font-bold text-white uppercase text-[11px] block text-tactical-gold font-tactical">
                      ⭐ OS 4 CARDS DE DIFERENCIAIS
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { num: 1, defaultTitle: 'ENVIO RÁPIDO', defaultDesc: 'Entrega garantida para todo o Brasil', defaultIcon: 'Truck' },
                        { num: 2, defaultTitle: 'GARANTIA TOTAL', defaultDesc: '30 dias para trocas e devoluções', defaultIcon: 'ShieldCheck' },
                        { num: 3, defaultTitle: 'SUPORTE 24/7', defaultDesc: 'Atendimento via WhatsApp e Bot', defaultIcon: 'RefreshCw' },
                        { num: 4, defaultTitle: 'QUALIDADE MILITAR', defaultDesc: 'Produtos testados e homologados', defaultIcon: 'Award' }
                      ].map((item) => {
                        const iconKey = form[`prop${item.num}_icon`] || item.defaultIcon;
                        const titleVal = form[`prop${item.num}_title`] !== undefined ? form[`prop${item.num}_title`] : item.defaultTitle;
                        const descVal = form[`prop${item.num}_desc`] !== undefined ? form[`prop${item.num}_desc`] : item.defaultDesc;

                        return (
                          <div key={item.num} className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between pb-1.5 border-b border-gray-800">
                              <span className="font-bold text-tactical-gold uppercase text-xs flex items-center gap-1.5 font-tactical tracking-wider">
                                <span className="bg-tactical-gold/20 border border-tactical-gold/40 text-tactical-gold px-1.5 py-0.5 rounded text-[10px]">#{item.num}</span>
                                DIFERENCIAL {item.num}
                              </span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Ícone do Benefício</label>
                              <select
                                className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-2.5 py-1.5 text-tactical-gold text-xs font-bold focus:border-tactical-gold focus:outline-none transition-colors"
                                value={iconKey}
                                onChange={e => updateField(`prop${item.num}_icon`, e.target.value)}
                              >
                                <option value="Truck">Envio Rápido / Caminhão</option>
                                <option value="ShieldCheck">Garantia Total / Escudo Check</option>
                                <option value="RefreshCw">Suporte 24/7 / Trocas</option>
                                <option value="Award">Qualidade Militar / Medalha</option>
                                <option value="Zap">Agilidade / Alta Performance</option>
                                <option value="Lock">Compra Segura / Cadeado</option>
                                <option value="Headphones">Central WhatsApp / Atendimento</option>
                                <option value="Star">Excelência / Destaque</option>
                                <option value="Shield">Defesa e Proteção / Escudo</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título do Card</label>
                              <input
                                type="text"
                                className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-2.5 py-1.5 text-white text-xs font-bold uppercase focus:border-tactical-gold focus:outline-none transition-colors"
                                value={titleVal}
                                onChange={e => updateField(`prop${item.num}_title`, e.target.value)}
                                placeholder={item.defaultTitle}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Descrição</label>
                              <textarea
                                rows={2}
                                className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none resize-none transition-colors"
                                value={descVal}
                                onChange={e => updateField(`prop${item.num}_desc`, e.target.value)}
                                placeholder={item.defaultDesc}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pré-visualização ao Vivo dos 4 Cards */}
                  <div className="bg-[#0a0c0e] p-3 rounded border border-gray-800 space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                      Pré-visualização ao vivo dos Cards:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                      {[1, 2, 3, 4].map((num) => {
                        const iconKey = form[`prop${num}_icon`] || (num === 1 ? 'Truck' : num === 2 ? 'ShieldCheck' : num === 3 ? 'RefreshCw' : 'Award');
                        const Icon = ({
                          Truck, ShieldCheck, RefreshCw, Award, Zap, Lock, Headphones, Star, Shield
                        })[iconKey] || Award;
                        const t = form[`prop${num}_title`] || (num === 1 ? 'ENVIO RÁPIDO' : num === 2 ? 'GARANTIA TOTAL' : num === 3 ? 'SUPORTE 24/7' : 'QUALIDADE MILITAR');
                        const d = form[`prop${num}_desc`] || (num === 1 ? 'Entrega garantida para todo o Brasil' : num === 2 ? '30 dias para trocas e devoluções' : num === 3 ? 'Atendimento via WhatsApp e Bot' : 'Produtos testados e homologados');

                        return (
                          <div key={num} className="p-2 bg-[#141619] rounded border border-gray-800 flex flex-col items-center space-y-1">
                            <Icon className="w-5 h-5 text-tactical-gold" />
                            <h5 className="font-tactical text-[11px] font-bold text-white uppercase">{t}</h5>
                            <p className="text-gray-500 text-[9px] leading-tight">{d}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Seletor Especial para RECOMENDAÇÃO OPERACIONAL & COMENTÁRIOS DO INSTAGRAM (TESTIMONIALS 100% EDITÁVEL) */}
              {activeKey === 'TESTIMONIALS' && (
                <div className="bg-[#0f1115] p-4 rounded-lg border border-tactical-gold/50 space-y-4 shadow-xl text-xs">
                  <div className="border-b border-gray-800 pb-2 flex items-center justify-between">
                    <div>
                      <span className="font-tactical font-bold text-tactical-gold uppercase text-sm block flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-tactical-gold" />
                        RECOMENDAÇÃO OPERACIONAL & AVALIAÇÕES DO INSTAGRAM
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Edite o card de recomendação e os comentários reais do Instagram com arroba, depoimento, estrelas e foto.
                      </p>
                    </div>
                  </div>

                  {/* PRÉ-VISUALIZAÇÃO AO VIVO EM TEMPO REAL */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center font-mono">
                      Pré-visualização ao vivo na Loja (Como os clientes verão):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-gray-700/80">
                      {/* Preview Card 1 */}
                      <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow text-slate-800">
                        <img 
                          src={form.mediaUrl || '/gandola-militar.jpg'} 
                          alt="Avatar" 
                          className="w-14 h-14 rounded-full object-cover border border-forest-600 shrink-0" 
                        />
                        <div className="min-w-0 space-y-1">
                          <span className="text-[8px] font-bold bg-forest-50 text-forest-700 px-1.5 py-0.5 rounded uppercase">
                            {form.featuredLabel || 'RECOMENDAÇÃO OPERACIONAL'}
                          </span>
                          <p className="text-[10px] italic text-slate-700 line-clamp-2">
                            "{form.subtitle || 'O equipamento certo garante sua segurança e resposta rápida em qualquer terreno.'}"
                          </p>
                          <div className="text-[10px] font-bold text-slate-900 truncate">
                            {form.title || 'Capitão Roberto Mendes'}
                          </div>
                        </div>
                      </div>

                      {/* Preview Card 2 */}
                      <div className="bg-white rounded-xl p-3 flex flex-col justify-between shadow text-slate-800">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] uppercase text-slate-900">
                              {form.test2_heading || 'Avaliações de Quem Usa'}
                            </span>
                            <div className="flex text-amber-400 text-xs">
                              {'★'.repeat(Number(form.test2_stars || 5))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 line-clamp-2 italic">
                            "{form.test2_comment || 'A camisa camuflada de R$ 45 é fantástica! Tecido leve, não desbota na lavagem...'}"
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white text-[8px] font-bold">
                            IG
                          </div>
                          <div className="truncate">
                            <div className="text-[10px] font-bold text-slate-900 leading-none">
                              {form.test2_author || 'Marcos Silva (@marcos.tatico)'}
                            </div>
                            <div className="text-[8px] text-slate-400">
                              {form.test2_role || 'Comentário via Instagram • Compra Verificada'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORMULÁRIO: CARD 1 (ESQUERDA - RECOMENDAÇÃO / POST ESPECIALISTA) */}
                  <div className="bg-[#171a21] p-3.5 rounded-lg border border-forest-600/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-700/60 pb-1.5">
                      <span className="font-tactical font-bold text-emerald-400 uppercase text-xs flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        CARD 1: RECOMENDAÇÃO OPERACIONAL / ESPECIALISTA
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Tag / Selo Superior
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.featuredLabel !== undefined ? form.featuredLabel : 'RECOMENDAÇÃO OPERACIONAL'}
                          onChange={e => updateField('featuredLabel', e.target.value)}
                          placeholder="Ex: RECOMENDAÇÃO OPERACIONAL ou POST NO INSTAGRAM"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Nome do Autor / Especialista
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.title !== undefined ? form.title : 'Capitão Roberto Mendes'}
                          onChange={e => updateField('title', e.target.value)}
                          placeholder="Ex: Capitão Roberto Mendes"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Cargo / Descrição do Autor
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.featuredTitle !== undefined ? form.featuredTitle : 'Instrutor de Operações Especiais & Aventura'}
                          onChange={e => updateField('featuredTitle', e.target.value)}
                          placeholder="Ex: Instrutor de Operações Especiais & Aventura"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Foto / Avatar do Especialista
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                            value={form.mediaUrl || ''}
                            onChange={e => updateField('mediaUrl', e.target.value)}
                            placeholder="/gandola-militar.jpg ou link da imagem"
                          />
                          <button
                            type="button"
                            onClick={() => setIsMediaOpen(true)}
                            className="bg-tactical-gold hover:bg-yellow-500 text-black px-2.5 py-1.5 rounded text-xs font-bold font-mono uppercase transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            MÍDIA
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                        Citação / Texto do Depoimento
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none resize-none"
                        value={form.subtitle !== undefined ? form.subtitle : 'O equipamento certo não apenas te leva até o objetivo. Ele garante sua segurança e resposta rápida em qualquer terreno.'}
                        onChange={e => updateField('subtitle', e.target.value)}
                        placeholder="Depoimento ou recomendação..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.buttonText !== undefined ? form.buttonText : 'Ver Escolhas do Especialista >'}
                          onChange={e => updateField('buttonText', e.target.value)}
                          placeholder="Ex: Ver Escolhas do Especialista >"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Link de Destino do Botão
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.buttonLink !== undefined ? form.buttonLink : '#loja'}
                          onChange={e => updateField('buttonLink', e.target.value)}
                          placeholder="Ex: #loja ou https://instagram.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* FORMULÁRIO: CARD 2 (DIREITA - COMENTÁRIO ORIGINAL DO INSTAGRAM) */}
                  <div className="bg-[#171a21] p-3.5 rounded-lg border border-pink-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-700/60 pb-1.5">
                      <span className="font-tactical font-bold text-pink-400 uppercase text-xs flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-pink-400" />
                        CARD 2: AVALIAÇÃO / COMENTÁRIO ORIGINAL DO INSTAGRAM
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Cole o comentário original recebido no Instagram
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Título do Card
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_heading !== undefined ? form.test2_heading : 'Avaliações de Quem Usa'}
                          onChange={e => updateField('test2_heading', e.target.value)}
                          placeholder="Ex: Avaliações de Quem Usa ou Direto do Nosso Instagram"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Estrelas de Avaliação
                        </label>
                        <select
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_stars !== undefined ? form.test2_stars : '5'}
                          onChange={e => updateField('test2_stars', e.target.value)}
                        >
                          <option value="5">★★★★★ (5 Estrelas)</option>
                          <option value="4">★★★★☆ (4 Estrelas)</option>
                          <option value="3">★★★☆☆ (3 Estrelas)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                        Comentário Original do Cliente / Seguidor
                      </label>
                      <textarea
                        rows={3}
                        className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none resize-none"
                        value={form.test2_comment !== undefined ? form.test2_comment : 'A camisa camuflada de R$ 45 é fantástica! Tecido leve, não desbota na lavagem e o corte ficou perfeito. A entrega chegou em 3 dias aqui em São Paulo.'}
                        onChange={e => updateField('test2_comment', e.target.value)}
                        placeholder="Cole aqui o comentário real do Instagram..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Autor / Usuário do Instagram
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_author !== undefined ? form.test2_author : 'Marcos Silva (@marcos.tatico)'}
                          onChange={e => updateField('test2_author', e.target.value)}
                          placeholder="Ex: Marcos Silva (@marcos.tatico)"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Identificação / Selo
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_role !== undefined ? form.test2_role : 'Policial Militar & Praticante de Airsoft • Compra Verificada'}
                          onChange={e => updateField('test2_role', e.target.value)}
                          placeholder="Ex: Comentário via Instagram • Compra Verificada"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Iniciais do Avatar (ou URL de Foto)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_avatar || ''}
                          onChange={e => updateField('test2_avatar', e.target.value)}
                          placeholder="Ex: MS ou link da foto do perfil"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Link do Post ou Perfil do Instagram (Opcional)
                        </label>
                        <input
                          type="url"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                          value={form.test2_link || ''}
                          onChange={e => updateField('test2_link', e.target.value)}
                          placeholder="https://www.instagram.com/p/..."
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}
              
              {/* Seletor Especial para FLASH SALE / OFERTA RELÂMPAGO (WARRIOR_PROMO 100% INTUITIVO) */}
              {activeKey === 'WARRIOR_PROMO' && (
                <div className="space-y-4">
                  {/* PRÉ-VISUALIZAÇÃO AO VIVO NO TOPO DO MODAL */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-400 font-tactical">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        Pré-visualização ao Vivo do Banner:
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono lowercase">(atualiza em tempo real enquanto digita)</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-orange-500/30 p-4 sm:p-5 shadow-2xl">
                      <img 
                        src="/hero-landscape.jpg" 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[1px]" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/90" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3 text-left">
                          <div className="w-10 h-10 rounded-lg bg-orange-600/30 border border-orange-500/50 flex items-center justify-center flex-shrink-0 text-orange-500 shadow">
                            <Zap className="w-5 h-5 fill-orange-500" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-tactical text-xl sm:text-2xl font-bold uppercase tracking-tight text-white leading-tight">
                              {form.title || 'CAMISA CAMUFLADA SELVA'}
                            </h4>
                            <p className="text-orange-400 font-semibold text-xs sm:text-sm">
                              {form.featuredTitle || 'Até 40% OFF nos Melhores Equipamentos Táticos'}
                            </p>
                            <p className="text-white/70 text-[11px] max-w-sm line-clamp-2">
                              {form.subtitle || 'APENAS R$ 45,00 • ENCOMENDE O SEU'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow cursor-default pointer-events-none">
                            {form.buttonText || 'FAÇA SUA ENCOMENDA >'}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-center">
                            <div className="bg-black/70 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-white font-bold">
                              12 <span className="text-[7px] text-slate-400 block -mt-1">HRS</span>
                            </div>
                            <span className="text-slate-400 text-xs">:</span>
                            <div className="bg-black/70 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-white font-bold">
                              35 <span className="text-[7px] text-slate-400 block -mt-1">MIN</span>
                            </div>
                            <span className="text-slate-400 text-xs">:</span>
                            <div className="bg-black/70 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-orange-400 font-bold">
                              45 <span className="text-[7px] text-slate-400 block -mt-1">SEG</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. TÍTULO PRINCIPAL DO BANNER */}
                  <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-white flex items-center gap-1.5 font-tactical">
                        <span>1. Título Principal (Texto Branco Maior)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Ex: CAMISA CAMUFLADA SELVA</span>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-orange-500 rounded px-3 py-2 text-white text-sm font-bold uppercase tracking-tight focus:outline-none transition-colors"
                      value={form.title !== undefined ? form.title : 'CAMISA CAMUFLADA SELVA'}
                      onChange={e => updateField('title', e.target.value)}
                      placeholder="Ex: CAMISA CAMUFLADA SELVA"
                    />
                  </div>

                  {/* 2. SUBTÍTULO / CHAMADA EM DESTAQUE LARANJA */}
                  <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5 font-tactical">
                        <span>2. Chamada em Destaque (Texto Laranja)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Linha colorida de impacto</span>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-orange-500 rounded px-3 py-2 text-orange-400 text-sm font-semibold focus:outline-none transition-colors"
                      value={form.featuredTitle !== undefined ? form.featuredTitle : 'Até 40% OFF nos Melhores Equipamentos Táticos'}
                      onChange={e => updateField('featuredTitle', e.target.value)}
                      placeholder="Ex: Até 40% OFF nos Melhores Equipamentos Táticos"
                    />
                  </div>

                  {/* 3. DESCRIÇÃO DETALHADA DA OFERTA */}
                  <div className="bg-[#171a21] p-3.5 rounded-lg border border-gray-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-gray-300 flex items-center gap-1.5 font-tactical">
                        <span>3. Descrição / Produtos em Promoção (Texto Menor)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Preço e detalhes do fardamento</span>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 hover:border-gray-600 focus:border-orange-500 rounded px-3 py-2 text-white/90 text-xs sm:text-sm focus:outline-none transition-colors"
                      value={form.subtitle !== undefined ? form.subtitle : 'APENAS R$ 45,00 • ENCOMENDE O SEU'}
                      onChange={e => updateField('subtitle', e.target.value)}
                      placeholder="Ex: APENAS R$ 45,00 • ENCOMENDE O SEU"
                    />
                  </div>

                  {/* 4. BOTÃO CTA DE COMPRA */}
                  <div className="bg-[#171a21] border border-orange-500/40 p-4 rounded-lg space-y-3 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5 font-tactical">
                        <Link2 className="w-4 h-4 text-orange-500" />
                        <span>4. Botão de Ação (CTA) & Destino</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Texto do Botão Laranja
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-orange-500 focus:outline-none"
                          value={form.buttonText !== undefined ? form.buttonText : 'FAÇA SUA ENCOMENDA >'}
                          onChange={e => updateField('buttonText', e.target.value)}
                          placeholder="Ex: FAÇA SUA ENCOMENDA >"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-orange-400 mb-1">
                          Direcionar Botão Para:
                        </label>
                        <select
                          className="w-full bg-[#0f1115] border border-orange-500/50 rounded px-3 py-2 text-white text-xs font-bold focus:border-orange-500 focus:outline-none cursor-pointer"
                          value={form.buttonLink || '#loja'}
                          onChange={e => updateField('buttonLink', e.target.value)}
                        >
                          <optgroup label="DESTINOS RECOMENDADOS">
                            <option value="#ofertas">Filtrar Apenas Produtos em Oferta</option>
                            <option value="#loja">Abrir Catálogo Completo da Loja</option>
                            <option value="#categorias">Rolar até as Categorias</option>
                          </optgroup>
                          <optgroup label="FILTRAR POR UMA CATEGORIA">
                            {categories.map((cat) => (
                              <option key={cat.id} value={`category:${cat.id}`}>
                                🏷️ Categoria: {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Atalhos Rápidos para o Botão */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Atalhos rápidos:</span>
                      <button
                        type="button"
                        onClick={() => updateField('buttonLink', '#ofertas')}
                        className={`text-[10px] px-2.5 py-1 rounded border font-mono transition-colors cursor-pointer ${form.buttonLink === '#ofertas' ? 'bg-orange-600 text-white border-orange-500 font-bold' : 'bg-[#0f1115] text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                      >
                        Produtos em Oferta
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('buttonLink', '#loja')}
                        className={`text-[10px] px-2.5 py-1 rounded border font-mono transition-colors cursor-pointer ${form.buttonLink === '#loja' || !form.buttonLink ? 'bg-orange-600 text-white border-orange-500 font-bold' : 'bg-[#0f1115] text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                      >
                        Loja Completa
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos Genéricos (apenas se não for FOOTER_CONTACT, VALUE_PROPS, WARRIOR_PROMO, TESTIMONIALS nem BESTSELLERS_HEADER) */}
              {activeKey !== 'FOOTER_CONTACT' && activeKey !== 'VALUE_PROPS' && activeKey !== 'WARRIOR_PROMO' && activeKey !== 'TESTIMONIALS' && activeKey !== 'BESTSELLERS_HEADER' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título Principal</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-tactical-gold focus:outline-none transition"
                      value={form.title || ''}
                      onChange={e => updateField('title', e.target.value)}
                      placeholder="Título principal da seção..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Subtítulo / Descrição / Rótulos Extras</label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-tactical-gold focus:outline-none transition resize-none"
                      value={form.subtitle || ''}
                      onChange={e => updateField('subtitle', e.target.value)}
                      placeholder="Descrição ou textos extras (separados por | se necessário)..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título Destaque (Opcional)</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-tactical-gold focus:outline-none"
                      value={form.featuredTitle || ''}
                      onChange={e => updateField('featuredTitle', e.target.value)}
                      placeholder="Ex: EQUIPAMENTOS DE ELITE, COMBAT READY..."
                    />
                  </div>

                  
                  <div className="bg-[#0f1115] border border-red-900/60 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Tag de Oferta / Selo em Destaque</span>
                      </label>
                      {form.featuredLabel ? (
                        <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow uppercase font-mono tracking-wider animate-pulse">
                          PREVIEW: {form.featuredLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono italic">Nenhum selo ativo</span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#171a21] border border-gray-700 hover:border-gray-600 focus:border-red-500 rounded px-3 py-2 text-white text-xs sm:text-sm font-bold focus:outline-none transition-colors"
                      value={form.featuredLabel || ''}
                      onChange={e => updateField('featuredLabel', e.target.value)}
                      placeholder="Ex: 50% OFF EM PRODUTOS SELECIONADOS ou SUPER OFERTA"
                    />
                    {/* Botões Rápidos de Sugestões de Tag de Oferta */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Sugestões Rápidas:</span>
                      {[
                        '50% OFF EM PRODUTOS SELECIONADOS',
                        'SUPER OFERTA LIMITADA',
                        'LIQUIDAÇÃO TÁTICA -20%',
                        'FRETE GRÁTIS BRASIL'
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => updateField('featuredLabel', sug)}
                          className="text-[10px] bg-[#181c24] hover:bg-tactical-gold hover:text-black text-gray-300 px-2 py-1 rounded transition-colors border border-gray-700 font-mono font-medium cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                      {form.featuredLabel && (
                        <button
                          type="button"
                          onClick={() => updateField('featuredLabel', '')}
                          className="text-[10px] bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-bold px-2 py-1 rounded transition-colors ml-auto cursor-pointer"
                        >
                          Remover Tag
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Media */}
                  <div className="bg-[#0f1115] p-4 rounded border border-gray-800 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="block text-[10px] font-bold uppercase text-tactical-gold">
                        Mídia da Seção (Imagem ou Vídeo)
                      </label>

                      <div className="flex items-center gap-2">
                        {/* Botão de Upload Direto do Computador */}
                        <label className="bg-tactical-gold hover:bg-tactical-goldHover text-black text-[11px] font-tactical font-extrabold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 transition-all shadow">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploading ? 'ENVIANDO...' : 'ENVIAR FOTO/VÍDEO'}</span>
                          <input
                            type="file"
                            accept="image/*,video/mp4"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              if (onUpload) {
                                onUpload(e, (url, type) => {
                                  updateField('mediaUrl', url);
                                  updateField('mediaType', type);
                                });
                              }
                            }}
                          />
                        </label>

                        {/* Botão de Abrir Galeria */}
                        <button
                          type="button"
                          onClick={() => setIsMediaOpen(true)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-all border border-gray-700"
                        >
                          <HardDriveUpload className="w-3.5 h-3.5 text-tactical-gold" /> Galeria
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select
                        className="bg-[#171a21] border border-gray-700 text-white rounded px-2 text-xs"
                        value={form.mediaType || 'IMAGE'}
                        onChange={e => updateField('mediaType', e.target.value)}
                      >
                        <option value="IMAGE">Imagem</option>
                        <option value="VIDEO_FILE">Vídeo MP4</option>
                        <option value="YOUTUBE">YouTube</option>
                      </select>

                      <input
                        type="text"
                        className="flex-1 bg-[#171a21] border border-gray-700 rounded px-3 py-1.5 text-white text-xs focus:border-tactical-gold focus:outline-none"
                        value={form.mediaUrl || ''}
                        onChange={e => updateField('mediaUrl', e.target.value)}
                        placeholder="Cole a URL ou clique em ENVIAR FOTO/VÍDEO acima..."
                      />
                    </div>

                    {/* Pré-visualização ao Vivo da Imagem/Vídeo */}
                    {form.mediaUrl && (
                      <div className="mt-2 relative aspect-video bg-black rounded overflow-hidden border border-gray-800">
                        <MediaViewer
                          mediaUrl={form.mediaUrl}
                          mediaType={form.mediaType || 'IMAGE'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-tactical-gold text-[9px] font-bold px-2 py-0.5 rounded border border-tactical-gold/30 uppercase">
                          Pré-visualização ao vivo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA & SELETOR INTELIGENTE DE LINK DO BOTÃO */}
                  <div className="bg-[#0f1115] border border-tactical-gold/40 p-4 rounded-lg space-y-3.5 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold uppercase text-tactical-gold flex items-center gap-1.5 font-tactical">
                        <Link2 className="w-4 h-4 text-tactical-gold" />
                        <span>Botão de Ação (CTA) & Destino Inteligente</span>
                      </label>

                      {/* Badge Informativa do Destino Atual */}
                      {(() => {
                        const currentLink = form.buttonLink || '';
                        let badgeText = 'Catálogo da Loja';
                        let badgeColor = 'bg-blue-950/70 text-blue-300 border-blue-700';

                        if (!currentLink || currentLink === '#loja') {
                          badgeText = 'Catálogo Completo da Loja';
                          badgeColor = 'bg-blue-950/70 text-blue-300 border-blue-700';
                        } else if (currentLink === '#ofertas') {
                          badgeText = 'Apenas Produtos em Oferta';
                          badgeColor = 'bg-red-950/70 text-red-300 border-red-700';
                        } else if (currentLink.startsWith('category:')) {
                          const catId = currentLink.replace('category:', '');
                          const foundCat = categories.find(c => String(c.id) === String(catId));
                          badgeText = `Categoria: ${foundCat ? foundCat.name : 'Selecionada'}`;
                          badgeColor = 'bg-tactical-gold/20 text-tactical-gold border-tactical-gold/50';
                        } else if (currentLink.startsWith('product:')) {
                          const prodId = currentLink.replace('product:', '');
                          const foundProd = products.find(p => String(p.id) === String(prodId));
                          badgeText = `Produto: ${foundProd ? foundProd.name : 'Selecionado'}`;
                          badgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-700';
                        } else if (currentLink === '#categorias') {
                          badgeText = 'Seção de Categorias Populares';
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        } else if (currentLink === '#video-feature') {
                          badgeText = 'Seção de Vídeo Institucional';
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        } else if (currentLink === '#promocao') {
                          badgeText = 'Seção Promocional Warrior';
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        } else if (currentLink === '#contato') {
                          badgeText = 'Atendimento & Rodapé';
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        } else if (currentLink === '#home') {
                          badgeText = 'Topo da Página (Início)';
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        } else if (currentLink.startsWith('http') || currentLink.startsWith('wa.me')) {
                          badgeText = 'Link Externo / WhatsApp';
                          badgeColor = 'bg-purple-950/70 text-purple-300 border-purple-700';
                        } else {
                          badgeText = `Link: ${currentLink}`;
                          badgeColor = 'bg-gray-800 text-gray-300 border-gray-700';
                        }

                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded border flex items-center gap-1 font-mono ${badgeColor}`}>
                            <span className="text-gray-400">Destino:</span> {badgeText}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Texto do Botão */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Texto Exibido no Botão (CTA)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#171a21] border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                          value={form.buttonText || ''}
                          onChange={e => updateField('buttonText', e.target.value)}
                          placeholder="Ex: COMPRAR AGORA ou VER CATEGORIA"
                        />
                      </div>

                      {/* Seletor Visual e Intuitivo de Destino */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-tactical-gold mb-1">
                          Direcionar o Botão Para Onde?
                        </label>
                        <select
                          className="w-full bg-[#171a21] border border-tactical-gold/60 text-tactical-gold font-bold text-xs rounded px-3 py-2 focus:border-tactical-gold focus:outline-none cursor-pointer"
                          value={
                            (() => {
                              const l = form.buttonLink || '';
                              if (['#loja', '#ofertas', '#categorias', '#video-feature', '#promocao', '#contato', '#home'].includes(l)) return l;
                              if (l.startsWith('category:')) return l;
                              if (l.startsWith('product:')) return l;
                              if (l === '') return '#loja';
                              return 'CUSTOM';
                            })()
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'CUSTOM') {
                              if (['#loja', '#ofertas', '#categorias', '#video-feature', '#promocao', '#contato', '#home'].includes(form.buttonLink) || form.buttonLink?.startsWith('category:')) {
                                updateField('buttonLink', 'https://');
                              }
                            } else {
                              updateField('buttonLink', val);
                            }
                          }}
                        >
                          <optgroup label="NAVEGAÇÃO DA LOJA & PÁGINA">
                            <option value="#loja">Abrir Catálogo Completo da Loja</option>
                            <option value="#ofertas">Abrir Apenas Produtos com Desconto / Ofertas</option>
                            <option value="#categorias">Rolar até as Categorias Populares</option>
                            <option value="#video-feature">Rolar até a Seção de Vídeo Feature</option>
                            <option value="#promocao">Rolar até a Seção Promocional Warrior</option>
                            <option value="#contato">Rolar até Atendimento & Rodapé</option>
                            <option value="#home">Rolar até o Início (Topo da Página)</option>
                          </optgroup>

                          <optgroup label="FILTRAR POR UMA CATEGORIA ESPECÍFICA NA LOJA">
                            {categories.map((cat) => (
                              <option key={cat.id} value={`category:${cat.id}`}>
                                ️ Categoria: {cat.name} ({products.filter(p => p.categoryId === cat.id).length} itens)
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="LINK EXTERNO OU PERSONALIZADO">
                            <option value="CUSTOM">Digitar URL Externa ou WhatsApp Manual...</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Botões de Atalhos Rápidos */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Atalhos de Destino:</span>
                      <button
                        type="button"
                        onClick={() => updateField('buttonLink', '#loja')}
                        className={`text-[10px] px-2 py-0.5 rounded border font-mono transition-colors cursor-pointer ${form.buttonLink === '#loja' || !form.buttonLink ? 'bg-tactical-gold text-black border-tactical-gold font-bold' : 'bg-[#181c24] text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                      >
                        Loja Completa
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('buttonLink', '#ofertas')}
                        className={`text-[10px] px-2 py-0.5 rounded border font-mono transition-colors cursor-pointer ${form.buttonLink === '#ofertas' ? 'bg-red-600 text-white border-red-500 font-bold' : 'bg-[#181c24] text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                      >
                        Ofertas
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('buttonLink', '#categorias')}
                        className={`text-[10px] px-2 py-0.5 rounded border font-mono transition-colors cursor-pointer ${form.buttonLink === '#categorias' ? 'bg-tactical-gold text-black border-tactical-gold font-bold' : 'bg-[#181c24] text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                      >
                        Categorias
                      </button>
                    </div>

                    {/* Campo de URL Manual / Personalizada (visível quando for link customizado ou para conferência) */}
                    {(
                      !['#loja', '#ofertas', '#categorias', '#video-feature', '#promocao', '#contato', '#home'].includes(form.buttonLink || '') &&
                      !form.buttonLink?.startsWith('category:')
                    ) && (
                      <div className="bg-[#171a21] p-2.5 rounded border border-gray-700 space-y-1 mt-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-400">
                          URL Personalizada ou Link Externo (ex: https://wa.me/5511999999999 ou https://...)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0f1115] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs font-mono focus:border-tactical-gold focus:outline-none"
                          value={form.buttonLink || ''}
                          onChange={e => updateField('buttonLink', e.target.value)}
                          placeholder="Cole a URL ou link do WhatsApp aqui..."
                        />
                      </div>
                    )}
                  </div>
                  {/* Botão Secundário Opcional (para HERO_MAIN e POPULAR_CATEGORIES) */}
                  {(activeKey === 'HERO_MAIN' || activeKey === 'POPULAR_CATEGORIES') && (
                    <div className="bg-[#171a21] p-3 rounded border border-gray-700 space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-tactical-gold">
                        Texto do Botão Secundário ({activeKey === 'HERO_MAIN' ? 'Ex: VER CATEGORIAS ↓' : 'Ex: VER TODOS OS PRODUTOS'})
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0f1115] border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-tactical-gold focus:outline-none"
                        value={form.secondaryButtonText || ''}
                        onChange={e => updateField('secondaryButtonText', e.target.value)}
                        placeholder={activeKey === 'HERO_MAIN' ? 'VER CATEGORIAS ↓' : 'VER TODOS OS PRODUTOS'}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0f1115] border-t border-gray-800">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-tactical-gold hover:bg-yellow-400 text-black font-tactical text-xl font-bold py-3 rounded shadow-lg transition-all flex justify-center items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'SALVANDO...' : `SALVAR SEÇÃO`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Galeria Picker */}
      {isMediaOpen && (
        <MediaPickerModal
          isOpen={isMediaOpen}
          mediaLibrary={mediaLibrary}
          onSelect={handleSelectMedia}
          onClose={() => setIsMediaOpen(false)}
          onUpload={onUpload}
          uploading={uploading}
          onDelete={onDelete}
          authHeader={getAuthHeaders()}
        />
      )}
    </div>
  );
}
