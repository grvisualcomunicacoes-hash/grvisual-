import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ className: 'icon', viewBox: '0 0 24 24', 'aria-hidden': true, ...p });
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.6 2 2.17 6.42 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2.1 22l5.32-1.4a9.86 9.86 0 0 0 4.62 1.18h.01c5.44 0 9.87-4.43 9.87-9.87 0-2.64-1.03-5.12-2.87-7Zm-7 15.2h-.01a8.2 8.2 0 0 1-4.17-1.15l-.3-.18-3.16.83.84-3.08-.2-.32a8.17 8.17 0 0 1-1.25-4.34c0-4.53 3.69-8.21 8.23-8.21a8.2 8.2 0 0 1 8.21 8.22c0 4.53-3.69 8.23-8.2 8.23Zm4.5-6.16c-.24-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);
export const IconCart = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
    <circle cx="10" cy="20.5" r="1.3" />
    <circle cx="17" cy="20.5" r="1.3" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconArrow = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)} {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base(p)} {...stroke}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
);
export const IconFacebook = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.5V4.46A20 20 0 0 0 14.3 4.3c-2.2 0-3.7 1.34-3.7 3.8v2.4H8.1v3h2.5V21h2.9Z" /></svg>
);
export const IconTikTok = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.75a5.73 5.73 0 0 0-.78-.05 5.7 5.7 0 1 0 5.7 5.7V9.1a7.4 7.4 0 0 0 4.3 1.37V7.4a4.3 4.3 0 0 1-3.2-1.6Z" /></svg>
);
export const IconChat = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8M8 12h5" /></svg>
);
export const IconMegaphone = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></svg>
);
export const IconPalette = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.1-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="10" cy="7" r="1" fill="currentColor" /><circle cx="14.5" cy="7" r="1" fill="currentColor" /></svg>
);
export const IconSpark = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)} {...stroke}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
