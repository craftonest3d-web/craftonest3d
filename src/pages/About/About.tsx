/**
 * CRAFTONEST3D – About Page
 * Sections: Hero → Story → Stats → Mission/Vision → What We Do → CTA
 */
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FiTarget, FiEye, FiPrinter, FiTag, FiLayers, FiBox,
  FiZap, FiTool, FiCheck,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const WHAT_WE_DO = [
  { icon: <FiPrinter size={20} />, title: 'Custom 3D Printing',     desc: 'Turn your digital designs or ideas into physical 3D prints.' },
  { icon: <FiTag size={20} />,     title: 'Personalized Products',   desc: 'Names, logos, initials and customized designs.' },
  { icon: <FiLayers size={20} />,  title: 'Miniatures',              desc: 'Custom characters, miniatures and collectible-style models.' },
  { icon: <FiBox size={20} />,     title: 'Keychains',              desc: 'Personalized name and character keychains.' },
  { icon: <FiZap size={20} />,     title: 'Toys & Models',          desc: 'Fun and creative 3D printed models.' },
  { icon: <FiTool size={20} />,    title: 'Functional Prints',      desc: 'Useful custom parts and practical objects.' },
  { icon: <FiZap size={20} />,     title: 'Prototypes',           desc: 'Quick physical prototypes for concepts and designs.' },
  { icon: <FiCheck size={20} />,   title: 'Custom Projects',         desc: 'Have something unique in mind? Let\u2019s create it together.' },
];

export const About: React.FC = () => {
  const { whatsappNumber, aboutStory, aboutMission, aboutVision } = useSiteSettings();
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like to get a quote for a custom 3D print.')}`;

  return (
    <>
      {/* ── Page Hero ────────────────────────────────── */}
      <div className="page-hero" aria-label="About page header">
        <Container>
          <div className="text-center">
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.25rem', color: 'var(--pn-text-dark)' }}>About <span style={{ color: 'var(--pn-primary)' }}>CRAFTONEST3D</span></h1>
            <p className="mb-0" style={{ maxWidth: 560, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--pn-text-muted)' }}>
              CRAFTONEST3D is a custom 3D-printing studio focused on turning ideas, designs
              and concepts into physical objects.
            </p>
            <nav aria-label="Breadcrumb" className="mt-3">
              <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.82rem' }}>
                <li className="breadcrumb-item"><Link to="/" style={{ color: 'var(--pn-text-muted)' }}>Home</Link></li>
                <li className="breadcrumb-item active" style={{ color: 'var(--pn-text-muted)' }}>About Us</li>
              </ol>
            </nav>
          </div>
        </Container>
      </div>

      {/* ── Our Story ────────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-paper)' }} aria-label="Our story">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6} className="order-lg-2">
              <Row className="g-3">
                {[
                  { icon: <FiPrinter size={28} />, label: 'Custom Prints' },
                  { icon: <FiLayers size={28} />,  label: 'Miniatures' },
                  { icon: <FiBox size={28} />,     label: 'Keychains' },
                  { icon: <FiZap size={28} />,     label: 'Toys & Models' },
                ].map((item, i) => (
                  <Col xs={6} key={i}>
                    <div className="card-custom h-100 p-4 d-flex flex-column align-items-center gap-2 text-center" style={{ borderRadius: 'var(--pn-radius-md)' }}>
                      <div style={{ color: 'var(--pn-primary)' }} aria-hidden="true">{item.icon}</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pn-text-dark)' }}>{item.label}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col lg={6} className="order-lg-1">
              <span
                className="d-inline-block mb-3 px-3 py-1 rounded-pill fw-bold"
                style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--pn-primary)', fontSize: '0.8rem', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                Our Story
              </span>
              <h2 className="section-title mb-4">
                Turning Ideas Into{' '}
                <span style={{ color: 'var(--pn-primary)' }}>Physical Objects</span>
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--pn-text-muted)', marginBottom: '1rem' }}>
                {aboutStory}
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--pn-text-muted)', marginBottom: '1.5rem' }}>
                We believe that great ideas deserve to become real. Whether it is a personalized
                keychain, a detailed miniature, a functional part or a completely custom design,
                we bring precision and care to every print.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/our-work" className="btn btn-pink">
                  View Our Work
                </Link>
                <Link to="/contact" className="btn btn-outline-pink">
                  Get in Touch
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="Our focus">
        <Container>
          <Row className="g-4 justify-content-center">
            {[
              { icon: <FiPrinter size={28} />, number: '100%',  label: 'Custom Made' },
              { icon: <FiLayers size={28} />,  number: '8+',    label: 'Service Types' },
              { icon: <FiTag size={28} />,      number: '9',     label: 'Categories' },
              { icon: <FiTarget size={28} />,   number: '\u221E', label: 'Ideas Welcome' },
            ].map((stat, i) => (
              <Col xs={6} md={3} key={i}>
                <div className="about-stat-card">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)', border: '1px solid #2a2a2a' }}
                    aria-hidden="true"
                  >
                    {stat.icon}
                  </div>
                  <div className="about-stat-number">{stat.number}</div>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--pn-text-muted)' }}>{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Mission & Vision ─────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-paper)' }} aria-label="Mission and vision">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Our Mission &amp; Vision</h2>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <div
                className="h-100 p-4 rounded-4"
                style={{ backgroundColor: 'var(--pn-bg-pink-light)', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--pn-primary)', color: '#0a0a0a' }}
                  aria-hidden="true"
                >
                  <FiTarget size={24} />
                </div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: 'var(--pn-primary)' }}>
                  Our Mission
                </h3>
                <p className="mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--pn-text-muted)' }}>
                  {aboutMission}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div
                className="h-100 p-4 rounded-4"
                style={{ backgroundColor: 'var(--pn-bg-pink-light)', border: '1px solid #2a2a2a' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)', border: '1px solid #2a2a2a' }}
                  aria-hidden="true"
                >
                  <FiEye size={24} />
                </div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: 'var(--pn-text-dark)' }}>
                  Our Vision
                </h3>
                <p className="mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--pn-text-muted)' }}>
                  {aboutVision}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── What We Do ──────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="What we do">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">What We Do</h2>
            <p className="section-subtitle mt-2">
              A full range of custom 3D-printing services to bring your ideas to life.
            </p>
          </div>
          <Row className="g-4">
            {WHAT_WE_DO.map((item, i) => (
              <Col xs={12} sm={6} md={4} lg={3} key={i}>
                <div className="card-custom h-100 p-3 d-flex align-items-start gap-3" style={{ borderRadius: 'var(--pn-radius-md)' }}>
                  <div className="contact-icon-wrap" style={{ flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>{item.title}</h6>
                    <p className="mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--pn-text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="newsletter-section py-5" aria-label="Get a quote">
        <Container>
          <div className="text-center">
            <h2 className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: 'var(--pn-text-dark)' }}>
              YOUR IDEA. <span style={{ color: 'var(--pn-primary)' }}>OUR PRINT.</span>
            </h2>
            <p className="mb-4" style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--pn-text-muted)' }}>
              Ready to bring your idea to life? Chat with us on WhatsApp to get started.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/our-work" className="btn btn-outline-pink">
                View Our Work
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-pink d-flex align-items-center gap-2"
              >
                <FaWhatsapp size={18} /> Get a Quote
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Floating WhatsApp ──────────────────────────── */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>
    </>
  );
};

export default About;
