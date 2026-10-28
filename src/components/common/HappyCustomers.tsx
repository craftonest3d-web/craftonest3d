/**
 * CRAFTONEST3D – Happy Customers
 * Scrolling testimonial strip (right → left). Admin-controlled on/off + reviews.
 */
import React from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HappyCustomers: React.FC = () => {
  const { reviewsEnabled, reviews } = useSiteSettings();
  if (!reviewsEnabled || !reviews || reviews.length === 0) return null;

  // Duplicate the list so the scroll loop is seamless.
  const loop = [...reviews, ...reviews];

  return (
    <section style={{ backgroundColor: '#0d0d0d', padding: '3rem 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', margin: 0 }}>TESTIMONIALS</p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#fff', margin: '6px 0 0' }}>
          Happy Customers 😊
        </h2>
      </div>

      <div className="c3d-reviews">
        <div className="c3d-reviews__track">
          {loop.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'inline-block', whiteSpace: 'normal', verticalAlign: 'top',
                width: 300, flexShrink: 0,
                backgroundColor: '#161616', border: '1px solid #262626',
                borderRadius: 16, padding: '1.25rem 1.5rem', margin: '0 2px',
              }}
            >
              <div style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: 8 }}>
                {'★'.repeat(Math.max(1, Math.min(5, r.rating || 5)))}
                <span style={{ color: '#444' }}>{'★'.repeat(5 - Math.max(1, Math.min(5, r.rating || 5)))}</span>
              </div>
              <p style={{ color: '#ddd', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 12px', minHeight: 60 }}>
                “{r.text}”
              </p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', margin: 0 }}>— {r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HappyCustomers;
