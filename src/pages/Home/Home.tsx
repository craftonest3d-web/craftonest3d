/**
 * CRAFTONEST3D – Home Page (v2 — improved readability & UX)
 */
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FiChevronRight, FiLayers, FiTag, FiPrinter, FiBox,
  FiZap, FiTool, FiTarget, FiUpload, FiMessageSquare, FiTruck,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { Product, SiteSettings } from '../../types';
import { getFeaturedProducts, buildWhatsAppOrderUrl } from '../../services/productService';
import { DEFAULT_SETTINGS, getSiteSettings } from '../../services/settingsService';
import { FestivalBanner } from '../../components/common/FestivalGreeting';
import HappyCustomers from '../../components/common/HappyCustomers';

// ── Services ────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: <FiPrinter size={28} />, title: 'Custom 3D Printing',      desc: 'Turn your digital designs or ideas into physical 3D prints.' },
  { icon: <FiTag size={28} />,     title: 'Personalized Products',    desc: 'Names, logos, initials and customized designs.' },
  { icon: <FiLayers size={28} />,  title: 'Miniatures & Figurines',   desc: 'Custom characters, miniatures and collectible models.' },
  { icon: <FiBox size={28} />,     title: 'Keychains',                desc: 'Personalized name and character keychains.' },
  { icon: <FiZap size={28} />,     title: 'Toys & Models',            desc: 'Fun and creative 3D printed models and toys.' },
  { icon: <FiTool size={28} />,    title: 'Functional Prints',        desc: 'Useful custom parts and practical objects.' },
  { icon: <FiTarget size={28} />,  title: 'Prototypes',               desc: 'Quick physical prototypes for your concepts.' },
  { icon: <FiZap size={28} />,     title: 'Custom Projects',          desc: 'Have something unique in mind? Let\'s create it.' },
];

// ── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', icon: <FiUpload size={22} />,        title: 'Share Your Idea',      desc: 'Send us your concept, image, STL file or reference.' },
  { num: '02', icon: <FiMessageSquare size={22} />, title: 'Discuss & Customize',  desc: 'We discuss size, material, colours and customization.' },
  { num: '03', icon: <FiPrinter size={22} />,       title: 'We Print',             desc: 'Your model is prepared and 3D printed with care.' },
  { num: '04', icon: <FiTruck size={22} />,         title: 'Ready to Deliver',     desc: 'Your finished creation is ready for pickup or delivery.' },
];

// ── Work Card ────────────────────────────────────────────────────────────────
const WorkCard: React.FC<{ product: Product; waNumber: string }> = ({ product, waNumber }) => (
  <div style={{
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    height: '100%',
  }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#d4af37'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
  >
    <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
      <img
        src={product.image}
        alt={product.title}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      />
      {product.badge && (
        <span style={{
          position: 'absolute', top: 10, left: 10,
          backgroundColor: '#d4af37', color: '#0a0a0a',
          fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6,
        }}>
          {product.badge}
        </span>
      )}
    </div>
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d4af37', marginBottom: 4 }}>
        {product.categoryLabel}
      </p>
      <h6 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 8, lineHeight: 1.4 }}>
        {product.title}
      </h6>
      <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#b0b0b0', flexGrow: 1, marginBottom: 12 }}>
        {product.description.length > 75 ? product.description.slice(0, 75) + '…' : product.description}
      </p>
      {(product.material || product.size) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {product.material && (
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: '#111', color: '#b0b0b0', border: '1px solid #333' }}>
              {product.material}
            </span>
          )}
          {product.size && (
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: '#111', color: '#b0b0b0', border: '1px solid #333' }}>
              {product.size}
            </span>
          )}
        </div>
      )}
      <a
        href={buildWhatsAppOrderUrl(product, waNumber)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          backgroundColor: '#d4af37', color: '#0a0a0a',
          padding: '0.55rem', borderRadius: 8,
          fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0d060')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
      >
        <FaWhatsapp size={16} /> Enquire Now
      </a>
    </div>
  </div>
);

