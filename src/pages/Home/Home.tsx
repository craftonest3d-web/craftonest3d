/**
 * PaperNest – Home Page
 * Sections: Hero → Categories → Featured Products → Promo → Why Us → Testimonials → Newsletter
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FiChevronRight, FiStar, FiCheck, FiTruck,
  FiSmile, FiTag, FiLayers, FiBookOpen, FiEdit3, FiGift,
  FiHeart, FiMail, FiPackage, FiSend, FiShoppingCart,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { Product, SiteSettings } from '../../types';
import { getFeaturedProducts, buildWhatsAppOrderUrl } from '../../services/productService';
import { DEFAULT_SETTINGS, getSiteSettings } from '../../services/settingsService';
import { useCart } from '../../contexts/CartContext';

const WA_NUMBER = DEFAULT_SETTINGS.whatsappNumber;

// ── Category Data ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'stationery', name: 'School Stationery', icon: <FiBookOpen size={22} /> },
  { id: 'stationery', name: 'Office Supplies',   icon: <FiEdit3 size={22} /> },
  { id: 'gifts',      name: 'Personalized Gifts',icon: <FiGift size={22} /> },
  { id: 'stickers',   name: 'Stickers',          icon: <FiHeart size={22} /> },
  { id: 'prints',     name: 'Photo Prints',      icon: <FiMail size={22} /> },
  { id: 'mugs',       name: 'Custom Mugs',       icon: <FiSmile size={22} /> },
  { id: 'notebooks',  name: 'Diaries & Notebooks',icon: <FiLayers size={22} /> },
  { id: 'giftboxes',  name: 'Gift Boxes',        icon: <FiPackage size={22} /> },
  { id: 'cards',      name: 'Greeting Cards',    icon: <FiMail size={22} /> },
  { id: 'stationery', name: 'Keychains',         icon: <FiTag size={22} /> },
];

// ── USPs ───────────────────────────────────────────────────────────────────
const USPS = [
  { icon: <FiCheck size={22} />,   title: 'Premium Quality',    desc: 'Handpicked products that meet our quality standards.' },
  { icon: <FiLayers size={22} />,  title: 'Wide Collection',    desc: 'Thousands of products across every stationery category.' },
  { icon: <FiTag size={22} />,     title: 'Affordable Prices',  desc: 'Premium quality without the premium price tag.' },
  { icon: <FiTruck size={22} />,   title: 'Fast Delivery',      desc: 'Quick and safe delivery right to your doorstep.' },
  { icon: <FiSmile size={22} />,   title: '100% Satisfaction',  desc: 'Happy customers are our biggest achievement.' },
  { icon: <FiGift size={22} />,    title: 'Personalization',    desc: 'Custom gifts tailored exactly to your wishes.' },
];

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya S.',  city: 'Mumbai',   stars: 5, text: 'Absolutely love the quality of stickers and the packaging was beautiful! Will order again.' },
  { name: 'Aakash M.', city: 'Delhi',    stars: 5, text: "Ordered a custom mug for my mom's birthday – she loved it. Fast delivery, great service." },
  { name: 'Riya K.',   city: 'Bangalore',stars: 5, text: 'The personalized photo frame was stunning. Exactly as described and delivered on time!' },
  { name: 'Neha J.',   city: 'Pune',     stars: 5, text: 'Best stationery store online. The notebooks feel premium and the prices are very reasonable.' },
];

// ── Star Rating ────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => (
  <div className="d-flex text-warning" aria-label={`Rating: ${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={size}
        style={{ fill: s <= rating ? '#ffc107' : 'none', color: s <= rating ? '#ffc107' : '#ccc' }}
      />
    ))}
  </div>
);

// ── Product Card ───────────────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  return (
  <div className="card-custom h-100" style={{ borderRadius: 'var(--pn-radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div className="position-relative overflow-hidden" style={{ height: 200 }}>
      <img
        src={product.image}
        alt={product.title}
        className="img-zoom"
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {product.badge && (
        <div className={`card-badge badge-${product.badgeType}`}>{product.badge}</div>
      )}
    </div>
    <div className="p-3 d-flex flex-column flex-grow-1">
      <p className="text-muted mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {product.categoryLabel}
      </p>
      <h6 className="fw-bold mb-2" style={{ fontSize: '0.875rem', lineHeight: 1.4, minHeight: 40 }}>
        {product.title}
      </h6>
      <div className="d-flex align-items-center gap-2 mb-2">
        <StarRating rating={product.rating} />
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>({product.reviews})</span>
      </div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="fw-bold fs-6">₹{product.price}</span>
        {product.originalPrice > product.price && (
          <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.8rem' }}>
            ₹{product.originalPrice}
          </span>
        )}
        {product.originalPrice > product.price && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ee5253' }}>
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
          </span>
        )}
      </div>
      <div className="d-flex gap-2 mt-auto">
        <a
          href={buildWhatsAppOrderUrl(product, WA_NUMBER)}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-order-btn flex-grow-1"
          style={{ fontSize: '0.8rem' }}
        >
          <FaWhatsapp size={15} />
          WhatsApp
        </a>
        <button
          onClick={() => addToCart(product)}
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'var(--pn-primary-bg)',
            color: 'var(--pn-primary)',
            borderRadius: 'var(--pn-radius-sm)',
            width: 40, height: 40, flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          aria-label={`Add ${product.title} to cart`}
          title="Add to cart"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--pn-primary)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--pn-primary-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--pn-primary)'; }}
        >
          <FiShoppingCart size={16} />
        </button>
      </div>
    </div>
  </div>
  );
};

// ── Home Component ─────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [settings,  setSettings]  = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [email,     setEmail]     = useState('');
  const [subscribed,setSubscribed] = useState(false);

  useEffect(() => {
    getFeaturedProducts().then(setProducts);
    getSiteSettings().then(setSettings);
  }, []);

  const WA = settings.whatsappNumber;
  const h0 = settings.heroSlides?.[0] ?? DEFAULT_SETTINGS.heroSlides[0];
  const h1 = settings.heroSlides?.[1] ?? DEFAULT_SETTINGS.heroSlides[1];
  const p0 = settings.promoBanners?.[0] ?? DEFAULT_SETTINGS.promoBanners[0];
  const p1 = settings.promoBanners?.[1] ?? DEFAULT_SETTINGS.promoBanners[1];

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  }, [email]);

  return (
    <div>

      {/* ── 1. Hero Carousel ──────────────────────────────── */}
      <section aria-label="Featured promotions">
        <Carousel fade indicators controls={false} className="hero-carousel">
          {/* Slide 1 */}
          <Carousel.Item>
            <div style={{ backgroundColor: h0.bgColor || 'var(--pn-primary-bg)', minHeight: 440 }} className="d-flex align-items-center">
              <Container className="py-5">
                <Row className="align-items-center gy-4">
                  <Col md={6} className="animate-fade-up">
                    <Badge className="mb-3 px-3 py-2"
                      style={{ backgroundColor: '#ffe0e9', color: 'var(--pn-primary)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {h0.badge}
                    </Badge>
                    <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--pn-secondary)', lineHeight: 1.15 }}>
                      {h0.heading}{' '}
                      <span style={{ color: 'var(--pn-primary)' }}>{h0.headingHighlight}</span>
                    </h1>
                    <p className="lead text-muted mb-4 fs-6" style={{ maxWidth: 480, lineHeight: 1.7 }}>
                      {h0.subtext}
                    </p>
                    <div className="d-flex gap-3 flex-wrap">
                      <Link to={h0.buttonLink || '/products'} className="btn btn-pink">
                        {h0.buttonText} <FiChevronRight size={16} />
                      </Link>
                      <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to explore your products.')}`}
                        target="_blank" rel="noopener noreferrer" className="btn btn-outline-pink">
                        <FaWhatsapp size={16} /> Chat with Us
                      </a>
                    </div>
                  </Col>
                  <Col md={6} className="text-center">
                    <img src={h0.image} alt="Hero"
                      className="img-fluid rounded-4 shadow"
                      style={{ maxHeight: 360, objectFit: 'cover', width: '90%' }} loading="eager" />
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>

          {/* Slide 2 */}
          <Carousel.Item>
            <div style={{ backgroundColor: h1.bgColor || '#e8f4ff', minHeight: 440 }} className="d-flex align-items-center">
              <Container className="py-5">
                <Row className="align-items-center gy-4">
                  <Col md={6}>
                    <Badge className="mb-3 px-3 py-2"
                      style={{ backgroundColor: '#ddeeff', color: '#0062cc', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {h1.badge}
                    </Badge>
                    <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--pn-secondary)', lineHeight: 1.15 }}>
                      {h1.heading}{' '}
                      <span style={{ color: 'var(--pn-primary)' }}>{h1.headingHighlight}</span>
                    </h1>
                    <p className="lead text-muted mb-4 fs-6" style={{ maxWidth: 480, lineHeight: 1.7 }}>
                      {h1.subtext}
                    </p>
                    <Link to={h1.buttonLink || '/products?category=gifts'} className="btn btn-pink">
                      {h1.buttonText} <FiChevronRight size={16} />
                    </Link>
                  </Col>
                  <Col md={6} className="text-center">
                    <img src={h1.image} alt="Hero slide 2"
                      className="img-fluid rounded-4 shadow"
                      style={{ maxHeight: 360, objectFit: 'cover', width: '90%' }} loading="lazy" />
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* ── 2. Category Icons ──────────────────────────────── */}
      <section className="py-5 bg-white" aria-label="Product categories">
        <Container>
          <div className="text-center mb-4">
            <h2 className="section-title">{settings.categoriesTitle}</h2>
            <p className="section-subtitle mt-2">{settings.categoriesSubtext}</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex gap-4 overflow-hidden w-100 px-2 justify-content-center flex-wrap" role="list">
              {CATEGORIES.map((cat, i) => (
                <div key={i} role="listitem">
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="text-decoration-none d-flex flex-column align-items-center gap-2 category-circle-wrapper"
                    aria-label={cat.name}
                  >
                    <div className="category-circle">{cat.icon}</div>
                    <span className="cat-name">{cat.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Featured Products ───────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="Featured products">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="section-title mb-1">✨ Featured Products</h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Handpicked bestsellers and new arrivals just for you.
              </p>
            </div>
            <Link to="/products" className="d-flex align-items-center gap-1 fw-semibold" style={{ color: 'var(--pn-primary)', fontSize: '0.9rem' }}>
              View All <FiChevronRight size={16} />
            </Link>
          </div>

          {products.length === 0 ? (
            <Row className="g-4">
              {[...Array(6)].map((_, i) => (
                <Col xs={12} sm={6} lg={4} xl={2} key={i}>
                  <div className="card-custom h-100" style={{ minHeight: 340 }}>
                    <div style={{ height: 200, backgroundColor: '#f5f6f8', borderRadius: '12px 12px 0 0' }} />
                    <div className="p-3">
                      <div style={{ height: 12, backgroundColor: '#f0f1f5', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, backgroundColor: '#f0f1f5', borderRadius: 4, width: '70%' }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-4">
              {products.map((product) => (
                <Col xs={12} sm={6} lg={4} xl={2} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* ── 4. Promo Banners ───────────────────────────────── */}
      <section className="py-5 bg-white" aria-label="Promotional offers">
        <Container>
          <Row className="g-4">
            <Col md={6}>
              <div className="promo-card" style={{ backgroundColor: p0.bgColor || 'var(--pn-primary-bg)' }}>
                <div>
                  <Badge className="mb-2 px-3 py-2" style={{ backgroundColor: '#ffe0e9', color: 'var(--pn-primary)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    {p0.badge}
                  </Badge>
                  <h3 className="fw-bold mb-2" style={{ fontSize: '1.4rem' }}>{p0.heading}</h3>
                  <p className="text-muted mb-4" style={{ maxWidth: 220, fontSize: '0.875rem', lineHeight: 1.6 }}>{p0.subtext}</p>
                  <Link to={p0.buttonLink || '/products'} className="btn btn-pink">
                    {p0.buttonText} <FiChevronRight size={15} />
                  </Link>
                </div>
                <img src={p0.image} alt={p0.heading} className="d-none d-sm-block" loading="lazy" />
              </div>
            </Col>
            <Col md={6}>
              <div className="promo-card" style={{ backgroundColor: p1.bgColor || '#eef4ff' }}>
                <div>
                  <Badge className="mb-2 px-3 py-2" style={{ backgroundColor: '#ddeeff', color: '#0062cc', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    {p1.badge}
                  </Badge>
                  <h3 className="fw-bold mb-2" style={{ fontSize: '1.4rem' }}>{p1.heading}</h3>
                  <p className="text-muted mb-4" style={{ maxWidth: 220, fontSize: '0.875rem', lineHeight: 1.6 }}>{p1.subtext}</p>
                  <Link to={p1.buttonLink || '/products'} className="btn btn-pink">
                    {p1.buttonText} <FiChevronRight size={15} />
                  </Link>
                </div>
                <img src={p1.image} alt={p1.heading} className="d-none d-sm-block" loading="lazy" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── 5. Why Choose Us ───────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }} aria-label="Why choose PaperNest">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">{settings.whyTitle}</h2>
            <p className="section-subtitle mt-2">{settings.whySubtext}</p>
          </div>
          <div className="why-choose-container">
            <Row className="g-3">
              {USPS.map((item, i) => (
                <Col xs={12} sm={6} md={4} lg={2} key={i}>
                  <div className="why-card">
                    <div className="why-icon-wrap">{item.icon}</div>
                    <div>
                      <p className="fw-bold mb-1" style={{ fontSize: '0.875rem' }}>{item.title}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* ── 6. Testimonials ────────────────────────────────── */}
      <section className="py-5 bg-white" aria-label="Customer reviews">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle mt-2">Real reviews from real customers who love PaperNest.</p>
          </div>
          <Row className="g-4">
            {TESTIMONIALS.map((t, i) => (
              <Col xs={12} sm={6} lg={3} key={i}>
                <div className="testimonial-card">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                      style={{ width: 40, height: 40, backgroundColor: 'var(--pn-primary)', fontSize: '1rem', flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="fw-bold mb-0" style={{ fontSize: '0.875rem' }}>{t.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{t.city}</p>
                    </div>
                  </div>
                  <StarRating rating={t.stars} size={14} />
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                    "{t.text}"
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── 7. Newsletter ──────────────────────────────────── */}
      <section className="newsletter-section py-5" aria-label="Newsletter signup">
        <Container>
          <Row className="justify-content-center">
            <Col lg={7} className="text-center text-white">
              <FiMail size={36} className="mb-3 opacity-75" />
              <h2 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>
                {settings.newsletterTitle}
              </h2>
              <p className="mb-4 opacity-75" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                {settings.newsletterSubtext}
              </p>
              {subscribed ? (
                <div
                  className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                >
                  <FiSend size={18} /> Thank you for subscribing! 🎉
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="d-flex gap-0 mx-auto" style={{ maxWidth: 460 }}>
                  <input
                    type="email"
                    className="newsletter-input form-control"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Newsletter email"
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </form>
              )}
              <p className="mt-3 mb-0 opacity-60" style={{ fontSize: '0.78rem' }}>
                No spam ever. Unsubscribe at any time.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Floating WhatsApp ──────────────────────────────── */}
      <a
        href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to know more about your products.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Order on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>

    </div>
  );
};

export default Home;
