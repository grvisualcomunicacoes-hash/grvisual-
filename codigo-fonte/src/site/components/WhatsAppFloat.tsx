import { IconWhatsApp } from './Icons';

export function WhatsAppFloat({ phone }: { phone: string }) {
  const text = encodeURIComponent('Olá! Vim pelo site da GR Visual e gostaria de mais informações.');
  return (
    <a className="wa-float" href={`https://wa.me/${phone}?text=${text}`} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
      <IconWhatsApp />
    </a>
  );
}