// ── Home ─────────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getFeaturedProducts().then(setProducts);
    getSiteSettings().then(setSettings);
  }, []);

  const WA = settings.whatsappNumber;
  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like to get a quote for a custom 3D print.')}`;

  return (
    <div style={{ backgroundColor: '#0d0d0d' }}>

      {/* Festival greeting banner (admin-controlled) */}
      <FestivalBanner />

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '5rem 0 4rem',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)',
        borderBottom: '1px solid #222',
      }}>
        {/* Gold grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        <Container style={{ position: 'relative' }}>
          <Row className="align-items-center gy-5">

            {/* Left — Text */}
            <Col lg={6}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: 50,
                  backgroundColor: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px',
                }} className="c3d-shine">
                  ✨ CUSTOM 3D PRINTING STUDIO
                </span>
              </div>

              <h1 className="c3d-animate-up c3d-delay-1" style={{
                fontSize: 'clamp(3rem, 7vw, 5rem)',
                fontWeight: 900, lineHeight: 1,
                letterSpacing: '-2px', marginBottom: 12,
                color: '#ffffff',
              }}>
                CRAFTONEST<span className="c3d-gold-shimmer">3D</span>
              </h1>

              <p className="c3d-animate-up c3d-delay-2" style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                fontWeight: 600, color: '#d4af37',
                marginBottom: 20, letterSpacing: '0.5px',
              }}>
                Where Ideas Take Shape
              </p>

              <p className="c3d-animate-up c3d-delay-3" style={{
                fontSize: '1.1rem', lineHeight: 1.8,
                color: '#cccccc', marginBottom: 36,
                maxWidth: 520,
              }}>
                From imagination to reality — we turn your ideas into
                high-quality 3D printed creations. Keychains, miniatures,
                toys, figurines, custom designs and more.
              </p>

              <div className="c3d-animate-up c3d-delay-4" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a
                  href={waHref} target="_blank" rel="noopener noreferrer"
                  className="c3d-glow-pulse"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    backgroundColor: '#d4af37', color: '#0a0a0a',
                    padding: '14px 28px', borderRadius: 10,
                    fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0d060'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d4af37'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <FaWhatsapp size={20} /> START YOUR PROJECT
                </a>
                <Link
                  to="/shop"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    border: '2px solid #d4af37', color: '#d4af37',
                    padding: '12px 24px', borderRadius: 10,
                    fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d4af37'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#d4af37'; }}
                >
                  VIEW OUR WORK <FiChevronRight size={18} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="c3d-animate-up c3d-delay-5" style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
                {[
                  { num: '100%', label: 'Custom Made' },
                  { num: 'Fast', label: 'Turnaround' },
                  { num: '8+', label: 'Print Types' },
                ].map((b, i) => (
                  <div key={i} className="c3d-popin" style={{ textAlign: 'center', animationDelay: `${0.7 + i * 0.15}s` }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d4af37', margin: 0, lineHeight: 1 }}>{b.num}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, fontWeight: 600 }}>{b.label}</p>
                  </div>
                ))}
              </div>
            </Col>

            {/* Right — 3D Printer Visual */}
            <Col lg={6} className="text-center">
              <div className="c3d-float" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 'min(420px, 100%)', height: 400,
                borderRadius: 24,
                background: 'linear-gradient(145deg, #161616, #0d0d0d)',
                border: '1px solid #2a2a2a',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Rotating conic glow */}
                <div className="c3d-conic-glow" />
                {/* Corner accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37', borderRadius: '24px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37', borderRadius: '0 24px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37', borderRadius: '0 0 0 24px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37', borderRadius: '0 0 24px 0' }} />

                <svg width="240" height="280" viewBox="0 0 240 280" fill="none">
                  {/* Frame outer */}
                  <rect x="20" y="8" width="200" height="220" rx="10" fill="none" stroke="#2a2a2a" strokeWidth="2.5" />
                  {/* Top rail */}
                  <rect x="30" y="28" width="180" height="22" rx="5" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
                  {/* Rail shine */}
                  <rect x="35" y="31" width="80" height="4" rx="2" fill="rgba(212,175,55,0.3)" />
                  {/* Print head */}
                  <rect x="100" y="42" width="40" height="28" rx="5" fill="#d4af37" />
                  <rect x="108" y="70" width="24" height="8" rx="2" fill="#b8941f" />
                  {/* Nozzle drip line */}
                  <line x1="120" y1="78" x2="120" y2="150" stroke="#d4af37" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                  {/* Print bed */}
                  <rect x="40" y="172" width="160" height="8" rx="4" fill="#d4af37" opacity="0.7" />
                  <rect x="45" y="180" width="150" height="44" rx="4" fill="#161616" stroke="#d4af37" strokeWidth="1.5" opacity="0.6" />
                  {/* Printed object — cube being printed */}
                  <path d="M120 130 L152 147 L152 173 L120 190 L88 173 L88 147 Z" fill="none" stroke="#d4af37" strokeWidth="2.5" />
                  <path d="M88 147 L120 130 L152 147 L120 164 Z" fill="#d4af37" opacity="0.25" />
                  <path d="M120 164 L120 190" stroke="#d4af37" strokeWidth="2" />
                  <path d="M120 164 L88 147" stroke="#d4af37" strokeWidth="1.5" opacity="0.4" />
                  <path d="M120 164 L152 147" stroke="#d4af37" strokeWidth="1.5" opacity="0.4" />
                  {/* Base plate */}
                  <rect x="10" y="228" width="220" height="34" rx="8" fill="#161616" stroke="#2a2a2a" strokeWidth="2" />
                  {/* Base details */}
                  <rect x="30" y="236" width="60" height="10" rx="3" fill="#222" />
                  <rect x="100" y="236" width="40" height="10" rx="3" fill="#d4af37" opacity="0.4" />
                  <rect x="150" y="236" width="60" height="10" rx="3" fill="#222" />
                  {/* Side pillars */}
                  <rect x="20" y="8" width="12" height="220" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
                  <rect x="208" y="8" width="12" height="220" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
                </svg>

                {/* Gold glow */}
                <div style={{
                  position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                  width: 140, height: 12, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.25)', filter: 'blur(24px)',
                }} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          2. OUR SERVICES
      ══════════════════════════════════════ */}
      <section id="services" style={{ padding: '5rem 0', backgroundColor: '#111111' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: 8 }}>WHAT WE DO</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              Our Services
            </h2>
            <p style={{ color: '#b0b0b0', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              From custom prints to personalized products — here is what we create.
            </p>
          </div>

          <Row className="g-4">
            {SERVICES.map((svc, i) => (
              <Col xs={12} sm={6} lg={3} key={i}>
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 16, padding: '2rem 1.5rem',
                  textAlign: 'center', height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d4af37'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 30px rgba(212,175,55,0.1)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2a2a2a'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', color: '#d4af37',
                  }}>
                    {svc.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                    {svc.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#b0b0b0', lineHeight: 1.6, margin: 0 }}>
                    {svc.desc}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          3. RECENT WORKS
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', backgroundColor: '#0d0d0d' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: 4 }}>PORTFOLIO</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Recent Works
              </h2>
            </div>
            <Link to="/shop" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#d4af37', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
              border: '1px solid rgba(212,175,55,0.3)', padding: '8px 16px', borderRadius: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(212,175,55,0.1)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; }}
            >
              View All <FiChevronRight size={16} />
            </Link>
          </div>

          {products.length === 0 ? (
            <Row className="g-4">
              {[...Array(4)].map((_, i) => (
                <Col xs={12} sm={6} lg={3} key={i}>
                  <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                    <div style={{ height: 200, backgroundColor: '#222' }} />
                    <div style={{ padding: '1rem' }}>
                      <div style={{ height: 12, backgroundColor: '#2a2a2a', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, backgroundColor: '#222', borderRadius: 4, width: '70%' }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-4">
              {products.slice(0, 8).map((product) => (
                <Col xs={12} sm={6} lg={3} key={product.id}>
                  <WorkCard product={product} waNumber={WA} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* ══════════════════════════════════════
          4. ABOUT
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', backgroundColor: '#111111' }}>
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: 12 }}>ABOUT US</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#ffffff', marginBottom: 20, lineHeight: 1.2 }}>
                We Turn Your Ideas Into <span style={{ color: '#d4af37' }}>Real Objects</span>
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#cccccc', marginBottom: 16 }}>
                CRAFTONEST3D is a custom 3D-printing studio focused on turning ideas,
                designs and concepts into physical objects. We specialize in custom 3D printing,
                personalized name products, keychains, miniatures, toys, figurines, decorative
                models, functional parts and custom designs.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#b0b0b0', marginBottom: 32 }}>
                Every print is carefully prepared and crafted with attention to detail so your
                idea becomes a tangible, high-quality object.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/about" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  border: '2px solid #d4af37', color: '#d4af37',
                  padding: '12px 24px', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#d4af37'; el.style.color = '#0a0a0a'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = '#d4af37'; }}
                >
                  Learn More
                </Link>
                <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#d4af37', color: '#0a0a0a',
                  padding: '12px 24px', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0d060'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d4af37'; }}
                >
                  <FaWhatsapp size={18} /> Get a Quote
                </a>
              </div>
            </Col>
            <Col lg={6}>
              <Row className="g-3">
                {[
                  { icon: <FiPrinter size={22} />, label: 'Custom 3D Printing' },
                  { icon: <FiTag size={22} />,     label: 'Personalized Products' },
                  { icon: <FiLayers size={22} />,  label: 'Miniatures & Figurines' },
                  { icon: <FiBox size={22} />,     label: 'Keychains' },
                  { icon: <FiZap size={22} />,     label: 'Toys & Models' },
                  { icon: <FiTool size={22} />,    label: 'Functional Parts' },
                ].map((item, i) => (
                  <Col xs={6} key={i}>
                    <div style={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: 12, padding: '1.25rem',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#d4af37'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'}
                    >
                      <div style={{ color: '#d4af37', flexShrink: 0 }}>{item.icon}</div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{item.label}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          5. HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '5rem 0', backgroundColor: '#0d0d0d' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: 8 }}>PROCESS</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              How It Works
            </h2>
            <p style={{ color: '#b0b0b0', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
              From idea to finished print in four simple steps.
            </p>
          </div>
          <Row className="g-4">
            {STEPS.map((step, i) => (
              <Col xs={12} sm={6} lg={3} key={i}>
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 16, padding: '2rem 1.5rem',
                  textAlign: 'center', height: '100%',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d4af37'; el.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2a2a2a'; el.style.transform = 'translateY(0)'; }}
                >
                  {/* Step number */}
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    backgroundColor: '#d4af37', color: '#0a0a0a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '1.1rem', fontWeight: 900,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ color: '#d4af37', marginBottom: 12 }}>{step.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#b0b0b0', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Happy Customers — scrolling reviews (admin-controlled) */}
      <HappyCustomers />

      {/* ══════════════════════════════════════
          6. CTA
      ══════════════════════════════════════ */}
      <section id="cta" style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #111 0%, #1a1a0a 50%, #111 100%)',
        borderTop: '1px solid #2a2a2a',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 900, color: '#ffffff',
              lineHeight: 1.1, marginBottom: 16,
            }}>
              YOUR IDEA.<br />
              <span style={{ color: '#d4af37' }}>OUR PRINT.</span>
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#cccccc', lineHeight: 1.7, marginBottom: 36 }}>
              Have an idea you'd like to turn into a real object?<br />
              Chat with us on WhatsApp — we'll bring it to life.
            </p>
            <a
              href={waHref} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                backgroundColor: '#d4af37', color: '#0a0a0a',
                padding: '16px 40px', borderRadius: 12,
                fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none',
                boxShadow: '0 12px 36px rgba(212,175,55,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#f0d060'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 40px rgba(212,175,55,0.45)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#d4af37'; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 12px 36px rgba(212,175,55,0.35)'; }}
            >
              <FaWhatsapp size={24} /> GET A QUOTE
            </a>
            <p style={{ marginTop: 16, fontSize: '0.85rem', color: '#888' }}>
              Fast response · No commitment · 100% custom
            </p>
          </div>
        </Container>
      </section>

      {/* Floating WhatsApp */}
      <a
        href={waHref} target="_blank" rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>

    </div>
  );
};

export default Home;
