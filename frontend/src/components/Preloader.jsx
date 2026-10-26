import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield } from 'lucide-react';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INICIALIZANDO PLATAFORMA...');
  const [headerData, setHeaderData] = useState({
    title: 'COMANDOS',
    subtitle: 'ARTIGOS MILITARES',
    buttonText: 'EQUIPAMENTOS TÁTICOS & FORÇAS ESPECIAIS'
  });

  const preloaderRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch de dados em segundo plano (CMS, produtos, imagens)
    const fetchDataPromise = (async () => {
      try {
        const secRes = await fetch('/api/sections').catch(() => null);
        if (secRes && secRes.ok) {
          const sections = await secRes.json();
          const headerSection = sections.find(s => s.sectionKey === 'HEADER');
          if (headerSection && isMounted) {
            setHeaderData({
              title: headerSection.title || 'COMANDOS',
              subtitle: headerSection.subtitle || 'ARTIGOS MILITARES',
              buttonText: headerSection.buttonText || 'EQUIPAMENTOS TÁTICOS & FORÇAS ESPECIAIS'
            });
          }
        }

        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories').catch(() => null),
          fetch('/api/products').catch(() => null)
        ]);

        if (prodRes && prodRes.ok) {
          const prods = await prodRes.json();
          const imageUrls = prods.slice(0, 4).map(p => p.media?.[0]?.url).filter(Boolean);
          await Promise.all(
            imageUrls.map(url => new Promise(resolve => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = url;
            }))
          );
        }
      } catch (e) {
        // Ignora erros para prosseguir suavemente
      }
    })();

    // 2. Animação fluida de 0 a 100% cobrindo os 4 segundos
    const progressObj = { value: 0 };
    const progressTween = gsap.to(progressObj, {
      value: 100,
      duration: 3.6,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (!isMounted) return;
        const currentVal = Math.min(100, Math.round(progressObj.value));
        setProgress(currentVal);

        if (currentVal < 25) {
          setStatusText('INICIALIZANDO PLATAFORMA...');
        } else if (currentVal < 55) {
          setStatusText('SINCRONIZANDO ARSENAL & CATÁLOGO...');
        } else if (currentVal < 85) {
          setStatusText('PREPARANDO EQUIPAMENTOS TÁTICOS...');
        } else {
          setStatusText('SISTEMA OPERACIONAL PRONTO');
        }
      }
    });

    // 3. Aguarda exatamente 4 segundos (4000ms) para concluir a exibição
    const timer = setTimeout(async () => {
      await fetchDataPromise;
      if (!isMounted) return;

      setProgress(100);
      setStatusText('SISTEMA OPERACIONAL PRONTO');

      // Transição de saída GSAP tática
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      tl.to(contentRef.current, {
        scale: 0.94,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in'
      })
      .to(preloaderRef.current, {
        yPercent: -100,
        duration: 0.65,
        ease: 'expo.inOut'
      });
    }, 4000);

    return () => {
      isMounted = false;
      progressTween.kill();
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[9999] bg-[#0d1f18] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Background Glowing Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Logo/Marca Oficial Comandos Artigos Militares com Pulso */}
        <div className="relative mb-6">
          <div className="absolute -inset-2.5 bg-emerald-500 blur-xl opacity-40 animate-pulse rounded-full" />
          <div className="relative bg-[#14231c] border-2 border-emerald-500/60 p-2 rounded-full shadow-2xl flex items-center justify-center">
            <img 
              src="/logo-comandos.png" 
              alt="Comandos Artigos Militares" 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-2xl" 
            />
          </div>
        </div>

        {/* Subtítulo e Slogan da Marca */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-none mb-1 uppercase">
          {headerData.title}
        </h1>
        <h2 className="text-xs sm:text-sm font-bold text-emerald-400 tracking-[0.25em] uppercase mb-1">
          {headerData.subtitle}
        </h2>
        <span className="text-[10px] text-white/70 font-medium tracking-[0.2em] uppercase mb-8">
          {headerData.buttonText}
        </span>

        {/* Barra de Progresso Real */}
        <div className="w-full bg-white/10 border border-white/20 rounded-full h-2 p-0.5 mb-3 overflow-hidden shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_12px_#10b981]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Texto de Status & Porcentagem */}
        <div className="w-full flex justify-between items-center text-[10px] font-mono font-medium text-white/70">
          <span className="truncate pr-2 text-white/80">{statusText}</span>
          <span className="text-emerald-400 font-bold text-xs">{progress}%</span>
        </div>

      </div>
    </div>
  );
}
