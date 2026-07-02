/**
 * PaperNest – Footer Component
 * Columns: Brand | Quick Links | Customer Service | Contact | Newsletter
 */
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone, FiClock, FiSend } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP, FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const LogoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="me-2"
    style={{ color: 'var(--pn-primary)', width: '30px', height: '30px', flexShrink: 0 }}
    aria-hidden="true"
  >
    <rect x="3" y="10" width="18" height="12" rx="2" fill="var(--pn-primary)" />
    <path
      d="M12 22V10M3 10h18M7.5 4C9.5 4 12 7 12 7s2.5-3 4.5-3S19 6 17.5 7.5C16 9 12 10 12 10S8 9 6.5 7.5C5 6 5.5 4 7.5 4Z"
      fill="var(--pn-primary)"
      stroke="#ffffff"
      strokeWidth="1.5"
    />
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { storePhone, storeEmail, storeAddress, businessHours, socialLinks, whatsappNumber } = useSiteSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer-custom">
      <Container>
        <Row className="gy-5">

          {/* ── Column 1: Brand ──────────────────────── */}
          <Col lg={3} md={6}>
            <Link to="/" className="d-flex align-items-center text-decoration-none mb-3">
              <LogoIcon />
              <div className="d-flex flex-column">
                <span style={{ color: 'var(--pn-primary)', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1 }}>
                  PaperNest
                </span>
                <span style={{ color: 'var(--pn-text-muted)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Stationery &amp; Personalized Gifts
                </span>
              </div>
            </Link>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
              Your one-stop destination for premium stationery and personalized gifts.
              Make every moment special with us.
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
              {socialLinks.pinterest && (
                <a href={socialLinks.pinterest} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <FaPinterestP size={13} />
                </a>
              )}
              <a href={`https://wa.me/${whatsappNumber}`} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp size={14} style={{ color: '#25D366' }} />
              </a>
            </div>
          </Col>

          {/* ── Column 2: Quick Links ─────────────────── */}
          <Col lg={2} md={6}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {[
                { to: '/',                             label: 'Home' },
                { to: '/products',                    label: 'Shop All' },
                { to: '/products?category=gifts',     label: 'Personalized Gifts' },
                { to: '/products?category=stickers',  label: 'Stickers' },
                { to: '/products?category=prints',    label: 'Photo Prints' },
                { to: '/products?category=mugs',      label: 'Custom Mugs' },
                { to: '/products?category=notebooks', label: 'Notebooks' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-decoration-none">{label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Column 3: Customer Service ────────────── */}
          <Col lg={2} md={6}>
            <h5>Customer Service</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {[
                { to: '/about',   label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
                { href: '#faq',   label: 'FAQ' },
                { href: '#ship',  label: 'Shipping & Delivery' },
                { href: '#ret',   label: 'Returns & Refunds' },
                { href: '#terms', label: 'Terms & Conditions' },
                { href: '#priv',  label: 'Privacy Policy' },
              ].map(({ to, href, label }) =>
                to ? (
                  <li key={label}><Link to={to} className="text-decoration-none">{label}</Link></li>
                ) : (
                  <li key={label}><a href={href} className="text-decoration-none">{label}</a></li>
                )
              )}
            </ul>
          </Col>

          {/* ── Column 4: Contact Info ────────────────── */}
          <Col lg={2} md={6}>
            <h5>Contact Us</h5>
            <ul className="footer-contact-info">
              <li><FiPhone size={15} /><span>{storePhone}</span></li>
              <li><FiMail size={15} /><span>{storeEmail}</span></li>
              <li><FiMapPin size={15} /><span>{storeAddress}</span></li>
              <li><FiClock size={15} /><span>{businessHours}</span></li>
            </ul>
          </Col>

          {/* ── Column 5: Newsletter ──────────────────── */}
          <Col lg={3} md={12}>
            <h5>Stay Updated</h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              Subscribe for exclusive offers, new arrivals and gift ideas delivered to your inbox.
            </p>
            {subscribed ? (
              <div
                className="d-flex align-items-center gap-2 p-3 rounded-3"
                style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.875rem', fontWeight: 600 }}
              >
                <FiSend size={16} />
                <span>Thank you for subscribing! 🎉</span>
              </div>
            ) : (
              <Form onSubmit={handleSubscribe}>
                <div className="d-flex" style={{ borderRadius: 'var(--pn-radius-sm)', overflow: 'hidden', border: '1.5px solid #dde0e8' }}>
                  <Form.Control
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input border-0"
                    required
                    aria-label="Newsletter email"
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </div>
              </Form>
            )}
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
              No spam, unsubscribe anytime.
            </p>
          </Col>

        </Row>

        <hr className="my-4" style={{ borderColor: 'rgba(10, 17, 40, 0.08)' }} />

        {/* ── Bottom Row ─────────────────────────────── */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <p className="mb-0 text-muted" style={{ fontSize: '0.82rem' }}>
            &copy; {new Date().getFullYear()} PaperNest. All Rights Reserved. Made with ❤️ in India.
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: '0.82rem' }}>
            Order via <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>WhatsApp</a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
