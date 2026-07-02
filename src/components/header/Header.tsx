/**
 * PaperNest – Header Component
 * Sections: Announcement Bar → Logo/Search/WhatsApp → Navigation
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, InputGroup, Button } from 'react-bootstrap';
import { FiSearch, FiGrid, FiChevronDown, FiMenu, FiShoppingCart } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useCart } from '../../contexts/CartContext';

/** Inline gift-box logo SVG */
const LogoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="me-2"
    style={{ color: 'var(--pn-primary)', width: '36px', height: '36px', flexShrink: 0 }}
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

/** Animated typewriter brand name */
const TypewriterText: React.FC = () => {
  const words  = ['PaperNest', 'Stationery', 'Gifts', 'Stickers', 'PaperNest'];
  const [displayed, setDisplayed]   = useState('');
  const [wordIdx,   setWordIdx]     = useState(0);
  const [charIdx,   setCharIdx]     = useState(0);
  const [deleting,  setDeleting]    = useState(false);
  const [paused,    setPaused]      = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const current = words[wordIdx % words.length];

    if (paused) {
      timerRef.current = setTimeout(() => setPaused(false), 1600);
      return () => clearTimeout(timerRef.current);
    }

    if (!deleting && charIdx <= current.length) {
      timerRef.current = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === current.length) {
          // Pause at full word — but KEEP 'PaperNest' longer
          const pause = current === 'PaperNest' ? 2800 : 1400;
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx((c) => c + 1);
        }
      }, 90);
    } else if (deleting && charIdx >= 0) {
      timerRef.current = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx((w) => w + 1);
          setCharIdx(0);
        } else {
          setCharIdx((c) => c - 1);
        }
      }, 48);
    }
    return () => clearTimeout(timerRef.current);
  }, [charIdx, deleting, paused, wordIdx]);

  // Always show 'PaperNest' on first word with no typing
  const isBrand = words[wordIdx % words.length] === 'PaperNest';

  return (
    <span
      className="pn-typewriter"
      style={{
        color: isBrand ? 'var(--pn-primary)' : 'var(--pn-primary-dark)',
        fontWeight: 800,
        fontSize: '1.4rem',
        lineHeight: 1.1,
        letterSpacing: isBrand ? '-0.3px' : '0.2px',
        minWidth: 120,
        display: 'inline-block',
        transition: 'color 0.3s ease',
      }}
      aria-label="PaperNest"
    >
      {displayed}
      <span className="pn-cursor" aria-hidden="true">|</span>
    </span>
  );
};

