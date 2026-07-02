/**
 * PaperNest – Cart Drawer
 * Slides in from the right. Shows cart items with qty controls.
 * "Order on WhatsApp" sends the full cart as one message.
 */
import React from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const CartDrawer: React.FC = () => {
  const {
    items, isOpen, totalItems, totalPrice,
    removeFromCart, increment, decrement, clearCart,
    toggleCart, orderOnWhatsApp,
  } = useCart();
  const { whatsappNumber } = useSiteSettings();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleCart}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            animation: 'pnFadeIn 0.2s ease both',
          }}
          aria-label="Close cart"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: 'min(400px, 100vw)',
          height: '100vh',
          backgroundColor: 'white',
          zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f1f5', flexShrink: 0 }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiShoppingBag size={20} style={{ color: 'var(--pn-primary)' }} />
            <h6 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>
              My Cart
              {totalItems > 0 && (
                <span
                  className="ms-2 px-2 py-0 rounded-pill"
                  style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--pn-primary)', color: 'white' }}
                >
                  {totalItems}
                </span>
              )}
            </h6>
          </div>
          <button
            onClick={toggleCart}
            className="btn btn-sm border-0 p-1"
            style={{ color: 'var(--pn-text-muted)', borderRadius: 8 }}
            aria-label="Close cart"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-grow-1 overflow-auto py-3 px-4">
          {items.length === 0 ? (
            <div className="text-center py-5">
              <FiShoppingBag size={48} style={{ color: '#dde0e8' }} className="mb-3" />
              <p className="fw-semibold mb-1">Your cart is empty</p>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                Add products to get started
              </p>
            </div>
          ) : (
            <>
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="d-flex gap-3 mb-3 pb-3"
                  style={{ borderBottom: '1px solid #f5f6f8' }}
                >
                  {/* Image */}
                  <img
                    src={product.image || 'https://via.placeholder.com/60'}
                    alt={product.title}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60'; }}
                  />

                  {/* Info */}
                  <div className="flex-grow-1 min-width-0">
                    <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.85rem' }}>
                      {product.title}
                    </p>
                    <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                      ₹{product.price} each
                    </p>

                    {/* Qty controls */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{ border: '1.5px solid #e8eaed', borderRadius: 8, overflow: 'hidden' }}
                      >
                        <button
                          onClick={() => decrement(product.id)}
                          className="btn btn-sm border-0 px-2"
                          style={{ borderRadius: 0, color: 'var(--pn-text-dark)' }}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="fw-bold" style={{ fontSize: '0.85rem', minWidth: 24, textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => increment(product.id)}
                          className="btn btn-sm border-0 px-2"
                          style={{ borderRadius: 0, color: 'var(--pn-text-dark)' }}
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ fontSize: '0.9rem', color: 'var(--pn-primary)' }}>
                          ₹{product.price * quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="btn btn-sm border-0 p-1"
                          style={{ color: '#c62828' }}
                          aria-label={`Remove ${product.title}`}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear */}
              <button
                onClick={clearCart}
                className="btn btn-sm border-0 w-100 mt-1"
                style={{ color: 'var(--pn-text-muted)', fontSize: '0.8rem' }}
              >
                Clear cart
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-4 py-4"
            style={{ borderTop: '1px solid #f0f1f5', flexShrink: 0, backgroundColor: '#fafbfc' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <span className="fw-bold fs-5" style={{ color: 'var(--pn-primary)' }}>
                ₹{totalPrice}
              </span>
            </div>

            <button
              onClick={() => { orderOnWhatsApp(whatsappNumber); toggleCart(); }}
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
              style={{
                backgroundColor: '#25D366', color: 'white', border: 'none',
                borderRadius: 10, height: 50, fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1fad52')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
            >
              <FaWhatsapp size={20} />
              Order on WhatsApp
            </button>

            <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
              Opens WhatsApp with your full order details
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
