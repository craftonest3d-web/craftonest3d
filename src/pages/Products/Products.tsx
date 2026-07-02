/**
 * PaperNest – Products Page
 * Features: search, category filter, product cards with WhatsApp order button.
 * Data is loaded from productService (Firestore-ready).
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiX, FiStar, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { Product } from '../../types';
import { getAllProducts, buildWhatsAppOrderUrl } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../types';
import { DEFAULT_SETTINGS } from '../../services/settingsService';
import { useCart } from '../../contexts/CartContext';

const WA_NUMBER = DEFAULT_SETTINGS.whatsappNumber;

// ── Star Rating ────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="d-flex text-warning" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={13}
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
    <div className="position-relative overflow-hidden" style={{ height: 210 }}>
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
      <p className="mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--pn-primary)' }}>
        {product.categoryLabel}
      </p>
      <h6 className="fw-bold mb-2" style={{ fontSize: '0.875rem', lineHeight: 1.4, minHeight: 38 }}>
        {product.title}
      </h6>
      <p className="text-muted mb-2" style={{ fontSize: '0.8rem', lineHeight: 1.5, flexGrow: 1 }}>
        {product.description.length > 80 ? product.description.slice(0, 80) + '…' : product.description}
      </p>
      <div className="d-flex align-items-center gap-2 mb-2">
        <StarRating rating={product.rating} />
        <span className="text-muted" style={{ fontSize: '0.73rem' }}>({product.reviews})</span>
      </div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="fw-bold fs-6">₹{product.price}</span>
        {product.originalPrice > product.price && (
          <>
            <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.8rem' }}>
              ₹{product.originalPrice}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ee5253' }}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
            </span>
          </>
        )}
      </div>
      <div className="d-flex gap-2 mt-auto">
        <a
          href={buildWhatsAppOrderUrl(product, WA_NUMBER)}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-order-btn flex-grow-1"
          aria-label={`Order ${product.title} on WhatsApp`}
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

// ── Products Page ──────────────────────────────────────────────────────────
export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Controlled filter state (read initial values from URL)
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? 'all');

  // Load data
  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()]).then(([prods, cats]) => {
      setAllProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  // Sync filters → URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (activeCategory !== 'all') params['category'] = activeCategory;
    setSearchParams(params, { replace: true });
  }, [search, activeCategory, setSearchParams]);

  // Sync URL params → filter state (back/forward navigation)
  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setActiveCategory(searchParams.get('category') ?? 'all');
  }, [searchParams]);

  const clearSearch = useCallback(() => setSearch(''), []);

  // Filtered products
  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allProducts, activeCategory, search]);

  return (
    <>
      {/* ── Page Hero ──────────────────────────────────── */}
      <div className="page-hero" aria-label="Products page header">
        <Container>
          <div className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <FiShoppingBag size={24} style={{ color: 'var(--pn-primary)' }} />
              <h1 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>Our Collection</h1>
            </div>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              Explore our curated range of premium stationery and personalized gifts.
            </p>
            <nav aria-label="Breadcrumb" className="mt-2">
              <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.82rem' }}>
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active">Shop</li>
              </ol>
            </nav>
          </div>
        </Container>
      </div>

      <div className="py-5" style={{ backgroundColor: 'var(--pn-bg-section)' }}>
        <Container>

          {/* ── Search Bar ────────────────────────────────── */}
          <Row className="mb-4">
            <Col lg={6} className="mx-auto">
              <Form onSubmit={(e) => e.preventDefault()}>
                <InputGroup style={{ borderRadius: 'var(--pn-radius-sm)', overflow: 'hidden', border: '1.5px solid #dde0e8', backgroundColor: 'white' }}>
                  <span className="input-group-text border-0 bg-white ps-3">
                    <FiSearch size={17} style={{ color: 'var(--pn-text-muted)' }} />
                  </span>
                  <Form.Control
                    placeholder="Search products…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 shadow-none"
                    style={{ height: 46, fontSize: '0.9rem' }}
                    aria-label="Search products"
                  />
                  {search && (
                    <Button
                      variant="link"
                      className="border-0 text-muted px-3"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      <FiX size={16} />
                    </Button>
                  )}
                </InputGroup>
              </Form>
            </Col>
          </Row>

          {/* ── Category Filter Pills ──────────────────────── */}
          <div className="d-flex flex-wrap gap-2 mb-5 justify-content-center" role="group" aria-label="Category filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-pill${activeCategory === cat.slug ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
                aria-pressed={activeCategory === cat.slug}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* ── Results Header ─────────────────────────────── */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              {loading
                ? 'Loading products…'
                : `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}${search ? ` for "${search}"` : ''}${activeCategory !== 'all' ? ` in ${categories.find(c => c.slug === activeCategory)?.name ?? activeCategory}` : ''}`
              }
            </p>
            {(search || activeCategory !== 'all') && (
              <button
                className="filter-pill"
                onClick={() => { clearSearch(); setActiveCategory('all'); }}
              >
                <FiX size={13} /> Clear Filters
              </button>
            )}
          </div>

          {/* ── Product Grid ───────────────────────────────── */}
          {loading ? (
            <Row className="g-4">
              {[...Array(8)].map((_, i) => (
                <Col xs={12} sm={6} md={4} lg={3} key={i}>
                  <div className="card-custom" style={{ minHeight: 340 }}>
                    <div style={{ height: 210, backgroundColor: '#f0f1f5', borderRadius: '12px 12px 0 0' }} />
                    <div className="p-3">
                      <div style={{ height: 12, backgroundColor: '#f5f6f8', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, backgroundColor: '#f5f6f8', borderRadius: 4, width: '60%' }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <FiShoppingBag size={48} style={{ color: '#dde0e8' }} className="mb-3" />
              <h4 className="fw-bold mb-2">No products found</h4>
              <p className="text-muted mb-4">
                Try a different search term or browse all categories.
              </p>
              <button className="btn btn-pink" onClick={() => { clearSearch(); setActiveCategory('all'); }}>
                View All Products
              </button>
            </div>
          ) : (
            <Row className="g-4">
              {filtered.map((product) => (
                <Col xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}

        </Container>
      </div>

      {/* ── Floating WhatsApp ──────────────────────────────── */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi! I want to enquire about your products.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Order on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>
    </>
  );
};

export default Products;