export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const { whatsappNumber, announcementText, socialLinks } = useSiteSettings();
  const { totalItems, toggleCart } = useCart();
  const waHref = `https://wa.me/${whatsappNumber}`;

  return (
    <header className="bg-white shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>

      {/* ── Announcement Bar ───────────────────────────────── */}
      <div
        className="text-white py-2"
        style={{ backgroundColor: 'var(--pn-primary)', fontSize: '0.82rem' }}
      >
        <Container>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span className="fw-medium">{announcementText}</span>
            <div className="d-flex align-items-center gap-3">
              <Link to="/contact" className="text-white fw-medium" style={{ opacity: 0.9 }}>
                Contact Us
              </Link>
              <span className="opacity-50">|</span>
              <Link to="/about" className="text-white fw-medium" style={{ opacity: 0.9 }}>
                About
              </Link>
              <div className="d-flex align-items-center gap-2 ms-1">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} className="text-white" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebookF size={12} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} className="text-white" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram size={12} />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} className="text-white" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FaYoutube size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Header: Logo + Search + WhatsApp ─────────── */}
      <div className="py-3 border-bottom border-light">
        <Container>
          <Row className="align-items-center gy-3">

            {/* Logo */}
            <Col xs={12} md={3} className="d-flex align-items-center justify-content-center justify-content-md-start">
              <Link to="/" className="d-flex align-items-center text-decoration-none">
                <LogoIcon />
                <div className="d-flex flex-column">
                  <TypewriterText />
                  <span style={{ color: 'var(--pn-text-muted)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Stationery &amp; Personalized Gifts
                  </span>
                </div>
              </Link>
            </Col>

            {/* Search Bar */}
            <Col xs={12} md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup style={{ borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #dde0e8' }}>
                  <Form.Control
                    placeholder="Search products, gifts, stickers…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none px-3"
                    style={{ height: '42px', fontSize: '0.9rem' }}
                    aria-label="Search products"
                  />
                  <Button
                    type="submit"
                    className="border-0 px-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'var(--pn-primary)', color: 'white', height: '42px' }}
                    aria-label="Search"
                  >
                    <FiSearch size={17} />
                  </Button>
                </InputGroup>
              </Form>
            </Col>

            {/* Right Utilities */}
            <Col xs={12} md={4} className="d-flex align-items-center justify-content-center justify-content-md-end gap-3">
              {/* Cart icon */}
              <button
                onClick={toggleCart}
                className="header-utility-link position-relative btn border-0 p-0 bg-transparent"
                aria-label={`Open cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              >
                <FiShoppingCart size={20} />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span
                    className="position-absolute rounded-pill"
                    style={{
                      backgroundColor: 'var(--pn-primary)',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      top: -4, right: -4,
                      minWidth: 17, height: 17,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px',
                      animation: 'pnPop 0.3s ease',
                    }}
                    aria-hidden="true"
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* All Categories */}
              <Link to="/products" className="header-utility-link">
                <FiGrid size={20} />
                <span className="d-flex align-items-center gap-1">Categories <FiChevronDown size={11} /></span>
              </Link>

              {/* WhatsApp CTA */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-pink d-flex align-items-center gap-2"
                style={{ height: '42px', fontSize: '0.875rem', flexShrink: 0 }}
                aria-label="Order on WhatsApp"
              >
                <FaWhatsapp size={18} />
                <span className="d-none d-sm-inline">Order on WhatsApp</span>
                <span className="d-sm-none">WhatsApp</span>
              </a>
            </Col>

          </Row>
        </Container>
      </div>

      {/* ── Navigation Bar ─────────────────────────────────── */}
      <Navbar expand="lg" className="py-1 navbar-custom border-bottom border-light">
        <Container>
          <Navbar.Toggle
            aria-controls="main-navigation"
            className="border-0 shadow-none w-100 d-flex d-lg-none justify-content-between align-items-center py-2 px-0"
          >
            <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--pn-text-dark)' }}>
              BROWSE MENU
            </span>
            <span className="navbar-toggler-icon" style={{ width: '1.1em', height: '1.1em' }} />
          </Navbar.Toggle>

          <Navbar.Collapse id="main-navigation">
            <div className="w-100 d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 py-1">
              {/* All Categories pill button */}
              <Button className="btn-all-categories d-flex align-items-center gap-2 me-lg-2" style={{ flexShrink: 0 }}>
                <FiMenu size={16} />
                <span>All Categories</span>
                <FiChevronDown size={13} />
              </Button>

              {/* Nav Links */}
              <Nav className="gap-1 flex-wrap">
                {[
                  { to: '/',                              label: 'Home' },
                  { to: '/products',                     label: 'Shop' },
                  { to: '/products?category=gifts',      label: 'Personalized Gifts' },
                  { to: '/products?category=stickers',   label: 'Stickers' },
                  { to: '/products?category=prints',     label: 'Photo Prints' },
                  { to: '/products?category=mugs',       label: 'Custom Mugs' },
                  { to: '/products?category=notebooks',  label: 'Notebooks' },
                  { to: '/about',                        label: 'About' },
                  { to: '/contact',                      label: 'Contact' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `nav-link px-2 py-1${isActive ? ' active-nav-link' : ''}`
                    }
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
