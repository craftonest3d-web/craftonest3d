/**
 * CRAFTONEST3D – Shop Page
 * Product grid + full customizer modal with:
 *  - Name text input (live preview label)
 *  - Font style selector (visual buttons)
 *  - Size selector (pill buttons)
 *  - Colour selector (colour swatches)
 *  - Quantity stepper
 *  - WhatsApp order button
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FiX, FiCheck, FiShoppingBag, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { Product, Category } from '../../types';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { DEFAULT_SETTINGS } from '../../services/settingsService';
import { useCart } from '../../contexts/CartContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { createOrder } from '../../services/orderService';

const WA = DEFAULT_SETTINGS.whatsappNumber;

// ── Font options ───────────────────────────────────────────────────────────
const FONTS = [
  { id: 'bubble',  label: 'Bubble',  style: { fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 900 } },
  { id: 'bold',    label: 'Bold',    style: { fontFamily: 'Impact, Arial, sans-serif', fontWeight: 900, fontStyle: 'italic' } },
  { id: 'cursive', label: 'Cursive', style: { fontFamily: 'Comic Sans MS, cursive', fontWeight: 700 } },
  { id: 'clean',   label: 'Clean',   style: { fontFamily: 'Trebuchet MS, Arial, sans-serif', fontWeight: 700 } },
  { id: 'fun',     label: 'Fun',     style: { fontFamily: 'Verdana, sans-serif', fontWeight: 900, letterSpacing: 2 } },
];

// ── Colour swatches (fallback if admin hasn't set a list) ───────────────────
const DEFAULT_COLOURS = [
  { id: 'pink',     label: 'Pink',     hex: '#FF6B9D' },
  { id: 'blue',     label: 'Blue',     hex: '#4A90E2' },
  { id: 'purple',   label: 'Purple',   hex: '#9B59B6' },
  { id: 'green',    label: 'Green',    hex: '#2ECC71' },
  { id: 'yellow',   label: 'Yellow',   hex: '#F1C40F' },
  { id: 'red',      label: 'Red',      hex: '#E74C3C' },
  { id: 'orange',   label: 'Orange',   hex: '#E67E22' },
  { id: 'white',    label: 'White',    hex: '#FFFFFF' },
  { id: 'black',    label: 'Black',    hex: '#2C2C2C' },
  { id: 'gold',     label: 'Gold',     hex: '#D4AF37' },
  { id: 'skyblue',  label: 'Sky Blue', hex: '#87CEEB' },
  { id: 'lavender', label: 'Lavender', hex: '#C39BD3' },
];

// ── Sizes ──────────────────────────────────────────────────────────────────
const PENCIL_SIZES  = ['3cm', '4cm', '5cm', '6cm'];

// Convert a YouTube watch/share URL to an embeddable URL; returns '' if not YouTube.
function toYouTubeEmbed(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : '';
}
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}
// Get a YouTube video id (for thumbnail), '' if not YouTube.
function youTubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? m[1] : '';
}
const KEYCHAIN_SIZES = ['4cm', '5cm', '6cm', '7cm', '8cm'];

// ══════════════════════════════════════════════════════════════════════════
// CUSTOMIZER MODAL
// ══════════════════════════════════════════════════════════════════════════
const CustomizerModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const isPencilTopper = product.category === 'pencil-toppers';
  const sizes = isPencilTopper ? PENCIL_SIZES : KEYCHAIN_SIZES;
  const modalSettings = useSiteSettings();
  const codAvailable = modalSettings.codAvailable ?? false;
  // Colours come from admin settings; fall back to the built-in list.
  const COLOURS = (modalSettings.shopColours && modalSettings.shopColours.length > 0)
    ? modalSettings.shopColours.map((c, i) => ({ id: `c${i}`, label: c.label, hex: c.hex }))
    : DEFAULT_COLOURS;

  // Available sizes come from sizePrices keys if set, else from category defaults
  const sizePriceMap = product.sizePrices ?? {};
  const sizeOrigMap  = product.sizeOriginalPrices ?? {};
  // Show the size selector ONLY when the owner configured size-based pricing.
  // Otherwise there are no sizes to choose and the selector is hidden.
  const hasSizes = Object.keys(sizePriceMap).length > 0;
  const dynamicSizes = hasSizes ? Object.keys(sizePriceMap) : sizes;

  // Bulk flag: use the explicit admin toggle when set; otherwise fall back to
  // text detection for older products that predate the flag.
  const t = (product.title + ' ' + product.description).toLowerCase();
  const isBulk = typeof product.isBulk === 'boolean'
    ? product.isBulk
    : /bulk|pack|set of|batch|\d+\s*pcs|\d+\s*pieces|wholesale/.test(t);

  // Personalized? Explicit toggle wins; else fall back to category (old products).
  const isCustom = typeof product.isCustomizable === 'boolean'
    ? product.isCustomizable
    : (product.category === 'pencil-toppers' || product.category === 'keychains');
  // Colour picker: only for customizable products, and only when colour is enabled
  // (default ON for custom products unless the owner turned it off).
  const showColours = isCustom && (product.colourEnabled !== false);

  const gallery = [product.image, ...((product.images ?? []).filter(Boolean))].filter(Boolean);
  const [activeImg, setActiveImg] = useState(product.image);
  const [name,     setName]     = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [font,     setFont]     = useState(FONTS[0]);
  const [colour,   setColour]   = useState(COLOURS[0]);
  const [size,     setSize]     = useState(hasSizes ? dynamicSizes[0] : '');
  const [qty,      setQty]      = useState(isBulk ? 25 : 1);

  // Price for the currently selected size (falls back to product.price)
  const unitPrice = sizePriceMap[size] ?? product.price;
  const unitOriginal = sizeOrigMap[size] ?? product.originalPrice;
  const lineTotal = unitPrice * qty;
  const discount = unitOriginal > unitPrice && unitOriginal > 0
    ? Math.round(((unitOriginal - unitPrice) / unitOriginal) * 100)
    : 0;

  // Live preview — for bulk, show first name from the list
  const firstName = name.trim().split(/[\n,]/)[0]?.trim();
  const previewText = firstName || 'Your Name';

  const buildWAMessage = () => {
    const lines = [
      `Hi CRAFTONEST3D! 👋`,
      ``,
      `I'd like to order:`,
      `*${product.title}*`,
      ``,
      isCustom
        ? (isBulk
            ? `📝 Names List: ${name.trim() || '(not entered)'}`
            : `📝 Name/Text: ${name.trim() || '(not entered)'}`)
        : '',
      isCustom ? `🔤 Font Style: ${font.label}` : '',
      hasSizes ? `📏 Size: ${size}` : '',
      showColours ? `🎨 Colour: ${colour.label} (${colour.hex})` : '',
      isBulk
        ? `🔢 Quantity needed: (please tell us how many pieces)`
        : `🔢 Quantity: ${qty}`,
      isBulk
        ? `💰 Please share your best bulk/wholesale price for this quantity.`
        : unitPrice > 0
          ? (discount > 0
              ? `💰 Price: ₹${unitPrice} (${discount}% off ₹${unitOriginal}) × ${qty} = ₹${lineTotal} (+ courier)`
              : `💰 Price: ₹${unitPrice} × ${qty} = ₹${lineTotal} (+ courier charges)`)
          : `💰 Price: Please quote`,
      ``,
      `📦 *Shipping Details Required:*`,
      `Please reply with:`,
      `• Full Name:`,
      `• Phone Number:`,
      `• Full Address (Door No, Street, Area):`,
      `• City & State:`,
      `• PIN Code:`,
      ``,
      `� *Payment Options:*`,
      `• UPI — GPay / PhonePe / Paytm`,
      codAvailable ? `• Cash on Delivery (COD) available` : `• *No Cash on Delivery*`,
      ``,
      `ℹ️ Custom/personalized items require advance payment before printing.`,
      ``,
      `�🔒 Your address is only used for delivery and kept confidential.`,
      ``,
      `Kindly confirm and share the above details. Thank you! 🙏`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  // Non-customizable products can order without entering a name.
  const canOrder = isCustom ? name.trim().length > 0 : true;
  const { addToCart } = useCart();

  // Save a single-item order to admin history (fire-and-forget).
  // Not called for bulk — bulk is enquiry-only, no fixed order.
  const saveSingleOrder = () => {
    if (!canOrder || isBulk) return;
    void createOrder({
      customerName: name.trim(),
      source: 'single',
      items: [{
        title: product.title,
        quantity: qty,
        unitPrice: unitPrice,
        lineTotal: unitPrice * qty,
        options: {
          ...(isCustom ? { 'Name / Text': name.trim(), Font: font.label } : {}),
          ...(showColours ? { Colour: colour.label } : {}),
          ...(hasSizes ? { Size: size } : {}),
        },
      }],
    });
  };

  const handleAddToCart = () => {
    if (!canOrder) return;
    const customizations: Record<string, string> = {
      ...(isCustom ? { 'Name / Text': name, 'Font': font.label } : {}),
      ...(showColours ? { Colour: colour.label } : {}),
      ...(hasSizes ? { Size: size } : {}),
    };
    // Pass the product with the price matching the selected size
    const productWithPrice = { ...product, price: unitPrice, originalPrice: unitOriginal, size };
    addToCart(productWithPrice, qty, customizations);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.82)',
        zIndex: 3000,
        backdropFilter: 'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 3001,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(780px, 96vw)',
        maxHeight: '92vh',
        overflowY: 'auto',
        backgroundColor: '#111111',
        border: '1px solid #2a2a2a',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1f1f1f',
          position: 'sticky', top: 0,
          backgroundColor: '#111111', zIndex: 1,
          borderRadius: '20px 20px 0 0',
        }}>
          <div>
            <p style={{ color: '#d4af37', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
              ✏️ Customize Your Order
            </p>
            <h4 style={{ color: '#fff', fontWeight: 900, margin: '2px 0 0', fontSize: '1.15rem' }}>
              {product.title}
            </h4>
          </div>
          <button onClick={onClose} style={{
            background: '#1f1f1f', border: '1px solid #2a2a2a',
            color: '#888', cursor: 'pointer',
            width: 36, height: 36, borderRadius: '50%',
            fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ×
          </button>
        </div>

        {/* Body — 2 columns on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'min(260px, 40%) 1fr', gap: 0 }}>

          {/* LEFT — Image + Live Preview */}
          <div style={{
            padding: '1.5rem',
            borderRight: '1px solid #1f1f1f',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            {/* Product image */}
            <div style={{
              width: '100%', aspectRatio: '1',
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid #2a2a2a',
              backgroundColor: '#1a1a1a',
            }}>
              <img src={activeImg || product.image} alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Gallery thumbnails (if extra images exist) */}
            {gallery.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(img)}
                    style={{
                      width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                      border: (activeImg || product.image) === img ? '2px solid #d4af37' : '1px solid #2a2a2a',
                      padding: 0, cursor: 'pointer', background: '#1a1a1a', flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Sample video — small thumbnail, expands to full screen on click */}
            {product.videoEnabled && product.videoUrl?.trim() && (
              <div
                onClick={() => setShowVideo(true)}
                style={{
                  width: '100%', aspectRatio: '16/9', position: 'relative',
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid #2a2a2a', backgroundColor: '#000',
                }}
                title="Click to play sample video"
              >
                {/* Thumbnail: YouTube poster, else the product image */}
                <img
                  src={youTubeId(product.videoUrl) ? `https://img.youtube.com/vi/${youTubeId(product.videoUrl)}/hqdefault.jpg` : product.image}
                  alt="Sample video"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
                />
                {/* Play overlay */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    backgroundColor: 'rgba(212,175,55,0.95)', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}>▶</div>
                </div>
                <span style={{
                  position: 'absolute', bottom: 6, left: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                }}>🎬 Sample</span>
              </div>
            )}

            {/* Full-screen video lightbox */}
            {showVideo && product.videoUrl?.trim() && (
              <div
                onClick={() => setShowVideo(false)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 4100,
                  backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}
              >
                <button
                  onClick={() => setShowVideo(false)}
                  aria-label="Close video"
                  style={{
                    position: 'absolute', top: 18, right: 18, width: 42, height: 42, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff', fontSize: '1.3rem', cursor: 'pointer', zIndex: 2,
                  }}
                >×</button>
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 'min(900px, 94vw)', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                >
                  {toYouTubeEmbed(product.videoUrl) ? (
                    <iframe
                      src={toYouTubeEmbed(product.videoUrl) + '?autoplay=1'}
                      title="Sample video"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  ) : isDirectVideo(product.videoUrl) ? (
                    <video src={product.videoUrl} controls autoPlay style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <a href={product.videoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textDecoration: 'none', fontWeight: 700 }}>
                      ▶ Open video in new tab
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Live name preview — personalized items only */}
            {isCustom && (
            <>
            <div style={{
              width: '100%',
              backgroundColor: colour.hex === '#FFFFFF' ? '#1a1a1a' : '#f5f5f5',
              borderRadius: 12, padding: '1rem',
              textAlign: 'center',
              border: `2px solid ${colour.hex}`,
              minHeight: 72,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                ...font.style,
                fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                color: colour.hex,
                textShadow: colour.hex === '#FFFFFF' ? '0 0 8px rgba(255,255,255,0.5)' : '2px 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}>
                {previewText}
              </span>
            </div>

            <p style={{ color: '#555', fontSize: '0.7rem', textAlign: 'center', margin: 0 }}>
              Live preview (approximate)
            </p>
            </>
            )}

            {/* Price box — single items only. Bulk is enquiry/call, no price shown. */}
            {isBulk ? (
              <div style={{
                width: '100%', backgroundColor: '#1a1a1a',
                borderRadius: 10, padding: '12px 14px',
                border: '1px solid #d4af37',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                <span style={{ color: '#d4af37', fontWeight: 800, fontSize: '0.82rem' }}>
                  Bulk order — call or message us for special offers
                </span>
              </div>
            ) : unitPrice > 0 && (
              <div style={{
                width: '100%', backgroundColor: '#1a1a1a',
                borderRadius: 10, padding: '12px 14px',
                border: '1px solid #2a2a2a',
              }}>
                {/* Unit price with MRP + discount */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ color: '#d4af37', fontWeight: 900, fontSize: '1.1rem' }}>₹{unitPrice}</span>
                  <span style={{ color: '#888', fontSize: '0.78rem' }}>per piece</span>
                  {discount > 0 && (
                    <>
                      <span style={{ color: '#666', textDecoration: 'line-through', fontSize: '0.85rem' }}>₹{unitOriginal}</span>
                      <span style={{ backgroundColor: '#2e7d32', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4 }}>
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {/* Explicit multiplication so the total is never confusing */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2a2a2a', paddingTop: 6 }}>
                  <span style={{ color: '#888', fontSize: '0.82rem' }}>
                    ₹{unitPrice} × {qty} pc{qty > 1 ? 's' : ''}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem' }}>₹{lineTotal}</span>
                </div>
                <p style={{ color: '#666', fontSize: '0.68rem', margin: '6px 0 0', textAlign: 'right' }}>
                  + courier charges · final total confirmed on WhatsApp
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Customization options */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Name input — personalized items only */}
            {isCustom && (
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
                {isBulk ? '📝 All Names (one per line or comma separated)' : '📝 Your Name / Text'}
                <span style={{ color: '#d4af37', marginLeft: 4 }}>*</span>
              </label>
              {isBulk ? (
                <textarea
                  rows={4}
                  placeholder={`Enter each name:\nEmma\nNoah\nPriya\nLucas…`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    border: `2px solid ${name ? '#d4af37' : '#2a2a2a'}`,
                    borderRadius: 10,
                    color: '#fff', fontSize: '0.95rem', fontWeight: 600,
                    padding: '11px 14px', outline: 'none',
                    transition: 'border-color 0.2s', resize: 'vertical',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#d4af37')}
                  onBlur={e => (e.currentTarget.style.borderColor = name ? '#d4af37' : '#2a2a2a')}
                />
              ) : (
                <input
                  type="text"
                  maxLength={16}
                  placeholder="e.g. Arjun, Emma, CRAFTO…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    border: `2px solid ${name ? '#d4af37' : '#2a2a2a'}`,
                    borderRadius: 10,
                    color: '#fff', fontSize: '1rem', fontWeight: 700,
                    padding: '11px 14px', outline: 'none',
                    transition: 'border-color 0.2s',
                    letterSpacing: 1,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#d4af37')}
                  onBlur={e => (e.currentTarget.style.borderColor = name ? '#d4af37' : '#2a2a2a')}
                />
              )}
              <p style={{ color: '#555', fontSize: '0.72rem', margin: '4px 0 0', textAlign: 'right' }}>
                {isBulk ? `${qty} pcs — list all names you want printed` : `${name.length}/16 characters`}
              </p>
            </div>
            )}

            {/* Font style — personalized items only */}
            {isCustom && (
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
                🔤 Font Style
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FONTS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: font.id === f.id ? '2px solid #d4af37' : '1.5px solid #2a2a2a',
                      backgroundColor: font.id === f.id ? 'rgba(212,175,55,0.12)' : '#1a1a1a',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{
                      ...f.style,
                      fontSize: '1rem',
                      color: font.id === f.id ? '#d4af37' : '#ccc',
                    }}>
                      Aa
                    </span>
                    <span style={{ fontSize: '0.75rem', color: font.id === f.id ? '#d4af37' : '#888', fontWeight: 600 }}>
                      {f.label}
                    </span>
                    {font.id === f.id && <FiCheck size={12} style={{ color: '#d4af37' }} />}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Size — only when the owner configured size-based pricing */}
            {hasSizes && (
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
                📏 Size
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {dynamicSizes.map(s => {
                  const sp = sizePriceMap[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: sp ? '6px 16px' : '8px 18px',
                        borderRadius: 12,
                        border: size === s ? 'none' : '1.5px solid #2a2a2a',
                        backgroundColor: size === s ? '#d4af37' : '#1a1a1a',
                        color: size === s ? '#000' : '#888',
                        fontWeight: 700, fontSize: '0.875rem',
                        cursor: 'pointer', transition: 'all 0.15s',
                        lineHeight: 1.3,
                      }}
                    >
                      <span>{s}</span>
                      {sp ? <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>₹{sp}</span> : null}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: '#555', fontSize: '0.72rem', margin: '4px 0 0' }}>
                {isPencilTopper ? 'Standard pencil hole size' : 'Total length'} · price varies by size
              </p>
            </div>
            )}

            {/* Colour — personalized items with colour enabled */}
            {showColours && (
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
                🎨 Colour —{' '}
                <span style={{ color: '#d4af37', fontWeight: 600 }}>{colour.label}</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {COLOURS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColour(c)}
                    title={c.label}
                    style={{
                      width: 34, height: 34,
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: colour.id === c.id
                        ? '3px solid #d4af37'
                        : c.hex === '#FFFFFF' ? '2px solid #444' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.15s',
                      transform: colour.id === c.id ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: colour.id === c.id ? `0 0 0 2px rgba(212,175,55,0.4)` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {colour.id === c.id && (
                      <FiCheck size={14} style={{ color: c.hex === '#FFFFFF' || c.hex === '#F1C40F' || c.hex === '#D4AF37' ? '#000' : '#fff' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Quantity */}
            {/* Quantity — single items only. Bulk quantity is agreed on the call/chat. */}
            {!isBulk && (
              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
                  🔢 Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '1.5px solid #2a2a2a', borderRadius: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ background: '#1a1a1a', border: 'none', color: '#fff', width: 44, height: 44, fontSize: '1.3rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                  >
                    −
                  </button>
                  <span style={{ backgroundColor: '#111', color: '#fff', fontWeight: 800, width: 52, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(100, q + 1))}
                    style={{ background: '#1a1a1a', border: 'none', color: '#fff', width: 44, height: 44, fontSize: '1.3rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                  >
                    +
                  </button>
                </div>
                {qty >= 10 && (
                  <p style={{ color: '#d4af37', fontSize: '0.72rem', margin: '4px 0 0', fontWeight: 600 }}>
                    🎉 Ordering 10+? Ask us for a bulk discount.
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            {isBulk ? (
              /* BULK → call or message us (quoted manually, no cart) */
              <>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', margin: '4px 0 2px', textAlign: 'center' }}>
                  📦 Bulk order — call or message us
                </p>
                <p style={{ color: '#d4af37', fontSize: '0.76rem', margin: '0 0 10px', textAlign: 'center', fontWeight: 600 }}>
                  🎉 Special bulk offers &amp; discounts on larger quantities
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                  {/* Call */}
                  <a
                    className="c3d-btn c3d-btn--gold"
                    href={`tel:+${WA}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: '#d4af37', color: '#000',
                      borderRadius: 12, height: 52,
                      fontWeight: 800, fontSize: '0.92rem', textDecoration: 'none',
                    }}
                  >
                    <FiPhone size={18} />
                    📞 Call Now
                  </a>
                  {/* Message on WhatsApp */}
                  <a
                    className={`c3d-btn ${canOrder ? 'c3d-btn--wa' : 'c3d-btn--disabled'}`}
                    href={canOrder ? `https://wa.me/${WA}?text=${encodeURIComponent(buildWAMessage())}` : '#'}
                    target={canOrder ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={e => { if (!canOrder) e.preventDefault(); }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: canOrder ? '#25D366' : '#1f1f1f',
                      color: canOrder ? '#fff' : '#444',
                      borderRadius: 12, height: 52,
                      fontWeight: 800, fontSize: '0.92rem', textDecoration: 'none',
                      border: canOrder ? 'none' : '1px solid #2a2a2a',
                    }}
                  >
                    <FaWhatsapp size={18} />
                    💬 Chat Now
                  </a>
                </div>
                <p style={{ textAlign: 'center', color: '#777', fontSize: '0.72rem', margin: '8px 0 0' }}>
                  {canOrder
                    ? '📦 Bulk orders are quoted individually — tell us the quantity and we confirm the best price &amp; delivery.'
                    : '⬆️ Add your names list above, then message us'}
                </p>
              </>
            ) : (
              /* SINGLE ITEM → cart + direct order */
              <>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {/* Add to Cart */}
                  <button
                    className={`c3d-btn ${canOrder ? 'c3d-btn--gold' : 'c3d-btn--disabled'}`}
                    onClick={handleAddToCart}
                    disabled={!canOrder}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: canOrder ? '#d4af37' : '#1f1f1f',
                      color: canOrder ? '#000' : '#444',
                      border: 'none', borderRadius: 12, height: 50,
                      fontWeight: 800, fontSize: '0.9rem',
                    }}
                  >
                    <FiShoppingBag size={18} />
                    🛒 Add to Cart
                  </button>

                  {/* Order directly on WhatsApp */}
                  <a
                    className={`c3d-btn ${canOrder ? 'c3d-btn--wa' : 'c3d-btn--disabled'}`}
                    href={canOrder ? `https://wa.me/${WA}?text=${encodeURIComponent(buildWAMessage())}` : '#'}
                    target={canOrder ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={e => { if (!canOrder) { e.preventDefault(); return; } saveSingleOrder(); }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: canOrder ? '#25D366' : '#1f1f1f',
                      color: canOrder ? '#fff' : '#444',
                      borderRadius: 12, height: 50,
                      fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
                      border: canOrder ? 'none' : '1px solid #2a2a2a',
                    }}
                  >
                    <FaWhatsapp size={18} />
                    ⚡ Order Now
                  </a>
                </div>

                {!canOrder && (
                  <p style={{ textAlign: 'center', color: '#555', fontSize: '0.75rem', margin: '6px 0 0' }}>
                    ⬆️ Enter your name above to enable ordering
                  </p>
                )}
                <p style={{ textAlign: 'center', color: '#333', fontSize: '0.7rem', margin: '4px 0 0' }}>
                  <strong style={{ color: '#d4af37' }}>Add to Cart</strong> to order multiple products · <strong style={{ color: '#25D366' }}>Order Now</strong> for this item only
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD
// ══════════════════════════════════════════════════════════════════════════
const ProductCard: React.FC<{ product: Product; onCustomize: (p: Product) => void }> = ({ product, onCustomize }) => {
  const [hovered, setHovered] = useState(false);
  // Respect the explicit admin toggle; fall back to category for older products.
  const isCustomizable = typeof product.isCustomizable === 'boolean'
    ? product.isCustomizable
    : ((product.customOptions?.length ?? 0) > 0 ||
       product.category === 'pencil-toppers' || product.category === 'keychains');

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#161616',
        border: `1px solid ${hovered ? '#d4af37' : '#252525'}`,
        borderRadius: 14, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '100%',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '85%', backgroundColor: '#111', overflow: 'hidden' }}>
        {product.image
          ? <img src={product.image} alt={product.title} loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.07)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🖨️</div>
        }
        {/* Badge */}
        {product.badge && (
          <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#d4af37', color: '#000', fontSize: '0.62rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
            {product.badge}
          </span>
        )}
        {/* Customizable badge */}
        {isCustomizable && (
          <span style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.75)', color: '#d4af37', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(4px)' }}>
            ✏️ Add Your Name
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 5 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {product.categoryLabel}
        </span>
        <h6 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.4 }}>
          {product.title}
        </h6>
        <p style={{ fontSize: '0.78rem', color: '#999', lineHeight: 1.5, margin: 0, flexGrow: 1 }}>
          {product.description.length > 70 ? product.description.slice(0, 70) + '…' : product.description}
        </p>

        {/* Material / size */}
        {(product.material || product.size) && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {product.material && <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: '#1f1f1f', color: '#666', border: '1px solid #252525' }}>{product.material}</span>}
            {product.size && <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: '#1f1f1f', color: '#666', border: '1px solid #252525' }}>{product.size}</span>}
          </div>
        )}

        {/* Price */}
        {(() => {
          const sp = product.sizePrices ?? {};
          const sizePriceValues = Object.values(sp).filter(v => v > 0);
          const hasSizePricing = sizePriceValues.length > 0;
          const lowestPrice = hasSizePricing ? Math.min(...sizePriceValues) : product.price;
          // find original for the lowest-price size
          const op = product.sizeOriginalPrices ?? {};
          const lowestSizeKey = hasSizePricing ? Object.keys(sp).find(k => sp[k] === lowestPrice) : undefined;
          const lowestOriginal = lowestSizeKey ? (op[lowestSizeKey] ?? 0) : product.originalPrice;

          if (lowestPrice > 0) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                {hasSizePricing && <span style={{ fontSize: '0.7rem', color: '#777' }}>from</span>}
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d4af37' }}>₹{lowestPrice}</span>
                {lowestOriginal > lowestPrice && (
                  <>
                    <span style={{ fontSize: '0.78rem', color: '#444', textDecoration: 'line-through' }}>₹{lowestOriginal}</span>
                    <span style={{ backgroundColor: '#2e7d32', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                      {Math.round(((lowestOriginal - lowestPrice) / lowestOriginal) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            );
          }
          return <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d4af37' }}>Custom Quote</span>;
        })()}

        {/* CTA Button */}
        <button
          className="c3d-btn c3d-btn--gold"
          onClick={() => onCustomize(product)}
          style={{
            marginTop: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: '#d4af37', color: '#000',
            padding: '11px 0', borderRadius: 9,
            fontWeight: 800, fontSize: '0.875rem',
            border: 'none', cursor: 'pointer', width: '100%',
          }}
        >
          {isCustomizable ? '✨ Customize & Order' : '🛒 Order on WhatsApp'}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SHOP PAGE
// ══════════════════════════════════════════════════════════════════════════
export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts]   = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState(searchParams.get('search') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? 'all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const settings = useSiteSettings();
  const codAvailable = settings.codAvailable ?? false;
  const emptyCategoryText = settings.emptyCategoryText
    || '✨ New designs are on the way! Check back soon or message us for custom requests.';

  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()]).then(([prods, cats]) => {
      setAllProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const p: Record<string, string> = {};
    if (search) p['search'] = search;
    if (activeCategory !== 'all') p['category'] = activeCategory;
    setSearchParams(p, { replace: true });
  }, [search, activeCategory, setSearchParams]);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setActiveCategory(searchParams.get('category') ?? 'all');
  }, [searchParams]);

  const clearSearch = useCallback(() => setSearch(''), []);

  const filtered = useMemo(() => {
    let r = [...allProducts];
    if (activeCategory !== 'all') r = r.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q));
    }
    return r;
  }, [allProducts, activeCategory, search]);

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }}>

      {/* Customizer Modal */}
      {modalProduct && <CustomizerModal product={modalProduct} onClose={() => setModalProduct(null)} />}

      <Container style={{ padding: '1.5rem 1rem 4rem' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: '1.25rem' }}>
          {[{ slug: 'all', name: 'All' }, ...categories.filter(c => c.slug !== 'all')].map(cat => {
            const active = activeCategory === cat.slug;
            return (
              <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} style={{
                padding: '6px 15px', borderRadius: 50, fontSize: '0.82rem',
                fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                backgroundColor: active ? '#d4af37' : '#161616',
                color: active ? '#000' : '#888',
                border: active ? 'none' : '1px solid #252525',
              }}>
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Count row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 6 }}>
          <p style={{ color: '#555', fontSize: '0.82rem', margin: 0 }}>
            {loading ? 'Loading…' : <><span style={{ color: '#d4af37', fontWeight: 700 }}>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}</>}
          </p>
          {(search || activeCategory !== 'all') && (
            <button onClick={() => { clearSearch(); setActiveCategory('all'); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#161616', border: '1px solid #252525', borderRadius: 20, padding: '4px 11px', color: '#777', fontSize: '0.78rem', cursor: 'pointer' }}>
              <FiX size={11} /> Clear
            </button>
          )}
        </div>

        {/* Courier + Payment info */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 10, padding: '12px 16px',
          marginBottom: '1rem',
        }}>
          {/* Row 1: courier info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>🚚</span>
              <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 600 }}>
                <span style={{ color: '#d4af37' }}>Courier:</span> TN ₹70 · Other states vary
              </span>
            </div>
            {codAvailable && (
              <>
                <span style={{ color: '#333' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1rem' }}>💵</span>
                  <span style={{ fontSize: '0.8rem', color: '#2ECC71', fontWeight: 700 }}>COD Available</span>
                </div>
              </>
            )}
            <span style={{ fontSize: '0.76rem', color: '#777' }}>
              Confirmed on WhatsApp before dispatch
            </span>
          </div>
          {/* Row 2: payment badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', color: '#888', fontWeight: 600 }}>We accept:</span>
            {[
              { label: 'UPI',     bg: '#097939', show: true },
              { label: 'GPay',    bg: '#1a1a1a', show: true },
              { label: 'PhonePe', bg: '#5f259f', show: true },
              { label: 'Paytm',   bg: '#00baf2', show: true },
              { label: 'COD',     bg: '#2ECC71', show: codAvailable },
            ].filter(p => p.show).map(p => (
              <span key={p.label} style={{
                fontSize: '0.72rem', fontWeight: 700,
                padding: '3px 10px', borderRadius: 5,
                backgroundColor: p.bg, color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <Row className="g-3">
            {[...Array(8)].map((_, i) => (
              <Col xs={12} sm={6} md={4} lg={3} key={i}>
                <div style={{ backgroundColor: '#161616', borderRadius: 14, overflow: 'hidden', border: '1px solid #252525' }}>
                  <div style={{ paddingTop: '85%', backgroundColor: '#1f1f1f' }} />
                  <div style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ height: 10, backgroundColor: '#252525', borderRadius: 4, marginBottom: 7, width: '40%' }} />
                    <div style={{ height: 14, backgroundColor: '#222', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 36, backgroundColor: '#1f1f1f', borderRadius: 8, marginTop: 10 }} />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : filtered.length === 0 ? (
          (activeCategory !== 'all' && !search.trim()) ? (
            /* Empty CATEGORY (no products yet) → catchy coming-soon message */
            <div className="c3d-animate-up" style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: 540, margin: '0 auto' }}>
              <div className="c3d-float" style={{ fontSize: '3.4rem', marginBottom: 14 }}>🚀✨</div>
              <h5 style={{ color: '#d4af37', fontWeight: 900, marginBottom: 12, fontSize: '1.3rem' }}>Coming Soon!</h5>
              <p style={{ color: '#bbb', marginBottom: 22, fontSize: '0.92rem', lineHeight: 1.6 }}>
                {emptyCategoryText}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  className="c3d-btn c3d-btn--wa"
                  href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like a custom order / to know when new items arrive.')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#25D366', color: '#fff', borderRadius: 10, padding: '11px 22px', fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem' }}
                >
                  <FaWhatsapp size={16} /> Request on WhatsApp
                </a>
                <button onClick={() => setActiveCategory('all')} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}>
                  Browse All Items
                </button>
              </div>
            </div>
          ) : (
            /* No SEARCH results */
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <h5 style={{ color: '#fff', marginBottom: 8 }}>Nothing found</h5>
              <p style={{ color: '#666', marginBottom: 20, fontSize: '0.9rem' }}>Try a different search or browse all categories.</p>
              <button onClick={() => { clearSearch(); setActiveCategory('all'); }} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
                View All
              </button>
            </div>
          )
        ) : (
          <Row className="g-3">
            {filtered.map(product => (
              <Col xs={12} sm={6} md={4} lg={2} key={product.id}>
                <ProductCard product={product} onCustomize={setModalProduct} />
              </Col>
            ))}
          </Row>
        )}

        {/* Bottom CTA */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: '2.5rem', padding: '1.75rem', backgroundColor: '#161616', border: '1px solid #252525', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              Want something not listed here?
            </p>
            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 16 }}>
              We do fully custom 3D prints. Share your idea and we'll make it.
            </p>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi CRAFTONEST3D! I have a custom 3D print idea I'd like to discuss.")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#25D366', color: '#fff', padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
            >
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>
          </div>
        )}

      </Container>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like to enquire about a 3D print.')}`}
        target="_blank" rel="noopener noreferrer"
        className="floating-whatsapp" aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>
    </div>
  );
};

export default Products;
