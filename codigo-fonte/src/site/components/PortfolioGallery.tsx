import { Link } from '../router';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PortfolioItem } from '@/lib/types';
import { IconClose } from './Icons';

export function PortfolioGallery({ items, showFilters = true }: { items: PortfolioItem[]; showFilters?: boolean }) {
  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))], [items]);
  const [filter, setFilter] = useState<string>('Todos');
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = filter === 'Todos' ? items : items.filter((i) => i.category === filter);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!items.length) {
    return <div className="empty-state muted">Novos trabalhos serão publicados em breve.</div>;
  }

  return (
    <>
      {showFilters && categories.length > 1 && (
        <div className="filter-bar" role="toolbar" aria-label="Filtrar portfólio por categoria">
          {['Todos', ...categories].map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="port-grid">
        {visible.map((item) => (
          <button key={item.id} type="button" className="port-card" onClick={() => setOpen(item)} aria-label={`Ver projeto: ${item.title}`}>
            <div className="thumb">
              {item.images[0] ? (
                <img src={item.images[0]} alt="" loading="lazy" decoding="async" />
              ) : null}
            </div>
            {item.images.length > 1 && <span className="port-count">{item.images.length} imagens</span>}
            <span className="cap">
              <span>{item.category}</span>
              <strong>{item.client_name || item.title}</strong>
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lb-title" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="lightbox-bar">
            <strong style={{ fontFamily: 'var(--font-display)' }}>{open.client_name || open.title}</strong>
            <button ref={closeRef} type="button" className="menu-toggle" onClick={() => setOpen(null)} aria-label="Fechar">
              <IconClose />
            </button>
          </div>
          <div className="lightbox-body">
            <div className="lightbox-images">
              {open.images.map((src, i) => (
                <img key={src} src={src} alt={`${open.title} — imagem ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              ))}
            </div>
            <div className="lightbox-info card">
              <div className="eyebrow">{open.category}</div>
              <h2 id="lb-title" style={{ fontSize: '1.5rem' }}>{open.title}</h2>
              {open.description && <p className="muted">{open.description}</p>}
              {open.highlights.length > 0 && (
                <ul className="check-list" style={{ marginBottom: 16 }}>
                  {open.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {open.services.length > 0 && (
                <>
                  <div className="label small muted" style={{ marginBottom: 6 }}>Serviços</div>
                  <div className="meta-list" style={{ marginBottom: 18 }}>
                    {open.services.map((s) => (
                      <span key={s} className="badge badge-cyan">{s}</span>
                    ))}
                  </div>
                </>
              )}
              <Link to="/orcamento" className="btn btn-primary btn-block" onClick={() => setOpen(null)}>
                Quero algo assim
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
