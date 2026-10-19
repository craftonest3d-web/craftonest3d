/**
 * CRAFTONEST3D – Cart Context
 * Supports multiple items, each with their own customization details.
 * Final order sent as one WhatsApp message.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Product, OrderItem } from '../types';
import { createOrder } from '../services/orderService';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;           // unique cart item ID
  product: Product;
  quantity: number;
  customizations: Record<string, string>; // { 'Your Name': 'Emma', 'Size': '4cm', ... }
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity: number; customizations: Record<string, string> }
  | { type: 'REMOVE'; cartId: string }
  | { type: 'INC'; cartId: string }
  | { type: 'DEC'; cartId: string }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_DRAWER' };

interface CartContextValue {
  items:            CartItem[];
  isOpen:           boolean;
  totalItems:       number;
  addToCart:        (product: Product, quantity: number, customizations: Record<string, string>) => void;
  removeFromCart:   (cartId: string) => void;
  increment:        (cartId: string) => void;
  decrement:        (cartId: string) => void;
  clearCart:        () => void;
  toggleCart:       () => void;
  openCart:         () => void;
  orderOnWhatsApp:  (whatsappNumber: string, codAvailable?: boolean) => void;
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          {
            id: `${action.product.id}-${Date.now()}`,
            product: action.product,
            quantity: action.quantity,
            customizations: action.customizations,
          },
        ],
      };
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.cartId) };
    case 'INC':
      return { ...state, items: state.items.map((i) => i.id === action.cartId ? { ...i, quantity: i.quantity + 1 } : i) };
    case 'DEC':
      return { ...state, items: state.items.map((i) => i.id === action.cartId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i) };
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

  const addToCart = useCallback((product: Product, quantity: number, customizations: Record<string, string>) => {
    dispatch({ type: 'ADD', product, quantity, customizations });
  }, []);

  const removeFromCart = useCallback((cartId: string) => dispatch({ type: 'REMOVE', cartId }), []);
  const increment      = useCallback((cartId: string) => dispatch({ type: 'INC', cartId }),    []);
  const decrement      = useCallback((cartId: string) => dispatch({ type: 'DEC', cartId }),    []);
  const clearCart      = useCallback(()               => dispatch({ type: 'CLEAR' }),          []);
  const toggleCart     = useCallback(()               => dispatch({ type: 'TOGGLE_DRAWER' }),  []);
  const openCart       = useCallback(()               => dispatch({ type: 'OPEN_DRAWER' }),    []);

  const orderOnWhatsApp = useCallback((whatsappNumber: string, codAvailable: boolean = false) => {
    if (state.items.length === 0) return;

    const hasFixedPrice = state.items.some(i => i.product.price > 0);
    const totalPrice    = state.items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

    const lines: string[] = [
      'Hi CRAFTONEST3D! 👋',
      '',
      'I would like to place an order:',
      '─────────────────────────',
    ];

    state.items.forEach((item, idx) => {
      lines.push(`*${idx + 1}. ${item.product.title}*`);
      Object.entries(item.customizations).forEach(([key, val]) => {
        if (val) lines.push(`   • ${key}: ${val}`);
      });
      lines.push(`   • Quantity: ${item.quantity}`);
      if (item.product.price > 0) {
        lines.push(`   • Price: ₹${item.product.price} × ${item.quantity} = ₹${item.product.price * item.quantity}`);
      } else {
        lines.push(`   • Price: Please quote`);
      }
      lines.push('');
    });

    lines.push('─────────────────────────');

    if (hasFixedPrice && totalPrice > 0) {
      lines.push(`*Total: ₹${totalPrice}* (+ courier charges)`);
    } else {
      lines.push(`*Total items: ${totalItems}*`);
      lines.push('*Please confirm total price.*');
    }

    lines.push('');
    lines.push('📦 *Shipping Details Required:*');
    lines.push('Please reply with:');
    lines.push('• Full Name:');
    lines.push('• Phone Number:');
    lines.push('• Full Address (Door No, Street, Area):');
    lines.push('• City & State:');
    lines.push('• PIN Code:');
    lines.push('');
    lines.push('💳 *Payment Options:*');
    lines.push('• UPI — GPay / PhonePe / Paytm');
    if (codAvailable) {
      lines.push('• Cash on Delivery (COD) for select items');
    } else {
      lines.push('• *No Cash on Delivery*');
    }
    lines.push('');
    lines.push('ℹ️ Custom/personalized items require advance payment before printing.');
    lines.push('');
    lines.push('🔒 Your address is only used for delivery and kept confidential.');
    lines.push('');
    lines.push('Kindly confirm the order and share the above details. Thank you! 🙏');

    // Save order to history (admin-only) — fire-and-forget, never blocks WhatsApp.
    const orderItems: OrderItem[] = state.items.map((item) => ({
      title:     item.product.title,
      quantity:  item.quantity,
      unitPrice: item.product.price,
      lineTotal: item.product.price * item.quantity,
      options:   { ...item.customizations },
    }));
    const customerName =
      state.items.map((i) => i.customizations['Name / Text'] || i.customizations['Name'] || '').find(Boolean) ?? '';
    void createOrder({ customerName, items: orderItems, source: 'cart' });

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer',
    );
  }, [state.items, totalItems]);

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      totalItems,
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
