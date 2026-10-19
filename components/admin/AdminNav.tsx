'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: 'Início', icon: '◧' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '✉' },
  { href: '/admin/pacotes', label: 'Pacotes', icon: '▦' },
  { href: '/admin/portfolio', label: 'Portfólio', icon: '◩' },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: '✎' },
];

export function AdminNav({ variant }: { variant: 'side' | 'bottom' }) {
  const path = usePathname();
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  return (
    <>
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(i.href) ? 'page' : undefined}>
          {variant === 'bottom' && <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{i.icon}</span>}
          {i.label}
        </Link>
      ))}
    </>
  );
}
