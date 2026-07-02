/**
 * PaperNest – Admin Product Form (Add & Edit)
 * FREE PLAN VERSION — uses URL-only for images (no Firebase Storage needed).
 * Route: /admin/products/new  OR  /admin/products/:id
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Row, Col, Form } from 'react-bootstrap';
import { FiArrowLeft, FiSave, FiImage } from 'react-icons/fi';
import { getProductById, addProduct, updateProduct } from '../../services/productService';
import { getAllCategoriesAdmin } from '../../services/categoryService';
import type { Product, Category } from '../../types';

type ProductForm = Omit<Product, 'id' | 'createdAt'>;

const EMPTY: ProductForm = {
  title: '', description: '', category: '', categoryLabel: '',
  price: 0, originalPrice: 0, rating: 5, reviews: 0,
  badge: '', badgeType: '', image: '', inStock: true,
  isFeatured: false, whatsappMessage: '',
};

const BADGE_OPTIONS = [
  { label: 'None',        value: '' as Product['badge'],           type: '' as Product['badgeType'] },
  { label: 'New',         value: 'New' as Product['badge'],         type: 'new' as Product['badgeType'] },
  { label: 'Best Seller', value: 'Best Seller' as Product['badge'], type: 'bestseller' as Product['badgeType'] },
  { label: 'Sale',        value: 'Sale' as Product['badge'],        type: 'sale' as Product['badgeType'] },
  { label: 'Featured',    value: 'Featured' as Product['badge'],    type: 'featured' as Product['badgeType'] },
];

// Suggested free image URLs for quick use
const SAMPLE_IMAGES = [
  { label: 'Gel Pens',      url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=500&auto=format&fit=crop' },
  { label: 'Notebook',      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500&auto=format&fit=crop' },
  { label: 'Photo Mug',     url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop' },
  { label: 'Stickers',      url: 'https://images.unsplash.com/photo-1572375995501-4b0894dbe0d1?q=80&w=500&auto=format&fit=crop' },
  { label: 'Keychain',      url: 'https://images.unsplash.com/photo-1548484352-ea579e01314a?q=80&w=500&auto=format&fit=crop' },
  { label: 'Photo Frame',   url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=500&auto=format&fit=crop' },
  { label: 'Washi Tape',    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500&auto=format&fit=crop' },
  { label: 'Diary',         url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=500&auto=format&fit=crop' },
  { label: 'Gift Box',      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop' },
  { label: 'Photo Prints',  url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=500&auto=format&fit=crop' },
  { label: 'Birthday Card', url: 'https://images.unsplash.com/photo-1513135467880-6c41603b87ff?q=80&w=500&auto=format&fit=crop' },
  { label: 'Pen Stand',     url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=500&auto=format&fit=crop' },
];

const AdminProductForm: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id && id !== 'new';
  const navigate = useNavigate();

  const [form,       setForm]       = useState<ProductForm>({ ...EMPTY });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(isEdit);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    getAllCategoriesAdmin().then(setCategories);
    if (isEdit) {
      getProductById(id!).then((p) => {
        if (p) {
          const { id: _id, createdAt: _c, ...rest } = p;
          setForm({ ...EMPTY, ...rest });
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const set = (key: keyof ProductForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    set('category', slug);
    set('categoryLabel', cat?.name ?? slug);
  };

  const handleBadgeChange = (value: string) => {
    const opt = BADGE_OPTIONS.find((o) => o.value === value);
    set('badge', opt?.value ?? '');
    set('badgeType', opt?.type ?? '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id!, { ...form });
      } else {
        await addProduct({ ...form });
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      setError('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm me-2" />
        Loading product…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/admin/products"
          className="btn btn-sm border-0"
          style={{ backgroundColor: '#f0f1f5', color: 'var(--pn-text-dark)' }}
        >
          <FiArrowLeft size={15} />
        </Link>
        <div>
          <h4 className="fw-bold mb-0">{isEdit ? 'Edit Product' : 'Add New Product'}</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
            {isEdit ? `Editing: ${form.title || id}` : 'Create a new product listing'}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.875rem' }}
          role="alert"
        >
          ⚠️ {error}
        </div>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Row className="g-4">

          {/* ── Left Column ──────────────────────────── */}
          <Col lg={8}>

            {/* Basic Info */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
              <h6 className="fw-bold mb-3">Basic Information</h6>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                  Product Title <span style={{ color: 'var(--pn-primary)' }}>*</span>
                </Form.Label>
                <Form.Control
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Pastel Gel Pen Set (10 Pieces)"
                  required
                  style={{ height: 44 }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                  Description <span style={{ color: 'var(--pn-primary)' }}>*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the product…"
                  required
                  style={{ resize: 'vertical', minHeight: 90 }}
                />
              </Form.Group>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                      Category <span style={{ color: 'var(--pn-primary)' }}>*</span>
                    </Form.Label>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                      style={{ height: 44 }}
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Badge</Form.Label>
                    <Form.Select
                      value={form.badge ?? ''}
                      onChange={(e) => handleBadgeChange(e.target.value)}
                      style={{ height: 44 }}
                    >
                      {BADGE_OPTIONS.map((o) => (
                        <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
              <h6 className="fw-bold mb-3">Pricing</h6>
              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                      Selling Price (₹) <span style={{ color: 'var(--pn-primary)' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.price}
                      onChange={(e) => set('price', Number(e.target.value))}
                      required style={{ height: 44 }}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Original / MRP (₹)</Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.originalPrice}
                      onChange={(e) => set('originalPrice', Number(e.target.value))}
                      style={{ height: 44 }}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Rating (1–5)</Form.Label>
                    <Form.Select
                      value={form.rating}
                      onChange={(e) => set('rating', Number(e.target.value))}
                      style={{ height: 44 }}
                    >
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Review Count</Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.reviews}
                      onChange={(e) => set('reviews', Number(e.target.value))}
                      style={{ height: 44 }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* WhatsApp message */}
            <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #f0f1f5' }}>
              <h6 className="fw-bold mb-1">Custom WhatsApp Message</h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Leave blank to use the default auto-generated message.
              </p>
              <Form.Control
                as="textarea" rows={2}
                value={form.whatsappMessage ?? ''}
                onChange={(e) => set('whatsappMessage', e.target.value)}
                placeholder={`Hi! I'd like to order *${form.title || 'Product'}* — ₹${form.price || 0}`}
                style={{ resize: 'vertical', minHeight: 70, fontSize: '0.875rem' }}
              />
            </div>
          </Col>

          {/* ── Right Column ─────────────────────────── */}
          <Col lg={4}>

            {/* Image URL */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
              <h6 className="fw-bold mb-1">Product Image</h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                Paste any image URL (Unsplash, Google Images, etc.)
              </p>

              {/* Preview */}
              <div
                className="rounded-3 overflow-hidden mb-3"
                style={{ height: 160, backgroundColor: '#f5f6f8', border: '1.5px dashed #dde0e8' }}
              >
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x160?text=Invalid+URL'; }}
                  />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <FiImage size={28} className="mb-1" />
                    <span style={{ fontSize: '0.78rem' }}>Paste a URL below</span>
                  </div>
                )}
              </div>

              <Form.Control
                type="url"
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{ height: 40, fontSize: '0.82rem' }}
              />

              {/* Quick-pick sample images */}
              <p className="fw-semibold mt-3 mb-2" style={{ fontSize: '0.78rem', color: 'var(--pn-text-muted)' }}>
                QUICK PICK — click to use:
              </p>
              <div className="d-flex flex-wrap gap-1">
                {SAMPLE_IMAGES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => set('image', s.url)}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      backgroundColor: form.image === s.url ? 'var(--pn-primary)' : '#f0f1f5',
                      color: form.image === s.url ? 'white' : 'var(--pn-text-dark)',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Free plan notice */}
              <div
                className="rounded-3 p-2 mt-3"
                style={{ backgroundColor: '#fff8e1', fontSize: '0.75rem', color: '#e65100' }}
              >
                💡 File upload needs Firebase Storage (paid plan). Use image URLs for free.
              </div>
            </div>

            {/* Flags */}
            <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #f0f1f5' }}>
              <h6 className="fw-bold mb-3">Product Flags</h6>

              {/* In Stock toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-2"
                style={{ backgroundColor: form.inStock ? '#e8f5e9' : '#fdecea', cursor: 'pointer' }}
                onClick={() => set('inStock', !form.inStock)}
                role="checkbox"
                aria-checked={form.inStock}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('inStock', !form.inStock)}
              >
                <span className="fw-semibold" style={{ fontSize: '0.875rem', color: form.inStock ? '#2e7d32' : '#c62828' }}>
                  {form.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
                <div className="rounded-pill" style={{ width: 36, height: 20, backgroundColor: form.inStock ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: form.inStock ? 18 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>

              {/* Featured toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ backgroundColor: form.isFeatured ? '#fff8e1' : '#f5f6f8', cursor: 'pointer' }}
                onClick={() => set('isFeatured', !form.isFeatured)}
                role="checkbox"
                aria-checked={form.isFeatured}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('isFeatured', !form.isFeatured)}
              >
                <span className="fw-semibold" style={{ fontSize: '0.875rem', color: form.isFeatured ? '#e65100' : 'var(--pn-text-muted)' }}>
                  {form.isFeatured ? '★ Featured Product' : 'Not Featured'}
                </span>
                <div className="rounded-pill" style={{ width: 36, height: 20, backgroundColor: form.isFeatured ? '#ff9800' : '#e0e0e0', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: form.isFeatured ? 18 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Submit */}
        <div className="d-flex gap-3 mt-4">
          <button
            type="submit"
            className="btn btn-pink d-flex align-items-center gap-2"
            disabled={saving}
            style={{ fontSize: '0.9rem', height: 46 }}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
              : <><FiSave size={16} /> {isEdit ? 'Save Changes' : 'Add Product'}</>
            }
          </button>
          <Link
            to="/admin/products"
            className="btn border-0 d-flex align-items-center"
            style={{ backgroundColor: '#f0f1f5', color: 'var(--pn-text-dark)', fontSize: '0.9rem', height: 46 }}
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default AdminProductForm;
