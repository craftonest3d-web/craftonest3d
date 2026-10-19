/**
 * CRAFTONEST3D – Footer Component
 * Columns: Brand | Quick Links | Services | Contact | CTA
 */
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiClock } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Footer: React.FC = () => {
  const { storePhone, storeEmail, businessHours, socialLinks, whatsappNumber } = useSiteSettings();

  return (
    <footer className="footer-custom">
      <Container>
        <Row className="gy-5">

          {/* ── Column 1: Brand ──────────────────────── */}
          <Col lg={3} md={6}>
            <Link to="/" className="d-flex align-items-center text-decoration-none mb-3">
              <img src="/logo.png" alt="CRAFTONEST3D" style={{ width: 42, height: 42, borderRadius: 5, objectFit: 'cover', marginRight: 10, flexShrink: 0 }} />
              <div className="d-flex flex-column">
                <span style={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                  <span style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #cfd3da 60%, #9aa0a8 100%)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
                  }}>CRAFTONEST</span>
                  <span style={{ color: 'var(--pn-primary)' }}>3D</span>
                </span>
                <span style={{ color: 'var(--pn-text-muted)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Where Ideas Take Shape
                </span>
                <span style={{ color: 'var(--pn-primary)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '1.5px', marginTop: 2 }}>
                  CREATE • CUSTOMIZE • GIFT
                </span>
              </div>
            </Link>
            <p className="mb-4" style={{ color: 'var(--pn-text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Custom 3D printing studio turning your ideas into high-quality physical
              creations. Personalized products, miniatures, keychains, toys, models and more.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebookF size={13} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram size={13} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <FaYoutube size={14} />
                </a>
              )}
              <a href={`https://wa.me/${whatsappNumber}`} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp size={14} style={{ color: '#25D366' }} />
              </a>
            </div>
          </Col>

          {/* ── Column 2: Quick Links ─────────────────── */}
          <Col lg={3} md={6}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {[
                { to: '/',         label: 'Home' },
                { to: '/shop',     label: 'Shop' },
                { to: '/contact',  label: 'Contact' },
                { to: '/policies', label: 'Policies' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-decoration-none">{label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Column 3: What We Make ────────────────── */}
          <Col lg={3} md={6}>
            <h5>What We Make</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {[
                'Custom Name Pencil Toppers',
                'Personalized Keychains',
                'Miniatures & Figurines',
                'Toys & Models',
                'Custom 3D Prints',
                'Bulk & Event Orders',
              ].map((label) => (
                <li key={label}>
                  <Link to="/shop" className="text-decoration-none">{label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Column 4: Contact Info ────────────────── */}
          <Col lg={3} md={6}>
            <h5>Get in Touch</h5>
            <ul className="footer-contact-info">
              <li><FiPhone size={15} /><span>{storePhone}</span></li>
              <li><FiMail size={15} /><span>{storeEmail}</span></li>
              <li><FiClock size={15} /><span>{businessHours}</span></li>
            </ul>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like to get a quote for a custom 3D print.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-pink d-inline-flex align-items-center gap-2 mt-2"
              style={{ fontSize: '0.85rem' }}
            >
              <FaWhatsapp size={16} /> Get a Quote
            </a>
          </Col>

        </Row>

        <hr className="my-4" style={{ borderColor: '#222' }} />

        {/* ── Bottom Row ─────────────────────────────── */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <p className="mb-0" style={{ color: 'var(--pn-text-muted)', fontSize: '0.82rem' }}>
            &copy; {new Date().getFullYear()} CRAFTONEST3D. All Rights Reserved.
          </p>
          <p className="mb-0" style={{ color: 'var(--pn-text-muted)', fontSize: '0.82rem' }}>
            Your Idea. Our Print. —{' '}
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>WhatsApp</a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
