import { Link } from '../router';
import { categoryLabel } from '@/lib/categories';
import { effectivePrice, formatBRL } from '@/lib/format';
import type { Package } from '@/lib/types';
import { AddToCartButton } from './AddToCartButton';

export function PriceTag({ pkg }: { pkg: Package }) {
  if (pkg.pricing_mode === 'orcamento' || effectivePrice(pkg.price, pkg.promo_price) === null) {
    return <div className="price"><span className="price-quote">Sob orçamento</span></div>;
  }
  const now = effectivePrice(pkg.price, pkg.promo_price);
  const hasPromo = pkg.promo_price !== null && pkg.price !== null && pkg.promo_price < pkg.price;
  return (
    <div className="price">
      {hasPromo && <span className="price-old">{formatBRL(pkg.price)}</span>}
      <span className="price-now">{formatBRL(now)}</span>
      {pkg.duration && <span className="muted small">/ {pkg.duration}</span>}
    </div>
  );
}

export function PackageCard({ pkg, showCategory = true }: { pkg: Package; showCategory?: boolean }) {
  const preview = pkg.includes.slice(0, 5);
  return (
    <article className={`pkg-card ${pkg.featured ? 'featured' : ''}`}>
      {pkg.image_url && (
        <div className="pkg-cover">
          <img src={pkg.image_url} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="pkg-top">
        <div>
          {showCategory && <div className="eyebrow" style={{ marginBottom: 6 }}>{categoryLabel(pkg.category)}</div>}
          <h3 className="pkg-name">
            <Link to={`/servicos/${pkg.slug}`}>{pkg.name}</Link>
          </h3>
        </div>
        {pkg.promo_price !== null && pkg.price !== null && pkg.promo_price < pkg.price && (
          <span className="badge badge-magenta">Promoção</span>
        )}
      </div>
      <PriceTag pkg={pkg} />
      {pkg.description && <p className="pkg-desc">{pkg.description}</p>}
      {preview.length > 0 && (
        <ul className="check-list">
          {preview.map((i) => (
            <li key={i}>{i}</li>
          ))}
          {pkg.includes.length > preview.length && <li className="muted">e mais {pkg.includes.length - preview.length}…</li>}
        </ul>
      )}
      <div className="meta-list">
        {pkg.deliverables && <span className="badge">{pkg.deliverables}</span>}
        {pkg.needs_ad_budget && <span className="badge badge-warn">Verba de anúncios à parte</span>}
      </div>
      <div className="pkg-actions">
        <AddToCartButton pkg={pkg} full />
        <Link to={`/servicos/${pkg.slug}`} className="btn btn-ghost btn-block btn-sm">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
