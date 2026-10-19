/**
 * CRAFTONEST3D – Cart Drawer
 * Shows all cart items with their customizations.
 * "Order All on WhatsApp" sends complete order in one message.
 */
import React from 'react';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const CartDrawer: React.FC = () => {
  const {
    items, isOpen, totalItems,
    removeFromCart, increment, decrement, clearCart,
    toggleCart, orderOnWhatsApp,
  } = useCart();
  const { whatsappNumber, codAvailable } = useSiteSettings();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleCart}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 'min(420px, 100vw)',
          height: '100vh',
          backgroundColor: '#111111',
          zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
          borderLeft: '1px solid #222',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #1f1f1f',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiShoppingBag size={20} style={{ color: '#d4af37' }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
              My Order
            </span>
            {totalItems > 0 && (
              <span style={{
                backgroundColor: '#d4af37', color: '#000',
                fontSize: '0.7rem', fontWeight: 800,
                padding: '2px 8px', borderRadius: 20,
              }}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={toggleCart}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}
            aria-label="Close cart"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <FiShoppingBag size={48} style={{ color: '#2a2a2a', marginBottom: 16 }} />
              <p style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>Your cart is empty</p>
              <p style={{ color: '#555', fontSize: '0.85rem', margin: 0 }}>
                Customize a product and add it to your order
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} style={{
                  marginBottom: '0.75rem', padding: '0.875rem',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #252525', borderRadius: 12,
                }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    {/* Image */}
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, backgroundColor: '#111' }}
                      />
                    )}
                    {/* Title + remove */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                          {item.product.title}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0 0 0 8px', flexShrink: 0 }}
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#d4af37', margin: '2px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.product.categoryLabel}
                      </p>
                    </div>
                  </div>

                  {/* Customizations */}
                  {Object.entries(item.customizations).filter(([, v]) => v).length > 0 && (
                    <div style={{
                      backgroundColor: '#111', borderRadius: 8, padding: '8px 10px',
                      marginBottom: 8, border: '1px solid #1f1f1f',
                    }}>
                      {Object.entries(item.customizations).filter(([, v]) => v).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: '0.72rem', color: '#666', fontWeight: 600 }}>{key}</span>
                          <span style={{ fontSize: '0.72rem', color: '#ccc', fontWeight: 700, maxWidth: '60%', textAlign: 'right' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => decrement(item.id)}
                        style={{ background: '#1f1f1f', border: 'none', color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem' }}
                      >−</button>
                      <span style={{ color: '#fff', fontWeight: 700, width: 36, textAlign: 'center', fontSize: '0.875rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        style={{ background: '#1f1f1f', border: 'none', color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem' }}
                      >+</button>
                    </div>
                    {item.product.price > 0 && (
                      <span style={{ color: '#d4af37', fontWeight: 800, fontSize: '0.95rem' }}>
                        ₹{item.product.price * item.quantity}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Clear all */}
              <button
                onClick={clearCart}
                style={{
                  background: 'none', border: 'none',
                  color: '#444', fontSize: '0.78rem',
                  cursor: 'pointer', width: '100%', padding: '4px 0',
                  textDecoration: 'underline',
                }}
              >
                Clear all items
              </button>
            </>
          )}
        </div>

        {/* Footer — Order button */}
        {items.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #1f1f1f',
            backgroundColor: '#0d0d0d',
            flexShrink: 0,
          }}>
        {/* Summary */}
        {(() => {
          const totalPrice = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
          const hasQuote   = items.some(i => i.product.price === 0);
          return (
            <div style={{
              backgroundColor: '#1a1a1a', borderRadius: 10,
              padding: '10px 14px', marginBottom: 12,
              border: '1px solid #252525',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#888', fontSize: '0.82rem' }}>
                  {items.length} product{items.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ccc', fontSize: '0.875rem', fontWeight: 600 }}>Total</span>
                {totalPrice > 0 ? (
                  <span style={{ color: '#d4af37', fontWeight: 900, fontSize: '1.15rem' }}>₹{totalPrice}</span>
                ) : (
                  <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.875rem' }}>Price on WhatsApp</span>
                )}
              </div>
              {hasQuote && (
                <p style={{ color: '#555', fontSize: '0.7rem', margin: '4px 0 0' }}>
                  * Custom quote — CRAFTONEST3D will confirm price on WhatsApp
                </p>
              )}
            </div>
          );
        })()}

            {/* WhatsApp order button */}
            <button
              onClick={() => { orderOnWhatsApp(whatsappNumber, codAvailable ?? false); toggleCart(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                backgroundColor: '#25D366', color: '#fff',
                border: 'none', borderRadius: 12, height: 52,
                width: '100%', fontWeight: 800, fontSize: '1rem',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1fad52')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
            >
              <FaWhatsapp size={22} />
              Order All on WhatsApp
            </button>

            <p style={{ textAlign: 'center', color: '#444', fontSize: '0.72rem', margin: '8px 0 0' }}>
              Sends your complete order with all customizations
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
