/**
 * PaperNest – About Page
 * Sections: Hero → Story → Stats → Mission/Vision → Why Choose Us → CTA
 */
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FiTarget, FiEye, FiHeart, FiAward, FiUsers, FiPackage,
  FiCheck, FiTruck, FiSmile, FiGift, FiStar, FiTag,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { DEFAULT_SETTINGS } from '../../services/settingsService';

const WHY_ITEMS = [
  { icon: <FiCheck size={20} />,   title: 'Premium Quality',     desc: 'Every product is handpicked and quality-checked before dispatch.' },
  { icon: <FiTruck size={20} />,   title: 'Fast Delivery',       desc: 'Quick and reliable delivery across India.' },
  { icon: <FiGift size={20} />,    title: 'Personalization',     desc: 'Fully customized products made just for you.' },
  { icon: <FiSmile size={20} />,   title: 'Easy Ordering',       desc: 'Place your order directly on WhatsApp – no complicated checkout.' },
  { icon: <FiStar size={20} />,    title: 'Trusted by 10,000+',  desc: 'A growing community of happy customers across India.' },
  { icon: <FiTag size={20} />,     title: 'Best Prices',         desc: 'Competitive pricing without compromising on quality.' },
];

export const About: React.FC = () => {
  const { whatsappNumber } = DEFAULT_SETTINGS;

  return (
    <>
      {/* ── Page Hero ────────────────────────────────── */}
      <div className="page-hero" aria-label="About page header">
        <Container>
          <div className="text-center">
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.25rem' }}>About PaperNest</h1>
            <p className="text-muted mb-0" style={{ maxWidth: 520, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
              We are a passionate team dedicated to bringing you the finest stationery and
              personalized gifts in India.
            </p>
            <nav aria-label="Breadcrumb" className="mt-3">
              <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.82rem' }}>
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active">About Us</li>
              </ol>
            </nav>
          </div>
        </Container>
      </div>

      {/* ── Our Story ────────────────────────────────── */}
      <section className="py-5 bg-white" aria-label="Our story">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <img
                src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop"
                alt="PaperNest stationery collection"
                className="img-fluid rounded-4 shadow"
                style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }}
                loading="lazy"
              />
            </Col>
            <Col lg={6}>
              <span
                className="d-inline-block mb-3 px-3 py-1 rounded-pill fw-bold"
                style={{ backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)', fontSize: '0.8rem' }}
              >
                Our Story
              </span>
              <h2 className="section-title mb-4">
                Born from a Love of{' '}
                <span style={{ color: 'var(--pn-primary)' }}>Paper & Personalization</span>
              </h2>
              <p className="text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                PaperNest was founded in 2024 with a simple mission: to make beautiful, high-quality
                stationery and personalized gifts accessible to everyone across India. What started
                as a small passion project has grown into a trusted brand loved by thousands.
              </p>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                We believe that the right notebook, the perfect pen, or a thoughtfully personalized
                gift can make any moment extra special. That is why we carefully curate every product
                in our collection for quality, aesthetics and value.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/products" className="btn btn-pink">
                  Browse Our Collection
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
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="Our achievements">
        <Container>
          <Row className="g-4 justify-content-center">
            {[
              { icon: <FiUsers size={28} />,   number: '10,000+', label: 'Happy Customers' },
              { icon: <FiPackage size={28} />, number: '500+',    label: 'Products Available' },
              { icon: <FiAward size={28} />,   number: '4.9★',    label: 'Average Rating' },
              { icon: <FiHeart size={28} />,   number: '2024',    label: 'Founded In' },
            ].map((stat, i) => (
              <Col xs={6} md={3} key={i}>
                <div className="about-stat-card">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)' }}
                    aria-hidden="true"
                  >
                    {stat.icon}
                  </div>
                  <div className="about-stat-number">{stat.number}</div>
                  <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Mission & Vision ─────────────────────────── */}
      <section className="py-5 bg-white" aria-label="Mission and vision">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Our Mission &amp; Vision</h2>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <div
                className="h-100 p-4 rounded-4"
                style={{ backgroundColor: 'var(--pn-primary-bg)', border: '1px solid rgba(255,79,122,0.1)' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--pn-primary)', color: 'white' }}
                  aria-hidden="true"
                >
                  <FiTarget size={24} />
                </div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: 'var(--pn-primary)' }}>
                  Our Mission
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                  To provide every customer with premium quality stationery and personalized gifts
                  at affordable prices, delivered with care and a smile. We aim to make gifting
                  and everyday stationery a joyful, seamless experience for all.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div
                className="h-100 p-4 rounded-4"
                style={{ backgroundColor: '#eef4ff', border: '1px solid rgba(0,98,204,0.08)' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#0062cc', color: 'white' }}
                  aria-hidden="true"
                >
                  <FiEye size={24} />
                </div>
                <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: '#0062cc' }}>
                  Our Vision
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                  To become India's most loved online stationery and personalized gifts brand,
                  recognized for our quality, creativity and customer-first approach. We envision
                  a world where every note, gift and memory is beautifully crafted.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Why Choose Us ────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="Why choose PaperNest">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose PaperNest?</h2>
            <p className="section-subtitle mt-2">
              We are committed to giving you the best experience at every step.
            </p>
          </div>
          <Row className="g-4">
            {WHY_ITEMS.map((item, i) => (
              <Col xs={12} sm={6} md={4} key={i}>
                <div className="contact-info-card">
                  <div className="contact-icon-wrap">{item.icon}</div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.925rem' }}>{item.title}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="newsletter-section py-5" aria-label="Call to action">
        <Container>
          <div className="text-center text-white">
            <h2 className="fw-bold mb-3" style={{ fontSize: '1.75rem' }}>
              Ready to Start Shopping?
            </h2>
            <p className="mb-4 opacity-75" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
              Browse our full collection or chat with us on WhatsApp to place a custom order.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link
                to="/products"
                className="btn px-4 py-2 fw-bold rounded-3"
                style={{ backgroundColor: 'white', color: 'var(--pn-primary)', fontSize: '0.9rem' }}
              >
                Shop Now
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I want to place a custom order.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn px-4 py-2 fw-bold rounded-3 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#25D366', color: 'white', fontSize: '0.9rem' }}
              >
                <FaWhatsapp size={18} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Floating WhatsApp ──────────────────────────── */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
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
