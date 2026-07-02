/**
 * PaperNest – Cart Context
 * WhatsApp-based cart: collect items → send one WhatsApp order message.
 * No payment, no checkout page — 100% consistent with the business model.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Product } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD';    product: Product }
  | { type: 'REMOVE'; id: string }
  | { type: 'INC';    id: string }
  | { type: 'DEC';    id: string }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_DRAWER' };

interface CartContextValue {
  items:       CartItem[];
  isOpen:      boolean;
  totalItems:  number;
  totalPrice:  number;
  addToCart:   (product: Product) => void;
  removeFromCart: (id: string) => void;
  increment:   (id: string) => void;
  decrement:   (id: string) => void;
  clearCart:   () => void;
  toggleCart:  () => void;
  openCart:    () => void;
  orderOnWhatsApp: (whatsappNumber: string) => void;
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find((i) => i.product.id === action.product.id);
      return {
        ...state,
        isOpen: true,
        items: exists
          ? state.items.map((i) =>
              i.product.id === action.product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            )
          : [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.id) };
    case 'INC':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };
    case 'DEC':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.product.id === action.id ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const addToCart   = useCallback((p: Product)  => dispatch({ type: 'ADD',    product: p }), []);
  const removeFromCart = useCallback((id: string) => dispatch({ type: 'REMOVE', id }),        []);
  const increment   = useCallback((id: string)  => dispatch({ type: 'INC',    id }),          []);
  const decrement   = useCallback((id: string)  => dispatch({ type: 'DEC',    id }),          []);
  const clearCart   = useCallback(()            => dispatch({ type: 'CLEAR'  }),               []);
  const toggleCart  = useCallback(()            => dispatch({ type: 'TOGGLE_DRAWER' }),        []);
  const openCart    = useCallback(()            => dispatch({ type: 'OPEN_DRAWER' }),          []);

  const orderOnWhatsApp = useCallback((whatsappNumber: string) => {
    if (state.items.length === 0) return;

    const lines = state.items.map(
      (i) => `• ${i.product.title} × ${i.quantity} — ₹${i.product.price * i.quantity}`,
    );
    const message = [
      'Hi PaperNest! 👋 I\'d like to place an order:',
      '',
      ...lines,
      '',
      `*Total: ₹${totalPrice}*`,
      '',
      'Please confirm availability and share payment details.',
    ].join('\n');

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }, [state.items, totalPrice]);

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      increment,
      decrement,
      clearCart,
      toggleCart,
      openCart,
      orderOnWhatsApp,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
