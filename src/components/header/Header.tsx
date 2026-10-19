/**
 * CRAFTONEST3D – Header
 * Simple nav: HOME | SHOP | CONTACT + GET A QUOTE
 */
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useCart } from '../../contexts/CartContext';

const LogoIcon = () => (
  <svg viewBox="0 0 32 32" className="me-2" style={{ width: 34, height: 34, flexShrink: 0 }} aria-hidden="true">
    <path d="M16 3 L28 9.5 L28 22.5 L16 29 L4 22.5 L4 9.5 Z" fill="none" stroke="var(--pn-primary)" strokeWidth="2" strokeLinejoin="round" />
    <path d="M4 9.5 L16 16 L28 9.5" fill="none" stroke="var(--pn-primary)" strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 16 L16 29" fill="none" stroke="var(--pn-primary)" strokeWidth="2" />
    <path d="M16 16 L16 3" fill="none" stroke="var(--pn-primary)" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const { whatsappNumber, announcementText, socialLinks } = useSiteSettings();
  const { totalItems, toggleCart } = useCart();
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like to get a quote for a custom 3D print.')}`;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1030, backgroundColor: '#111111', borderBottom: '1px solid #222' }}>

      {/* ── Announcement Bar (scrolling marquee) ──── */}
      {announcementText?.trim() && (
        <div className="c3d-adbar" style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1a1a1a', padding: '7px 0', fontSize: '0.8rem' }}>
          <Container>
            <div className="d-flex align-items-center gap-3">
              {/* Moving ticker — type multiple messages separated by " | " in Settings */}
              <div className="c3d-marquee">
                <span className="c3d-marquee__track" style={{ color: 'var(--pn-primary)', fontWeight: 600 }}>
                  {(() => {
                    const parts = announcementText.split('|').map((s) => s.trim()).filter(Boolean);
                    const once = parts.join('\u00A0\u00A0\u00A0✦\u00A0\u00A0\u00A0');
                    // Repeat so the loop is seamless
                    return `${once}\u00A0\u00A0\u00A0✦\u00A0\u00A0\u00A0${once}\u00A0\u00A0\u00A0✦\u00A0\u00A0\u00A0`;
                  })()}
                </span>
              </div>
              {/* Social icons stay fixed on the right */}
              <div className="d-flex align-items-center gap-3 flex-shrink-0">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#888' }}>
                    <FaFacebookF size={12} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#888' }}>
                    <FaInstagram size={12} />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ color: '#888' }}>
                    <FaYoutube size={14} />
                  </a>
                )}
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* ── Main Header ──────────────────────────── */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '12px 0' }}>
        <Container>
          <Row className="align-items-center gy-2">

            {/* Logo */}
            <Col xs={12} md={3} className="d-flex align-items-center justify-content-center justify-content-md-start">
              <Link to="/" className="d-flex align-items-center text-decoration-none">
                <LogoIcon />
                <div>
                  <span style={{ color: 'var(--pn-primary)', fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.1, letterSpacing: '-0.5px', display: 'block' }}>
                    CRAFTONEST3D
                  </span>
                  <span style={{ color: '#666', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Where Ideas Take Shape
                  </span>
                </div>
              </Link>
            </Col>

            {/* Search */}
            <Col xs={12} md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup style={{ borderRadius: 8, overflow: 'hidden', border: '1.5px solid #2a2a2a' }}>
                  <Form.Control
                    placeholder="Search keychains, pencil toppers, toys…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none px-3"
                    style={{ height: 42, fontSize: '0.875rem', backgroundColor: '#1a1a1a', color: '#fff' }}
                    aria-label="Search products"
                  />
                  <Button
                    type="submit"
                    className="border-0 px-3"
                    style={{ backgroundColor: 'var(--pn-primary)', color: '#0a0a0a', height: 42 }}
                    aria-label="Search"
                  >
                    <FiSearch size={17} />
                  </Button>
                </InputGroup>
              </Form>
            </Col>

            {/* Right */}
            <Col xs={12} md={4} className="d-flex align-items-center justify-content-center justify-content-md-end gap-3">
              {/* Cart */}
              <button
                onClick={toggleCart}
                className="header-utility-link position-relative btn border-0 p-0 bg-transparent"
                aria-label={`Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#ccc' }}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span style={{ color: '#ccc', fontSize: '0.72rem' }}>Cart</span>
                {totalItems > 0 && (
                  <span className="position-absolute rounded-pill" style={{
                    backgroundColor: 'var(--pn-primary)', color: '#0a0a0a',
                    fontSize: '0.6rem', fontWeight: 700,
                    top: -4, right: -4, minWidth: 17, height: 17,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>

              {/* GET A QUOTE */}
              <a
                href={waHref} target="_blank" rel="noopener noreferrer"
                className="btn btn-pink d-flex align-items-center gap-2"
                style={{ height: 42, fontSize: '0.875rem', flexShrink: 0 }}
                aria-label="Get a quote on WhatsApp"
              >
                <FaWhatsapp size={18} />
                <span className="d-none d-sm-inline">GET A QUOTE</span>
                <span className="d-sm-none">QUOTE</span>
              </a>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <Navbar expand="lg" className="py-1 navbar-custom">
        <Container>
          <Navbar.Toggle
            aria-controls="main-nav"
            className="border-0 shadow-none w-100 d-flex d-lg-none justify-content-between align-items-center py-2 px-0"
          >
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>MENU</span>
            <span className="navbar-toggler-icon" style={{ filter: 'invert(0.8)', width: '1.1em', height: '1.1em' }} />
          </Navbar.Toggle>

          <Navbar.Collapse id="main-nav">
            <div className="w-100 d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 py-1">
              <Nav className="gap-1 me-auto">
                {[
                  { to: '/',        label: 'HOME'    },
                  { to: '/shop',    label: 'SHOP'    },
                  { to: '/contact', label: 'CONTACT' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `nav-link px-3 py-1${isActive ? ' active-nav-link' : ''}`}
                  >
                    {label}
                  </NavLink>
                ))}
              </Nav>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </header>
  );
};

export default Header;
