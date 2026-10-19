'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PricingMode } from '@/lib/types';

export interface CartItem {
  slug: string;
  name: string;
  category: string;
  unitPrice: number | null; // referência exibida; o servidor recalcula
  pricingMode: PricingMode;
  allowQuantity: boolean;
  maxQuantity: number;
  needsAdBudget: boolean;
  quantity: number;
  notes: string;
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  estimatedTotal: number;
  hasQuoteItems: boolean;
  add: (item: Omit<CartItem, 'quantity' | 'notes'>) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  setNotes: (slug: string, notes: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  toast: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'grvisual-carrinho-v1';

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.slug === 'string' && typeof i.name === 'string')
      .slice(0, 20)
      .map((i) => ({
        ...i,
        quantity: Math.max(1, Math.min(Number(i.quantity) || 1, i.allowQuantity ? Number(i.maxQuantity) || 1 : 1)),
        notes: typeof i.notes === 'string' ? i.notes.slice(0, 500) : '',
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* navegação privada ou armazenamento cheio: o carrinho segue funcionando nesta aba */
    }
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback<CartContextValue['add']>((item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        if (!existing.allowQuantity || existing.quantity >= existing.maxQuantity) return prev;
        return prev.map((i) => (i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i));
      }
      if (prev.length >= 20) return prev;
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
    setToast(`"${item.name}" está no carrinho`);
  }, []);

  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.slug !== slug) return i;
        const max = i.allowQuantity && i.unitPrice !== null ? i.maxQuantity : 1;
        return { ...i, quantity: Math.max(1, Math.min(Math.round(quantity) || 1, max)) };
      })
    );
  }, []);

  const setNotes = useCallback((slug: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, notes: notes.slice(0, 500) } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    let total = 0;
    let quote = false;
    for (const i of items) {
      if (i.unitPrice === null || i.pricingMode === 'orcamento') quote = true;
      else total += i.unitPrice * i.quantity;
    }
    return {
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      estimatedTotal: Math.round(total * 100) / 100,
      hasQuoteItems: quote,
      add,
      remove,
      setQuantity,
      setNotes,
      clear,
      has: (slug) => items.some((i) => i.slug === slug),
      toast,
      dismissToast: () => setToast(null),
    };
  }, [items, ready, add, remove, setQuantity, setNotes, clear, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
