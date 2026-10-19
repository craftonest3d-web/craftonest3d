/**
 * CRAFTONEST3D – Policies Page
 * Cancellation, Refund, Shipping policies for custom 3D printing
 */
import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiShield, FiRefreshCcw, FiTruck, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div style={{
    backgroundColor: '#161616',
    border: '1px solid #252525',
    borderRadius: 14,
    padding: '1.5rem',
    marginBottom: '1rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#d4af37', flexShrink: 0,
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.8 }}>
      {children}
    </div>
  </div>
);

export const Policy: React.FC = () => {
  const { whatsappNumber } = useSiteSettings();
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I have a question about your policies.')}`;

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }}>
      <Container style={{ padding: '3rem 1rem 4rem', maxWidth: 800 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            Policies
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
            Cancellation, refund, shipping and payment terms for custom 3D printed orders
          </p>
          <nav aria-label="Breadcrumb" style={{ marginTop: 12 }}>
            <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.8rem' }}>
              <li className="breadcrumb-item"><Link to="/" style={{ color: '#666' }}>Home</Link></li>
              <li className="breadcrumb-item active" style={{ color: '#d4af37' }}>Policies</li>
            </ol>
          </nav>
        </div>

        {/* Payment */}
        <Section icon={<FiCreditCard size={20} />} title="Payment Policy">
          <p style={{ marginBottom: 10 }}>
            As all our products are <strong style={{ color: '#fff' }}>custom-made and personalized</strong> (your name, chosen size and colour), we follow these payment terms:
          </p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: '#fff' }}>Personalized / custom name orders:</strong> Full payment in advance via GPay / UPI / PhonePe / Paytm before production begins.</li>
            <li><strong style={{ color: '#fff' }}>Cash on Delivery (COD):</strong> Available for select non-personalized items. Courier charges apply.</li>
            <li>Payment and final total are always confirmed on WhatsApp before we start printing.</li>
          </ul>
        </Section>

        {/* Cancellation */}
        <Section icon={<FiAlertCircle size={20} />} title="Cancellation Policy">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: '#fff' }}>Before production:</strong> Orders can be cancelled free of charge if printing has not yet started.</li>
            <li><strong style={{ color: '#fff' }}>After production starts:</strong> Custom personalized items (with names/text) <strong style={{ color: '#fff' }}>cannot be cancelled</strong>, as they cannot be resold.</li>
            <li>Advance payments for personalized items are <strong style={{ color: '#fff' }}>non-refundable</strong> once printing has begun.</li>
            <li>To cancel, message us on WhatsApp as early as possible.</li>
          </ul>
        </Section>

        {/* Refund */}
        <Section icon={<FiRefreshCcw size={20} />} title="Refund & Replacement Policy">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: '#fff' }}>Damaged in transit:</strong> If your item arrives broken or damaged, send us a photo within 48 hours of delivery for a free replacement.</li>
            <li><strong style={{ color: '#fff' }}>Wrong item/spelling by us:</strong> If we made an error (wrong name, colour, size), we reprint and reship at no extra cost.</li>
            <li><strong style={{ color: '#fff' }}>Customer error:</strong> We are not responsible for spelling mistakes or wrong details provided by the customer. Please double-check your order details.</li>
            <li>Refunds (where applicable) are processed to the original payment method within 5–7 working days.</li>
          </ul>
        </Section>

        {/* Shipping */}
        <Section icon={<FiTruck size={20} />} title="Shipping & Delivery">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: '#fff' }}>Tamil Nadu:</strong> ₹70 courier charge.</li>
            <li><strong style={{ color: '#fff' }}>Other states:</strong> Shipping cost varies by location — confirmed on WhatsApp before dispatch.</li>
            <li><strong style={{ color: '#fff' }}>Production time:</strong> Custom items typically take 2–5 working days to print, plus delivery time.</li>
            <li>Tracking details (where available) are shared on WhatsApp after dispatch.</li>
          </ul>
        </Section>

        {/* Quality */}
        <Section icon={<FiShield size={20} />} title="Product & Quality">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>All products are 3D printed using quality PLA / resin materials.</li>
            <li>Slight variations in colour and finish may occur as each item is handcrafted.</li>
            <li>Product images are representative — your custom item may vary slightly in appearance.</li>
          </ul>
        </Section>

        {/* Contact CTA */}
        <div style={{
          textAlign: 'center', marginTop: '2rem', padding: '1.75rem',
          backgroundColor: '#161616', border: '1px solid #252525', borderRadius: 14,
        }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
            Questions about our policies?
          </p>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
            We're happy to help — reach out on WhatsApp anytime.
          </p>
          <a
            href={waHref} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#25D366', color: '#fff',
              padding: '11px 28px', borderRadius: 8,
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
            }}
          >
            <FaWhatsapp size={18} /> Chat on WhatsApp
          </a>
        </div>

      </Container>
    </div>
  );
};

export default Policy;
