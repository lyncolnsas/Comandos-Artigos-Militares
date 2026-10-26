import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin, 
  Send
} from 'lucide-react';

// Ícones SVG de alta fidelidade para redes não nativas do Lucide ou personalizadas
export const TikTokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46v-7.14a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.01z"/>
  </svg>
);

export const XTwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.188 8.188 0 0 1-5.82 2.42c-1.46 0-2.89-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.4c0-4.54 3.7-8.24 8.24-8.24zm4.56 11.64c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.29 3.8.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.3z"/>
  </svg>
);

export const TelegramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

export const KwaiIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.8 8.4C18 7.3 16.7 6.6 15.3 6.6H8.7c-1.4 0-2.7.7-3.5 1.8L2.4 12l2.8 3.6c.8 1.1 2.1 1.8 3.5 1.8h6.6c1.4 0 2.7-.7 3.5-1.8l2.8-3.6-2.8-3.6zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/>
  </svg>
);

export const PinterestIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

// Lista padrão de todas as redes sociais suportadas com logos e cores oficiais
export const DEFAULT_SOCIAL_NETWORKS = [
  {
    key: 'instagram',
    label: 'Instagram',
    iconType: 'instagram',
    defaultEnabled: true,
    defaultUrl: 'https://www.instagram.com/comandosartigosmilitaress',
    placeholder: 'https://www.instagram.com/seu_perfil',
    brandColor: 'hover:bg-[#E1306C]',
    brandBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    brandHex: '#E1306C',
    badgeText: 'text-[#E1306C]'
  },
  {
    key: 'facebook',
    label: 'Facebook',
    iconType: 'facebook',
    defaultEnabled: true,
    defaultUrl: 'https://facebook.com/comandosartigosmilitares',
    placeholder: 'https://facebook.com/sua_pagina',
    brandColor: 'hover:bg-[#1877F2]',
    brandBg: 'bg-[#1877F2]',
    brandHex: '#1877F2',
    badgeText: 'text-[#1877F2]'
  },
  {
    key: 'youtube',
    label: 'YouTube',
    iconType: 'youtube',
    defaultEnabled: true,
    defaultUrl: 'https://youtube.com/@comandosartigosmilitares',
    placeholder: 'https://youtube.com/@seu_canal',
    brandColor: 'hover:bg-[#FF0000]',
    brandBg: 'bg-[#FF0000]',
    brandHex: '#FF0000',
    badgeText: 'text-[#FF0000]'
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp Oficial',
    iconType: 'whatsapp',
    defaultEnabled: true,
    defaultUrl: 'https://wa.me/5599991561407',
    placeholder: 'https://wa.me/5599991561407',
    brandColor: 'hover:bg-[#25D366]',
    brandBg: 'bg-[#25D366]',
    brandHex: '#25D366',
    badgeText: 'text-[#25D366]'
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    iconType: 'tiktok',
    defaultEnabled: false,
    defaultUrl: 'https://www.tiktok.com/@comandosartigosmilitares',
    placeholder: 'https://www.tiktok.com/@seu_usuario',
    brandColor: 'hover:bg-black',
    brandBg: 'bg-[#000000]',
    brandHex: '#00F2FE',
    badgeText: 'text-[#00F2FE]'
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    iconType: 'twitter',
    defaultEnabled: false,
    defaultUrl: 'https://x.com/comandosartigos',
    placeholder: 'https://x.com/seu_perfil',
    brandColor: 'hover:bg-slate-900',
    brandBg: 'bg-[#0f1419]',
    brandHex: '#FFFFFF',
    badgeText: 'text-white'
  },
  {
    key: 'telegram',
    label: 'Telegram',
    iconType: 'telegram',
    defaultEnabled: false,
    defaultUrl: 'https://t.me/comandosartigosmilitares',
    placeholder: 'https://t.me/seu_canal',
    brandColor: 'hover:bg-[#0088cc]',
    brandBg: 'bg-[#0088cc]',
    brandHex: '#0088cc',
    badgeText: 'text-[#0088cc]'
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    iconType: 'linkedin',
    defaultEnabled: false,
    defaultUrl: 'https://linkedin.com/company/comandosartigosmilitares',
    placeholder: 'https://linkedin.com/company/sua_empresa',
    brandColor: 'hover:bg-[#0A66C2]',
    brandBg: 'bg-[#0A66C2]',
    brandHex: '#0A66C2',
    badgeText: 'text-[#0A66C2]'
  },
  {
    key: 'kwai',
    label: 'Kwai',
    iconType: 'kwai',
    defaultEnabled: false,
    defaultUrl: 'https://kwai.com/@comandosartigos',
    placeholder: 'https://kwai.com/@seu_perfil',
    brandColor: 'hover:bg-[#FF5000]',
    brandBg: 'bg-[#FF5000]',
    brandHex: '#FF5000',
    badgeText: 'text-[#FF5000]'
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    iconType: 'pinterest',
    defaultEnabled: false,
    defaultUrl: 'https://pinterest.com/comandosartigos',
    placeholder: 'https://pinterest.com/seu_perfil',
    brandColor: 'hover:bg-[#E60023]',
    brandBg: 'bg-[#E60023]',
    brandHex: '#E60023',
    badgeText: 'text-[#E60023]'
  }
];

// Renderizador dinâmico de ícones
export function renderSocialIcon(iconType, className = "w-4 h-4") {
  switch (iconType) {
    case 'instagram': return <Instagram className={className} />;
    case 'facebook':  return <Facebook className={className} />;
    case 'youtube':   return <Youtube className={className} />;
    case 'whatsapp':  return <WhatsAppIcon className={className} />;
    case 'tiktok':    return <TikTokIcon className={className} />;
    case 'twitter':   return <XTwitterIcon className={className} />;
    case 'telegram':  return <TelegramIcon className={className} />;
    case 'linkedin':  return <Linkedin className={className} />;
    case 'kwai':      return <KwaiIcon className={className} />;
    case 'pinterest': return <PinterestIcon className={className} />;
    default:          return <Instagram className={className} />;
  }
}

/**
 * Converte a string ou objeto de configuração de redes sociais em um array estruturado
 */
export function parseSocialNetworks(rawData) {
  let parsedMap = {};

  if (rawData) {
    if (typeof rawData === 'string') {
      try {
        parsedMap = JSON.parse(rawData);
      } catch (e) {
        // Fallback para formato chave:valor
        try {
          rawData.split(';').forEach(chunk => {
            const [k, enabled, url] = chunk.split('::');
            if (k) {
              parsedMap[k] = { enabled: enabled === '1' || enabled === 'true', url: url || '' };
            }
          });
        } catch (e2) {}
      }
    } else if (typeof rawData === 'object') {
      parsedMap = rawData;
    }
  }

  return DEFAULT_SOCIAL_NETWORKS.map(item => {
    const custom = parsedMap[item.key] || {};
    return {
      ...item,
      enabled: custom.enabled !== undefined ? Boolean(custom.enabled) : item.defaultEnabled,
      url: custom.url !== undefined && custom.url !== null ? String(custom.url).trim() : item.defaultUrl
    };
  });
}

/**
 * Serializa a lista de redes para salvar no campo da seção (JSON)
 */
export function serializeSocialNetworks(socialsList) {
  const map = {};
  socialsList.forEach(item => {
    map[item.key] = {
      enabled: Boolean(item.enabled),
      url: item.url || ''
    };
  });
  return JSON.stringify(map);
}
