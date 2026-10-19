'use client';

import Link from 'next/link';
import { categoryLabel } from '@/lib/categories';
import { formatBRL } from '@/lib/format';
import { useCart } from './CartProvider';
import { IconArrow } from './Icons';
import { Notices } from './Notices';

export function CartView({ notices }: { notices: string[] }) {
  const { items, ready, remove, setQuantity, setNotes, estimatedTotal, hasQuoteItems } = useCart();

  if (!ready) {
    return <div className="empty-state muted"><span className="spinner" style={{ display: 'inline-block' }} /> Carregando carrinho…</div>;
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.4rem' }}>Seu carrinho está vazio</h2>
        <p className="muted">Escolha um pacote ou peça um orçamento personalizado.</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link href="/servicos" className="btn btn-primary">Ver serviços</Link>
          <Link href="/orcamento" className="btn">Solicitar orçamento</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((i) => {
          const quote = i.unitPrice === null || i.pricingMode === 'orcamento';
          const canQty = i.allowQuantity && !quote && i.maxQuantity > 1;
          return (
            <article key={i.slug} className="cart-item">
              <div className="cart-item-head">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>{categoryLabel(i.category)}</div>
                  <h3>{i.name}</h3>
                </div>
                <button type="button" className="link-btn" onClick={() => remove(i.slug)} aria-label={`Remover ${i.name}`}>
                  Remover
                </button>
              </div>
              <div className="summary-row" style={{ alignItems: 'center' }}>
                {canQty ? (
                  <div className="qty" role="group" aria-label={`Quantidade de ${i.name}`}>
                    <button type="button" onClick={() => setQuantity(i.slug, i.quantity - 1)} disabled={i.quantity <= 1} aria-label="Diminuir">−</button>
                    <output aria-live="polite">{i.quantity}</output>
                    <button type="button" onClick={() => setQuantity(i.slug, i.quantity + 1)} disabled={i.quantity >= i.maxQuantity} aria-label="Aumentar">+</button>
                  </div>
                ) : (
                  <span className="muted small">{quote ? 'Valor definido no orçamento' : 'Quantidade: 1'}</span>
                )}
                <div style={{ textAlign: 'right' }}>
                  {quote ? (
                    <strong className="grad-text">Sob orçamento</strong>
                  ) : (
                    <>
                      {i.quantity > 1 && <div className="muted small">{i.quantity} × {formatBRL(i.unitPrice)}</div>}
                      <strong style={{ fontSize: '1.15rem' }}>{formatBRL((i.unitPrice as number) * i.quantity)}</strong>
                    </>
                  )}
                </div>
              </div>
              {i.needsAdBudget && <span className="badge badge-warn" style={{ justifySelf: 'start' }}>Verba de anúncios à parte</span>}
              <div className="field">
                <label htmlFor={`n-${i.slug}`} className="small">Observações para este serviço</label>
                <textarea
                  id={`n-${i.slug}`}
                  className="textarea"
                  style={{ minHeight: 70 }}
                  placeholder="Ex.: nome do negócio, cores, prazo desejado…"
                  value={i.notes}
                  maxLength={500}
                  onChange={(e) => setNotes(i.slug, e.target.value)}
                />
              </div>
            </article>
          );
        })}
        <Link href="/servicos" className="btn btn-ghost">← Continuar escolhendo</Link>
      </div>

      <aside className="card summary" aria-label="Resumo do pedido">
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Resumo</h2>
        {items.map((i) => (
          <div key={i.slug} className="summary-row small">
            <span>{i.name}{i.quantity > 1 ? ` × ${i.quantity}` : ''}</span>
            <span>{i.unitPrice === null ? 'Orçamento' : formatBRL(i.unitPrice * i.quantity)}</span>
          </div>
        ))}
        <div className="summary-row summary-total">
          <span>Total estimado</span>
          <span>{estimatedTotal > 0 ? formatBRL(estimatedTotal) : 'A definir'}</span>
        </div>
        {hasQuoteItems && estimatedTotal > 0 && <p className="small muted" style={{ margin: 0 }}>+ itens sob orçamento</p>}
        <p className="small muted" style={{ margin: 0 }}>Valores de referência. Sem descontos ou taxas automáticas; o valor final é confirmado no orçamento.</p>
        <Link href="/finalizar" className="btn btn-primary btn-block">Revisar e enviar pedido <IconArrow /></Link>
        <Notices notices={notices} title="Importante" />
      </aside>
    </div>
  );
}
