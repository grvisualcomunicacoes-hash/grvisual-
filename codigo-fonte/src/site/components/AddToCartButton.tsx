import { Link } from '../router';
import { effectivePrice } from '@/lib/format';
import type { Package } from '@/lib/types';
import { useCart } from './CartProvider';
import { IconCart, IconCheck } from './Icons';

export function AddToCartButton({ pkg, full = false }: { pkg: Package; full?: boolean }) {
  const { add, has, ready } = useCart();
  const unit = pkg.pricing_mode === 'orcamento' ? null : effectivePrice(pkg.price, pkg.promo_price);
  const inCart = ready && has(pkg.slug);
  const isQuote = unit === null;

  if (inCart && !pkg.allow_quantity) {
    return (
      <Link to="/carrinho" className={`btn ${full ? 'btn-block' : ''}`}>
        <IconCheck /> No carrinho — revisar
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`btn ${isQuote ? 'btn-grad' : 'btn-primary'} ${full ? 'btn-block' : ''}`}
      onClick={() =>
        add({
          slug: pkg.slug,
          name: pkg.name,
          category: pkg.category,
          unitPrice: unit,
          pricingMode: isQuote ? 'orcamento' : 'fixo',
          allowQuantity: pkg.allow_quantity && !isQuote,
          maxQuantity: pkg.allow_quantity && !isQuote ? pkg.max_quantity : 1,
          needsAdBudget: pkg.needs_ad_budget,
        })
      }
    >
      <IconCart />
      {isQuote ? 'Solicitar orçamento' : inCart ? 'Adicionar mais um' : 'Adicionar ao carrinho'}
    </button>
  );
}
