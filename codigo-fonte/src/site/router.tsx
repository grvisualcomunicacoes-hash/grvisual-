import { useEffect, useState, type ReactNode } from 'react';

/** Navegação por "#/" — funciona no GitHub Pages sem configuração extra. */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h.split('?')[0] : '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const on = () => {
      setPath(currentPath());
      if (!window.location.hash.includes('#sec-')) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

export const href = (to: string) => (to.startsWith('http') || to.startsWith('mailto:') ? to : `#${to}`);

export function Link({ to, children, className, onClick, ...rest }: { to: string; children: ReactNode; className?: string; onClick?: () => void; [k: string]: unknown }) {
  return (
    <a href={href(to)} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

export function navigate(to: string) {
  window.location.hash = to;
}
