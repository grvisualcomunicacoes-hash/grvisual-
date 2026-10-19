import { Link } from '../router';
import { useCart } from './CartProvider';

export function CartToast() {
  const { toast, dismissToast } = useCart();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast}</span>
      <Link to="/carrinho" className="btn btn-primary btn-sm" onClick={dismissToast}>
        Ver carrinho
      </Link>
    </div>
  );
}
