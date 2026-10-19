/**
 * CRAFTONEST3D – Admin Work Form (Add & Edit)
 * Image upload: Cloudinary unsigned preset with base64 fallback.
 * The uploaded image URL is saved to Firestore.
 * Route: /admin/products/new  OR  /admin/products/:id
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Row, Col, Form } from 'react-bootstrap';
import { FiArrowLeft, FiSave, FiImage, FiUpload, FiX, FiInfo, FiPlus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getProductById, addProduct, updateProduct } from '../../services/productService';
import { getAllCategoriesAdmin } from '../../services/categoryService';
import { getSiteSettings } from '../../services/settingsService';
import { compressImage } from '../../services/uploadService';
import type { Product, Category } from '../../types';

// Fallback colour list if settings not loaded yet
const FALLBACK_COLOURS = [
  { label: 'Black', hex: '#1C1C1C' }, { label: 'White', hex: '#FFFFFF' },
  { label: 'Grey', hex: '#9E9E9E' }, { label: 'Silver', hex: '#C0C0C0' },
  { label: 'Red', hex: '#E74C3C' }, { label: 'Dark Red', hex: '#B71C1C' },
  { label: 'Orange', hex: '#E67E22' }, { label: 'Yellow', hex: '#F1C40F' },
  { label: 'Gold', hex: '#D4AF37' }, { label: 'Lime', hex: '#CDDC39' },
  { label: 'Green', hex: '#2ECC71' }, { label: 'Dark Green', hex: '#1B5E20' },
  { label: 'Teal', hex: '#009688' }, { label: 'Cyan', hex: '#00BCD4' },
  { label: 'Sky Blue', hex: '#87CEEB' }, { label: 'Blue', hex: '#2196F3' },
  { label: 'Navy', hex: '#1A237E' }, { label: 'Purple', hex: '#9C27B0' },
  { label: 'Violet', hex: '#7E57C2' }, { label: 'Lavender', hex: '#C39BD3' },
  { label: 'Pink', hex: '#FF6B9D' }, { label: 'Magenta', hex: '#E91E63' },
  { label: 'Brown', hex: '#795548' }, { label: 'Beige', hex: '#D7CCC8' },
  { label: 'Rose Gold', hex: '#B76E79' }, { label: 'Copper', hex: '#B87333' },
  { label: 'Glow Green', hex: '#B2FF59' }, { label: 'Transparent', hex: '#E8EAF6' },
];

// ── Cloudinary config ──────────────────────────────────────────────────────
// Update these values when you set up your own Cloudinary account:
// cloudinary.com → Settings → Upload → Add upload preset (unsigned)
const CLOUDINARY_CLOUD_NAME   = 'papernest';
const CLOUDINARY_UPLOAD_PRESET = 'papernest_products';

async function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'craftonest3d/works');

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
        if (res.secure_url) { onProgress(100); resolve(res.secure_url); }
        else reject(new Error(res.error?.message ?? 'Upload failed'));
      } else {
        // Fallback: base64 data URL
        uploadAsBase64(file, onProgress).then(resolve).catch(reject);
      }
    };
    xhr.onerror = () => uploadAsBase64(file, onProgress).then(resolve).catch(reject);
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
}

async function uploadAsBase64(file: File, onProgress: (pct: number) => void): Promise<string> {
  onProgress(20);
  // Compress so the stored string stays under Firestore's ~1MB field limit.
  const dataUrl = await compressImage(file);
  onProgress(100);
  return dataUrl;
}

// ── Types & constants ──────────────────────────────────────────────────────
type ProductForm = Omit<Product, 'id' | 'createdAt'>;

const EMPTY: ProductForm = {
  title: '', description: '', category: '', categoryLabel: '',
  price: 0, originalPrice: 0, rating: 5, reviews: 0,
  badge: '', badgeType: '', image: '', inStock: true,
  isFeatured: false, isBulk: false, isCustomizable: true, colourEnabled: true, availableColours: [], images: [], videoUrl: '', videoEnabled: false, material: '', size: '', sizePrices: {}, sizeOriginalPrices: {}, whatsappMessage: '',
};

const BADGE_OPTIONS: { label: string; value: Product['badge']; type: Product['badgeType'] }[] = [
  { label: 'None',        value: '',           type: '' },
  { label: 'New',         value: 'New',         type: 'new' },
  { label: 'Best Seller', value: 'Best Seller', type: 'bestseller' },
  { label: 'Featured',    value: 'Featured',    type: 'featured' },
  { label: 'Custom',      value: 'Custom',      type: 'custom' },
];

const SAMPLE_IMAGES = [
  { label: 'Keychain',    url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=500&auto=format&fit=crop' },
  { label: 'Miniature',   url: 'https://images.unsplash.com/photo-1635951429464-576e89a47c4f?q=80&w=500&auto=format&fit=crop' },
  { label: 'Toy',         url: 'https://images.unsplash.com/photo-1633113215957-2430e3a5565e?q=80&w=500&auto=format&fit=crop' },
  { label: 'Figurine',    url: 'https://images.unsplash.com/photo-1599909533321-3f9a7a4d3e04?q=80&w=500&auto=format&fit=crop' },
  { label: 'Vase',        url: 'https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=500&auto=format&fit=crop' },
  { label: 'Functional',  url: 'https://images.unsplash.com/photo-1581092919535-ddf2c0a4e0d6?q=80&w=500&auto=format&fit=crop' },
  { label: 'Prototype',   url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=500&auto=format&fit=crop' },
  { label: 'Name Plate',  url: 'https://images.unsplash.com/photo-1606293459339-aa5def1a4f7c?q=80&w=500&auto=format&fit=crop' },
];

// ── Shared input style (light — inside admin white cards) ──────────────────
const inputStyle: React.CSSProperties = {
  height: 44,
  backgroundColor: '#ffffff',
  color: '#0a1128',
  borderColor: '#dde0e8',
};
const textareaStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#0a1128',
  borderColor: '#dde0e8',
  resize: 'vertical',
};

// ── Component ──────────────────────────────────────────────────────────────
const AdminProductForm: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id && id !== 'new';
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [form,       setForm]       = useState<ProductForm>({ ...EMPTY });
  const [palette,    setPalette]    = useState(FALLBACK_COLOURS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(isEdit);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [localPreview,setLocalPreview]= useState('');

  useEffect(() => {
    getAllCategoriesAdmin().then(setCategories);
    getSiteSettings().then((s) => {
      if (s.shopColours && s.shopColours.length > 0) setPalette(s.shopColours);
    });
    if (isEdit) {
      getProductById(id!).then((p) => {
        if (p) {
          const { id: _id, createdAt: _c, ...rest } = p;
          setForm({ ...EMPTY, ...rest });
          setLocalPreview(p.image);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const set = (key: keyof ProductForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Size pricing helpers (selling + original per size) ─────────────
  const sizePrices = form.sizePrices ?? {};
  const sizeOrig   = form.sizeOriginalPrices ?? {};
  const sizeRows   = Object.keys(sizePrices);

  const addSizeRow = () => {
    setForm((prev) => ({
      ...prev,
      sizePrices:         { ...(prev.sizePrices ?? {}), '': 0 },
      sizeOriginalPrices: { ...(prev.sizeOriginalPrices ?? {}), '': 0 },
    }));
  };
  const updateSizeKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    setForm((prev) => {
      const sp: Record<string, number> = {};
      const op: Record<string, number> = {};
      Object.keys(prev.sizePrices ?? {}).forEach((k) => {
        const key = k === oldKey ? newKey : k;
        sp[key] = (prev.sizePrices ?? {})[k];
        op[key] = (prev.sizeOriginalPrices ?? {})[k] ?? 0;
      });
      return { ...prev, sizePrices: sp, sizeOriginalPrices: op };
    });
  };
  const updateSizeSelling = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, sizePrices: { ...(prev.sizePrices ?? {}), [key]: value } }));
  };
  const updateSizeOriginal = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, sizeOriginalPrices: { ...(prev.sizeOriginalPrices ?? {}), [key]: value } }));
  };
  const removeSizeRow = (key: string) => {
    setForm((prev) => {
      const sp = { ...(prev.sizePrices ?? {}) };
      const op = { ...(prev.sizeOriginalPrices ?? {}) };
      delete sp[key];
      delete op[key];
      return { ...prev, sizePrices: sp, sizeOriginalPrices: op };
    });
  };

  const handleCategoryChange = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    set('category', slug);
    set('categoryLabel', cat?.name ?? slug);
  };

  // ── Gallery images (3–5 optional extra photos) ────────────────────
  const gallery = form.images ?? [];
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const addGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (gallery.length >= 5) { setUploadError('Maximum 5 gallery images.'); return; }
    setGalleryUploading(true);
    try {
      const url = await compressImage(file);
      if (url.length > 1_000_000) { setUploadError('That image is too large even after compression — use a smaller one.'); return; }
      set('images', [...gallery, url]);
    } finally {
      setGalleryUploading(false);
      if (galleryRef.current) galleryRef.current.value = '';
    }
  };
  const removeGalleryImage = (i: number) =>
    setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((_, idx) => idx !== i) }));

  // Toggle whether a colour label is available for this product.
  // availableColours undefined/empty = all available.
  const isColourAvailable = (label: string) => {
    const list = form.availableColours;
    return !list || list.length === 0 || list.includes(label);
  };
  const toggleColourAvail = (label: string) => {
    setForm((prev) => {
      const all = palette.map((c) => c.label);
      // Start from current effective list (if empty = all).
      const current = (prev.availableColours && prev.availableColours.length > 0)
        ? prev.availableColours
        : [...all];
      let next: string[];
      if (current.includes(label)) next = current.filter((l) => l !== label);
      else next = [...current, label];
      // If all selected, store empty (= all) to keep it simple.
      return { ...prev, availableColours: next.length === all.length ? [] : next };
    });
  };

  const handleBadgeChange = (value: string) => {
    const opt = BADGE_OPTIONS.find((o) => o.value === value);
    set('badge',     opt?.value ?? '');
    set('badgeType', opt?.type  ?? '');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploadError('');
    setUploading(true);
    setUploadPct(0);
    try {
      const url = await uploadToCloudinary(file, setUploadPct);
      // Firestore caps a field at ~1MB. If the compressed base64 is still too big, warn.
      if (url.startsWith('data:') && url.length > 1_000_000) {
        setUploadError('Image is still too large after compression. Please use a smaller or simpler image (JPG works best), ideally under 1 MB.');
        setLocalPreview(form.image);
        return;
      }
      set('image', url);
      setLocalPreview(url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setLocalPreview(form.image);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) { setError('Please wait for the image to finish uploading.'); return; }
    setError('');
    setSaving(true);
    try {
      if (isEdit) await updateProduct(id!, { ...form });
      else        await addProduct({ ...form });
      navigate('/admin/products');
    } catch (err: unknown) {
      setError('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" /> Loading…
    </div>
  );

  const previewSrc = localPreview || form.image;
  const gold = 'var(--pn-primary)';

  return (
    <div style={{ maxWidth: 900 }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/admin/products"
          className="btn btn-sm border-0 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: '#f0f1f5', color: '#0a1128', width: 36, height: 36, borderRadius: 8 }}
          title="Back to Works"
        >
          <FiArrowLeft size={16} />
        </Link>
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#0a1128' }}>
            {isEdit ? 'Edit Work' : 'Add New Work'}
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
            {isEdit ? `Editing: ${form.title || id}` : 'Create a new portfolio / work entry'}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.875rem' }} role="alert">
          ⚠️ {error}
        </div>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Row className="g-4">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Details
          ══════════════════════════════════════════ */}
          <Col lg={8}>

            {/* ── Basic Information ───────────────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <h6 className="fw-bold mb-3" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Basic Information
              </h6>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                  Work Title <span style={{ color: gold }}>*</span>
                </Form.Label>
                <Form.Control
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Custom Name Keychain"
                  required
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                  Description <span style={{ color: gold }}>*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the work — what was printed, what it is used for…"
                  required
                  style={{ ...textareaStyle, minHeight: 90 }}
                />
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Category <span style={{ color: gold }}>*</span>
                    </Form.Label>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                      style={{ ...inputStyle }}
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
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Badge
                    </Form.Label>
                    <Form.Select
                      value={form.badge ?? ''}
                      onChange={(e) => handleBadgeChange(e.target.value)}
                      style={{ ...inputStyle }}
                    >
                      {BADGE_OPTIONS.map((o) => (
                        <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Material
                    </Form.Label>
                    <Form.Control
                      value={form.material ?? ''}
                      onChange={(e) => set('material', e.target.value)}
                      placeholder="e.g. PLA, PETG, Resin"
                      style={inputStyle}
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      3D-printing material used.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Size
                    </Form.Label>
                    <Form.Control
                      value={form.size ?? ''}
                      onChange={(e) => set('size', e.target.value)}
                      placeholder="e.g. 60mm, 100mm tall"
                      style={inputStyle}
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Physical dimensions of the print.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* ── Pricing / Quote ─────────────────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="fw-bold mb-0" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Pricing
                </h6>
                <span
                  className="rounded-pill px-2"
                  style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: 'rgba(212,175,55,0.12)', color: gold, border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  Optional
                </span>
              </div>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <FiInfo size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                Leave price at 0 to show "Quote on request" to customers. Set a price only if you have a fixed rate.
              </p>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Price (₹) — 0 = Quote
                    </Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.price}
                      onChange={(e) => set('price', Number(e.target.value))}
                      style={inputStyle}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Original Price (₹)
                    </Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.originalPrice}
                      onChange={(e) => set('originalPrice', Number(e.target.value))}
                      style={inputStyle}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Rating (1–5)
                    </Form.Label>
                    <Form.Select
                      value={form.rating}
                      onChange={(e) => set('rating', Number(e.target.value))}
                      style={{ ...inputStyle }}
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} ★</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: '#0a1128' }}>
                      Review Count
                    </Form.Label>
                    <Form.Control
                      type="number" min={0}
                      value={form.reviews}
                      onChange={(e) => set('reviews', Number(e.target.value))}
                      style={inputStyle}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* ── Size-Based Pricing ──────────────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="fw-bold mb-0" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Size-Based Pricing
                </h6>
                <span className="rounded-pill px-2" style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: 'rgba(212,175,55,0.12)', color: '#b8941f' }}>
                  Optional
                </span>
              </div>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <FiInfo size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                Set <strong>Original (MRP)</strong> and <strong>Selling (offer)</strong> price for each size. Customer sees the MRP struck through and the offer price + discount %. Leave empty to use the single price above.
              </p>

              {sizeRows.length > 0 && (
                <div className="mb-3">
                  {/* Column labels */}
                  <Row className="g-2 mb-1">
                    <Col xs={4}><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5c677d' }}>SIZE</span></Col>
                    <Col xs={4}><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5c677d' }}>MRP ₹ (higher)</span></Col>
                    <Col xs={3}><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b8941f' }}>OFFER ₹ (lower)</span></Col>
                    <Col xs={1}></Col>
                  </Row>
                  {sizeRows.map((key, idx) => {
                    const selling = sizePrices[key];
                    const orig    = sizeOrig[key] ?? 0;
                    const discount = orig > selling && orig > 0 ? Math.round(((orig - selling) / orig) * 100) : 0;
                    return (
                      <Row className="g-2 mb-2 align-items-center" key={idx}>
                        <Col xs={4}>
                          <Form.Control
                            placeholder="3cm"
                            defaultValue={key}
                            onBlur={(e) => updateSizeKey(key, e.target.value.trim())}
                            style={{ ...inputStyle, height: 40 }}
                          />
                        </Col>
                        <Col xs={4}>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#f0f1f5', color: '#5c677d', border: '1px solid #dde0e8', fontSize: '0.8rem' }}>₹</span>
                            <Form.Control
                              type="number" min={0}
                              value={orig}
                              onChange={(e) => updateSizeOriginal(key, Number(e.target.value))}
                              style={{ ...inputStyle, height: 40 }}
                              title="Original / MRP price"
                            />
                          </div>
                        </Col>
                        <Col xs={3}>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#fff8e1', color: '#b8941f', border: '1px solid #dde0e8', fontSize: '0.8rem' }}>₹</span>
                            <Form.Control
                              type="number" min={0}
                              value={selling}
                              onChange={(e) => updateSizeSelling(key, Number(e.target.value))}
                              style={{ ...inputStyle, height: 40 }}
                              title="Selling / offer price"
                            />
                          </div>
                        </Col>
                        <Col xs={1}>
                          <button
                            type="button"
                            onClick={() => removeSizeRow(key)}
                            className="btn btn-sm w-100 d-flex align-items-center justify-content-center p-0"
                            style={{ backgroundColor: '#fdecea', color: '#c62828', border: 'none', height: 40 }}
                          >
                            <FiX size={15} />
                          </button>
                        </Col>
                        {discount > 0 && (
                          <Col xs={12}>
                            <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 700 }}>
                              {key}: {discount}% OFF (₹{orig} → ₹{selling})
                            </span>
                          </Col>
                        )}
                        {orig > 0 && selling > 0 && selling >= orig && (
                          <Col xs={12}>
                            <span style={{ fontSize: '0.72rem', color: '#c62828', fontWeight: 700 }}>
                              ⚠️ Offer (₹{selling}) must be LOWER than MRP (₹{orig}) to show a discount. Swap the values — MRP is the higher original price, Offer is the lower selling price.
                            </span>
                          </Col>
                        )}
                      </Row>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={addSizeRow}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#b8941f', border: '1.5px solid #d4af37', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', padding: '7px 14px' }}
              >
                <FiPlus size={14} /> Add Size & Price
              </button>
            </div>

            {/* ── Sample Video ─────────────────────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <h6 className="fw-bold mb-1" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                🎬 Sample Video <span style={{ fontSize: '0.68rem', color: '#8a8f99', fontWeight: 600 }}>(optional)</span>
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Paste a <strong>YouTube link</strong> (upload your sample to YouTube — free) or a direct <strong>.mp4</strong> URL. When enabled, a “Watch Sample” video shows in the product popup.
              </p>

              {/* On/off toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3"
                style={{ backgroundColor: form.videoEnabled ? '#e8f5e9' : '#f8f9fc', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => set('videoEnabled', !form.videoEnabled)}
                role="checkbox" aria-checked={!!form.videoEnabled} tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('videoEnabled', !form.videoEnabled)}
              >
                <span className="fw-semibold" style={{ fontSize: '0.875rem', color: form.videoEnabled ? '#2e7d32' : '#5c677d' }}>
                  {form.videoEnabled ? '✓ Sample video shown on shop' : 'Sample video hidden'}
                </span>
                <div className="rounded-pill" style={{ width: 40, height: 22, backgroundColor: form.videoEnabled ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: form.videoEnabled ? 20 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>

              <Form.Control
                value={form.videoUrl ?? ''}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="https://youtu.be/XXXX  or  https://…/sample.mp4"
                style={{ ...inputStyle, height: 42 }}
              />
            </div>

            {/* ── Gallery Images (3–5 optional) ────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <h6 className="fw-bold mb-1" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                🖼️ Gallery Images <span style={{ fontSize: '0.68rem', color: '#8a8f99', fontWeight: 600 }}>(optional, up to 5)</span>
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Add a few more photos (different angles / colours). Customers can swipe through them on the product. The main image above stays the cover.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {gallery.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 84, height: 84, borderRadius: 8, overflow: 'hidden', border: '1px solid #e3e6ec' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeGalleryImage(i); }}
                      title="Remove this photo"
                      style={{
                        position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: '50%',
                        background: '#c62828', color: '#fff', border: '2px solid #fff', fontSize: '1rem',
                        cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)', zIndex: 2, padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
              <input ref={galleryRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={addGalleryImage} hidden />
              <button type="button" onClick={() => galleryRef.current?.click()} disabled={galleryUploading || gallery.length >= 5}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: '#0a1128', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8, opacity: gallery.length >= 5 ? 0.5 : 1 }}>
                {galleryUploading ? 'Uploading…' : <><FiUpload size={14} /> Add Photo ({gallery.length}/5)</>}
              </button>
            </div>

            {/* ── Custom WhatsApp Message ──────────── */}
            <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #e8eaed' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="fw-bold mb-0" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Custom WhatsApp Message
                </h6>
                <span
                  className="rounded-pill px-2"
                  style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                >
                  Optional
                </span>
              </div>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Leave blank to use the default message generated from the work title and category.
              </p>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.whatsappMessage ?? ''}
                onChange={(e) => set('whatsappMessage', e.target.value)}
                placeholder={`Hi CRAFTONEST3D! 👋\n\nI'm interested in: *${form.title || 'your work'}*\nCategory: ${form.categoryLabel || '…'}\n\nCould you share pricing and details?`}
                style={{ ...textareaStyle, minHeight: 80, fontSize: '0.875rem' }}
              />
              <div className="d-flex align-items-center gap-2 mt-2 p-2 rounded-3" style={{ backgroundColor: '#e8f8ee', fontSize: '0.78rem', color: '#2e7d32' }}>
                <FaWhatsapp size={14} />
                This message opens when a customer clicks Enquire on this work.
              </div>
            </div>
          </Col>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Image + Flags
          ══════════════════════════════════════════ */}
          <Col lg={4}>

            {/* ── Work Image ──────────────────────── */}
            <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #e8eaed' }}>
              <h6 className="fw-bold mb-1" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Work Image
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                Upload from device or paste a URL.
              </p>

              {/* Preview / Drop Zone */}
              <div
                className="rounded-3 overflow-hidden mb-3 d-flex align-items-center justify-content-center"
                style={{
                  height: 180,
                  backgroundColor: '#f8f9fc',
                  border: `2px dashed ${previewSrc ? gold : '#dde0e8'}`,
                  cursor: uploading ? 'wait' : 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => !uploading && fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !uploading && fileRef.current?.click()}
                aria-label="Click to upload image"
              >
                {previewSrc ? (
                  <>
                    <img
                      src={previewSrc}
                      alt="Work preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = ''; setLocalPreview(''); }}
                    />
                    {!uploading && (
                      <div
                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
                      >
                        <span className="text-white fw-bold" style={{ fontSize: '0.82rem', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                          Click to change
                        </span>
                      </div>
                    )}
                    {/* Gold corner accent when image present */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0,
                      borderStyle: 'solid', borderWidth: '0 28px 28px 0',
                      borderColor: `transparent ${gold} transparent transparent` }} />
                  </>
                ) : (
                  <div className="text-center" style={{ color: '#9a9a9a' }}>
                    <FiImage size={36} className="mb-2" />
                    <p className="mb-0 fw-semibold" style={{ fontSize: '0.82rem' }}>Click to upload</p>
                    <p className="mb-0" style={{ fontSize: '0.72rem' }}>JPG · PNG · WebP — max 5 MB</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '0.78rem', color: gold, fontWeight: 600 }}>Uploading…</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0a1128' }}>{uploadPct}%</span>
                  </div>
                  <div className="progress" style={{ height: 4, borderRadius: 4, backgroundColor: '#e8eaed' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${uploadPct}%`, backgroundColor: gold, transition: 'width 0.3s ease' }}
                      aria-valuenow={uploadPct} aria-valuemin={0} aria-valuemax={100}
                    />
                  </div>
                </div>
              )}

              {/* Upload error */}
              {uploadError && (
                <div className="rounded-3 p-2 mb-3 d-flex align-items-start gap-2"
                  style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.78rem' }}>
                  ⚠️ {uploadError}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="d-none"
                onChange={handleFileChange}
                aria-label="Upload image file"
              />

              {/* Action buttons */}
              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    color: gold,
                    border: `1.5px solid ${gold}`,
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    height: 40,
                  }}
                >
                  {uploading
                    ? <><span className="spinner-border spinner-border-sm" /> Uploading…</>
                    : <><FiUpload size={15} /> Upload from Device</>
                  }
                </button>
                {previewSrc && (
                  <button
                    type="button"
                    onClick={() => { set('image', ''); setLocalPreview(''); setUploadError(''); }}
                    className="btn border-0 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#fdecea', color: '#c62828', borderRadius: 8, width: 40, height: 40, flexShrink: 0 }}
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>

              {/* URL paste */}
              <p className="text-muted mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Or paste URL:
              </p>
              <Form.Control
                type="url"
                value={form.image}
                onChange={(e) => { set('image', e.target.value); setLocalPreview(e.target.value); }}
                placeholder="https://images.unsplash.com/…"
                style={{ height: 38, fontSize: '0.82rem', backgroundColor: '#ffffff', color: '#0a1128', borderColor: '#dde0e8' }}
              />

              {/* Sample picks */}
              <p className="fw-bold mt-3 mb-2" style={{ fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quick samples:
              </p>
              <div className="d-flex flex-wrap gap-1">
                {SAMPLE_IMAGES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => { set('image', s.url); setLocalPreview(s.url); }}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.68rem',
                      padding: '3px 8px',
                      backgroundColor: form.image === s.url ? gold : '#f0f1f5',
                      color: form.image === s.url ? '#0a0a0a' : '#5c677d',
                      border: 'none',
                      borderRadius: 5,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Info note */}
              <div className="rounded-3 p-2 mt-3 d-flex align-items-start gap-2"
                style={{ backgroundColor: '#e8f4ff', fontSize: '0.72rem', color: '#0062cc', lineHeight: 1.5 }}>
                <span style={{ marginTop: 1, flexShrink: 0 }}>💡</span>
                <span>Images upload to Cloudinary (free). Replace sample images with your actual 3D print photos for best results.</span>
              </div>
            </div>

            {/* ── Work Flags ──────────────────────── */}
            <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #e8eaed' }}>
              <h6 className="fw-bold mb-3" style={{ color: '#0a1128', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Work Flags
              </h6>

              {/* Available toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-2"
                style={{ backgroundColor: form.inStock ? '#e8f5e9' : '#fdecea', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => set('inStock', !form.inStock)}
                role="checkbox"
                aria-checked={form.inStock}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('inStock', !form.inStock)}
              >
                <div>
                  <p className="fw-semibold mb-0" style={{ fontSize: '0.875rem', color: form.inStock ? '#2e7d32' : '#c62828' }}>
                    {form.inStock ? '✓ Available' : '✗ Unavailable'}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.72rem', color: form.inStock ? '#4caf50' : '#e57373' }}>
                    {form.inStock ? 'Customers can enquire' : 'Hidden from enquiry flow'}
                  </p>
                </div>
                <div
                  className="rounded-pill"
                  style={{ width: 40, height: 22, backgroundColor: form.inStock ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    position: 'absolute', top: 2, left: form.inStock ? 20 : 2, transition: 'left 0.2s ease',
                  }} />
                </div>
              </div>

              {/* Featured toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ backgroundColor: form.isFeatured ? '#fff8e1' : '#f8f9fc', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => set('isFeatured', !form.isFeatured)}
                role="checkbox"
                aria-checked={form.isFeatured}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('isFeatured', !form.isFeatured)}
              >
                <div>
                  <p className="fw-semibold mb-0" style={{ fontSize: '0.875rem', color: form.isFeatured ? '#e65100' : '#5c677d' }}>
                    {form.isFeatured ? '★ Featured Work' : 'Not Featured'}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.72rem', color: form.isFeatured ? '#ff9800' : '#9a9a9a' }}>
                    {form.isFeatured ? 'Shown on Home page' : 'Portfolio only'}
                  </p>
                </div>
                <div
                  className="rounded-pill"
                  style={{ width: 40, height: 22, backgroundColor: form.isFeatured ? '#ff9800' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    position: 'absolute', top: 2, left: form.isFeatured ? 20 : 2, transition: 'left 0.2s ease',
                  }} />
                </div>
              </div>

              {/* Bulk / wholesale toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3 mt-2"
                style={{ backgroundColor: form.isBulk ? '#e3f2fd' : '#f8f9fc', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => set('isBulk', !form.isBulk)}
                role="checkbox"
                aria-checked={!!form.isBulk}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('isBulk', !form.isBulk)}
              >
                <div>
                  <p className="fw-semibold mb-0" style={{ fontSize: '0.875rem', color: form.isBulk ? '#1565c0' : '#5c677d' }}>
                    {form.isBulk ? '📦 Bulk / Wholesale Item' : 'Regular Item'}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.72rem', color: form.isBulk ? '#1e88e5' : '#9a9a9a' }}>
                    {form.isBulk ? 'Batch dropdown + Enquire-only (no cart)' : 'Single item: Add to Cart + Order Now'}
                  </p>
                </div>
                <div
                  className="rounded-pill"
                  style={{ width: 40, height: 22, backgroundColor: form.isBulk ? '#1e88e5' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    position: 'absolute', top: 2, left: form.isBulk ? 20 : 2, transition: 'left 0.2s ease',
                  }} />
                </div>
              </div>

              {/* Personalized / Customizable toggle */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3 mt-2"
                style={{ backgroundColor: form.isCustomizable ? '#f3e5f5' : '#f8f9fc', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => set('isCustomizable', !form.isCustomizable)}
                role="checkbox" aria-checked={!!form.isCustomizable} tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && set('isCustomizable', !form.isCustomizable)}
              >
                <div>
                  <p className="fw-semibold mb-0" style={{ fontSize: '0.875rem', color: form.isCustomizable ? '#7b1fa2' : '#5c677d' }}>
                    {form.isCustomizable ? '✏️ Personalized (name/text)' : 'Not Personalized'}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.72rem', color: form.isCustomizable ? '#9c27b0' : '#9a9a9a' }}>
                    {form.isCustomizable ? 'Customer enters name, font & colour' : 'Ready-made — order directly, no name needed'}
                  </p>
                </div>
                <div className="rounded-pill" style={{ width: 40, height: 22, backgroundColor: form.isCustomizable ? '#9c27b0' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', position: 'absolute', top: 2, left: form.isCustomizable ? 20 : 2, transition: 'left 0.2s ease' }} />
                </div>
              </div>

              {/* Colour picker toggle — INDEPENDENT of personalized (works for any product) */}
              {(() => {
                const colourOn = form.colourEnabled !== false;
                return (
                  <div
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 mt-2"
                    style={{ backgroundColor: colourOn ? '#e8f5e9' : '#f8f9fc', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => set('colourEnabled', !colourOn)}
                    role="checkbox" aria-checked={colourOn} tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') set('colourEnabled', !colourOn); }}
                  >
                    <div>
                      <p className="fw-semibold mb-0" style={{ fontSize: '0.875rem', color: colourOn ? '#2e7d32' : '#5c677d' }}>
                        {colourOn ? '🎨 Colour options ON' : 'Colour options OFF'}
                      </p>
                      <p className="mb-0" style={{ fontSize: '0.72rem', color: colourOn ? '#4caf50' : '#9a9a9a' }}>
                        {colourOn ? 'Customer picks a colour (works with or without name)' : 'No colour choice shown'}
                      </p>
                    </div>
                    <div className="rounded-pill" style={{ width: 40, height: 22, backgroundColor: colourOn ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', position: 'absolute', top: 2, left: colourOn ? 20 : 2, transition: 'left 0.2s ease' }} />
                    </div>
                  </div>
                );
              })()}

              {/* Which colours are available for THIS product */}
              {form.colourEnabled !== false && (
                <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#faf7ff', border: '1px solid #ece3f5' }}>
                  <p className="fw-semibold mb-1" style={{ fontSize: '0.8rem', color: '#5c677d' }}>Available colours for this item</p>
                  <p className="mb-2" style={{ fontSize: '0.7rem', color: '#9a9a9a' }}>
                    Tap to turn colours on/off. Unavailable ones show a ✕ to the customer. (All on = all available.)
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {palette.map((c) => {
                      const on = isColourAvailable(c.label);
                      return (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => toggleColourAvail(c.label)}
                          title={`${c.label} — ${on ? 'available' : 'not available'}`}
                          style={{
                            position: 'relative', width: 30, height: 30, borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: c.hex.toUpperCase() === '#FFFFFF' ? '1px solid #ccc' : '1px solid transparent',
                            cursor: 'pointer', opacity: on ? 1 : 0.4,
                            boxShadow: on ? '0 0 0 2px #9c27b0' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {!on && <span style={{ position: 'absolute', color: '#fff', fontWeight: 900, fontSize: '1rem', textShadow: '0 0 2px #000' }}>✕</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </Col>
        </Row>

        {/* ── Submit bar ──────────────────────────── */}
        <div
          className="d-flex align-items-center gap-3 mt-4 p-4 rounded-4"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e8eaed' }}
        >
          <button
            type="submit"
            className="btn d-flex align-items-center gap-2 fw-bold"
            disabled={saving || uploading}
            style={{
              backgroundColor: gold,
              color: '#0a0a0a',
              border: 'none',
              fontSize: '0.9rem',
              height: 46,
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              borderRadius: 8,
            }}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
              : <><FiSave size={16} /> {isEdit ? 'Save Changes' : 'Add Work'}</>
            }
          </button>

          <Link
            to="/admin/products"
            className="btn border-0 d-flex align-items-center fw-semibold"
            style={{ backgroundColor: '#f0f1f5', color: '#5c677d', fontSize: '0.9rem', height: 46, paddingLeft: '1.5rem', paddingRight: '1.5rem', borderRadius: 8 }}
          >
            Cancel
          </Link>

          {isEdit && (
            <p className="mb-0 ms-auto text-muted" style={{ fontSize: '0.78rem' }}>
              Last modified via admin panel
            </p>
          )}
        </div>
      </Form>
    </div>
  );
};

export default AdminProductForm;
