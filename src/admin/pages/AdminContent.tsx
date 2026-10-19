/**
 * CRAFTONEST3D – Admin Content Manager
 * Control all visible text and images from one place.
 * Saves to Firestore settings/general — live on site immediately.
 */
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FiSave, FiCheckCircle, FiChevronDown, FiChevronUp, FiImage, FiUpload } from 'react-icons/fi';
import { getSiteSettings, saveSiteSettings } from '../../services/settingsService';
import { uploadImage } from '../../services/uploadService';
import type { SiteSettings, HeroSlide, PromoBanner } from '../../types';

// ── Upload image field (PNG / JPG / GIF) ────────────────────────────────────
const UploadImageField: React.FC<{ label: string; value: string; onChange: (v: string) => void; helpText?: string }> = ({
  label, value, onChange, helpText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const ref = React.useRef<HTMLInputElement>(null);

  const [err, setErr] = useState('');
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setUploading(true);
    setPct(0);
    try {
      const url = await uploadImage(file, setPct, 'craftonest3d/festival');
      // Firestore field limit is ~1MB. If it's a base64 data URL that's too big, warn.
      if (url.startsWith('data:') && url.length > 1_000_000) {
        setErr('This image is too large to save. Please compress it (try tinypng.com, or ezgif.com for GIFs) to under ~700 KB and upload again.');
        return;
      }
      onChange(url);
    } catch {
      setErr('Upload failed. Please try a smaller image.');
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>{label}</Form.Label>
      {value && (
        <div className="rounded-3 overflow-hidden mb-2" style={{ maxHeight: 160, border: '1px solid #eee' }}>
          <img src={value} alt="" style={{ width: '100%', objectFit: 'contain', maxHeight: 160 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} hidden />
      <div className="d-flex gap-2">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{ backgroundColor: '#0a1128', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8 }}>
          {uploading ? <>Uploading… {pct}%</> : <><FiUpload size={14} /> Upload PNG / GIF</>}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="btn btn-sm" style={{ backgroundColor: '#fdecea', color: '#c62828', border: 'none', fontWeight: 700, fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8 }}>
            Remove
          </button>
        )}
      </div>
      <div className="input-group mt-2">
        <span className="input-group-text border-end-0 bg-white"><FiImage size={14} style={{ color: 'var(--pn-text-muted)' }} /></span>
        <Form.Control type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL" className="border-start-0" style={{ height: 40, fontSize: '0.85rem' }} />
      </div>
      {err && <div className="mt-2 p-2 rounded-2" style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.76rem' }}>⚠️ {err}</div>}
      {helpText && <Form.Text className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>{helpText}</Form.Text>}
    </Form.Group>
  );
};

// ── Collapsible section ────────────────────────────────────────────────────
const Section: React.FC<{ title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title, icon, children, defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-4 mb-4" style={{ border: '1px solid #f0f1f5', overflow: 'hidden' }}>
      <button
        type="button"
        className="w-100 d-flex align-items-center justify-content-between p-4 border-0 bg-transparent"
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer' }}
      >
        <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
          <span>{icon}</span> {title}
        </span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

// ── Image URL field with preview ───────────────────────────────────────────
const ImageField: React.FC<{ label: string; value: string; onChange: (v: string) => void; helpText?: string }> = ({
  label, value, onChange, helpText,
}) => (
  <Form.Group className="mb-3">
    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>{label}</Form.Label>
    {value && (
      <div className="rounded-3 overflow-hidden mb-2" style={{ height: 100 }}>
        <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
    )}
    <div className="input-group">
      <span className="input-group-text border-end-0 bg-white"><FiImage size={14} style={{ color: 'var(--pn-text-muted)' }} /></span>
      <Form.Control type="url" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="https://images.unsplash.com/…" className="border-start-0"
        style={{ height: 40, fontSize: '0.85rem' }} />
    </div>
    {helpText && <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>{helpText}</Form.Text>}
  </Form.Group>
);

// ── Text field helper ──────────────────────────────────────────────────────
const TextField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }> = ({
  label, value, onChange, placeholder, rows,
}) => (
  <Form.Group className="mb-3">
    <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>{label}</Form.Label>
    {rows ? (
      <Form.Control as="textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} style={{ resize: 'vertical', minHeight: rows * 28, fontSize: '0.875rem' }} />
    ) : (
      <Form.Control value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} style={{ height: 42, fontSize: '0.875rem' }} />
    )}
  </Form.Group>
);

// ── Main component ─────────────────────────────────────────────────────────
const AdminContent: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getSiteSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);

  const setHero = (idx: number, field: keyof HeroSlide, value: string) =>
    setSettings((prev) => {
      if (!prev) return prev;
      const slides = [...prev.heroSlides];
      slides[idx] = { ...slides[idx], [field]: value };
      return { ...prev, heroSlides: slides };
    });

  const setPromo = (idx: number, field: keyof PromoBanner, value: string) =>
    setSettings((prev) => {
      if (!prev) return prev;
      const banners = [...prev.promoBanners];
      banners[idx] = { ...banners[idx], [field]: value };
      return { ...prev, promoBanners: banners };
    });

  const DEFAULT_FEST = {
    enabled: false, image: '', title: 'Happy Festival! 🎉',
    message: 'Special festive offer on all custom pencil toppers!',
    buttonText: 'Shop Offers', buttonLink: '/shop',
    showPopup: true, showBanner: true, accent: '#d4af37',
  };
  const fest = settings?.festival ?? DEFAULT_FEST;
  const setFest = (field: keyof typeof DEFAULT_FEST, value: string | boolean) =>
    setSettings((prev) => prev ? { ...prev, festival: { ...DEFAULT_FEST, ...(prev.festival ?? {}), [field]: value } } : prev);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setError('');
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError('Save failed: ' + (err instanceof Error ? err.message : 'Unknown'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" /> Loading content…
    </div>
  );
  if (!settings) return null;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Content Manager</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
          Edit all text, headings and images visible on the site. Changes save to Firestore and go live immediately.
        </p>
      </div>

      {error && (
        <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}
      {saved && (
        <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.875rem' }}>
          <FiCheckCircle size={16} /> Content saved and live on store!
        </div>
      )}

      <Form onSubmit={handleSave} noValidate>

        {/* ── SITE LOGO ────────────────────────────────── */}
        <Section title="Site Logo" icon="⭐" defaultOpen>
          <UploadImageField
            label="Logo Image (PNG with transparent background works best)"
            value={settings.siteLogo ?? ''}
            onChange={(v) => set('siteLogo', v)}
            helpText="Shown in the site header with a premium 3D hover + gold-shine effect. Leave empty to use the default icon."
          />
          <label className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showLogoText !== false}
              onChange={(e) => set('showLogoText', e.target.checked)}
            />
            Show the “CRAFTONEST3D” text next to the logo
          </label>
          <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.75rem' }}>
            Tip: keep the text ON so customers clearly see your brand name, since the logo mark alone may not spell it out.
          </p>
        </Section>

        {/* ── HERO SLIDE 1 ─────────────────────────────── */}
        <Section title="Hero Banner – Slide 1" icon="🖼️" defaultOpen>
          <Row className="g-3">
            <Col sm={6}>
              <TextField label="Badge Text" value={settings.heroSlides[0]?.badge ?? ''}
                onChange={(v) => setHero(0, 'badge', v)} placeholder="✨ Custom 3D Printing Studio" />
            </Col>
            <Col sm={6}>
              <TextField label="Background Color" value={settings.heroSlides[0]?.bgColor ?? ''}
                onChange={(v) => setHero(0, 'bgColor', v)} placeholder="#fff0f3" />
            </Col>
            <Col sm={6}>
              <TextField label="Main Heading" value={settings.heroSlides[0]?.heading ?? ''}
                onChange={(v) => setHero(0, 'heading', v)} placeholder="CRAFTONEST3D" />
            </Col>
            <Col sm={6}>
              <TextField label="Highlighted Heading (gold text)" value={settings.heroSlides[0]?.headingHighlight ?? ''}
                onChange={(v) => setHero(0, 'headingHighlight', v)} placeholder="Where Ideas Take Shape" />
            </Col>
            <Col xs={12}>
              <TextField label="Sub Text" value={settings.heroSlides[0]?.subtext ?? ''}
                onChange={(v) => setHero(0, 'subtext', v)} rows={2} placeholder="From imagination to reality — we turn your ideas into high-quality 3D prints." />
            </Col>
            <Col sm={6}>
              <TextField label="Button Text" value={settings.heroSlides[0]?.buttonText ?? ''}
                onChange={(v) => setHero(0, 'buttonText', v)} placeholder="Shop Now" />
            </Col>
            <Col sm={6}>
              <TextField label="Button Link" value={settings.heroSlides[0]?.buttonLink ?? ''}
                onChange={(v) => setHero(0, 'buttonLink', v)} placeholder="/our-work" />
            </Col>
            <Col xs={12}>
              <ImageField label="Hero Image URL" value={settings.heroSlides[0]?.image ?? ''}
                onChange={(v) => setHero(0, 'image', v)}
                helpText="Recommended: 800×500px landscape image" />
            </Col>
          </Row>
        </Section>

        {/* ── FESTIVAL GREETING ────────────────────────── */}
        <Section title="Festival Greeting (popup + banner)" icon="🎉" defaultOpen>
          {/* On/off */}
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3"
            style={{ backgroundColor: fest.enabled ? '#e8f5e9' : '#f5f6f8', cursor: 'pointer' }}
            onClick={() => setFest('enabled', !fest.enabled)}
            role="checkbox" aria-checked={fest.enabled} tabIndex={0}
          >
            <div>
              <span className="fw-semibold" style={{ fontSize: '0.9rem', color: fest.enabled ? '#2e7d32' : '#5c677d' }}>
                {fest.enabled ? '✓ Festival Greeting is ON' : 'Festival Greeting is OFF'}
              </span>
              <p className="mb-0" style={{ fontSize: '0.75rem', color: '#777' }}>
                Turn on during a festival, off when it is over.
              </p>
            </div>
            <div className="rounded-pill" style={{ width: 44, height: 24, backgroundColor: fest.enabled ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: fest.enabled ? 22 : 2, transition: 'left 0.2s' }} />
            </div>
          </div>

          <UploadImageField
            label="Greeting Image (PNG or GIF)"
            value={fest.image}
            onChange={(v) => setFest('image', v)}
            helpText="Upload a festival wish image or animated GIF — shown as-is in the popup and banner."
          />

          <Row className="g-3">
            <Col sm={6}><TextField label="Greeting Title" value={fest.title} onChange={(v) => setFest('title', v)} placeholder="Happy Diwali! 🪔" /></Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Accent / Glow Colour</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <input type="color" value={fest.accent} onChange={(e) => setFest('accent', e.target.value)}
                    style={{ width: 46, height: 42, border: '1px solid #e3e6ec', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                  <Form.Control value={fest.accent} onChange={(e) => setFest('accent', e.target.value)}
                    style={{ height: 42, fontSize: '0.85rem', fontFamily: 'monospace' }} />
                </div>
              </Form.Group>
            </Col>
            <Col xs={12}><TextField label="Offer / Message" value={fest.message} onChange={(v) => setFest('message', v)} rows={2} placeholder="Flat 25% OFF all custom pencil toppers this festive season!" /></Col>
            <Col sm={6}><TextField label="Button Text" value={fest.buttonText} onChange={(v) => setFest('buttonText', v)} placeholder="Shop Festival Offers" /></Col>
            <Col sm={6}><TextField label="Button Link" value={fest.buttonLink} onChange={(v) => setFest('buttonLink', v)} placeholder="/shop" /></Col>
          </Row>

          {/* Where to show */}
          <div className="d-flex flex-wrap gap-3 mt-1">
            <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={fest.showPopup} onChange={(e) => setFest('showPopup', e.target.checked)} />
              Show popup (once per visit)
            </label>
            <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={fest.showBanner} onChange={(e) => setFest('showBanner', e.target.checked)} />
              Show banner on home page
            </label>
          </div>
        </Section>

        {/* ── HERO SLIDE 2 ─────────────────────────────── */}
        <Section title="Hero Banner – Slide 2" icon="🖼️">
          <Row className="g-3">
            <Col sm={6}>
              <TextField label="Badge Text" value={settings.heroSlides[1]?.badge ?? ''}
                onChange={(v) => setHero(1, 'badge', v)} placeholder="🎁 Personalized Gifts" />
            </Col>
            <Col sm={6}>
              <TextField label="Background Color" value={settings.heroSlides[1]?.bgColor ?? ''}
                onChange={(v) => setHero(1, 'bgColor', v)} placeholder="#e8f4ff" />
            </Col>
            <Col sm={6}>
              <TextField label="Main Heading" value={settings.heroSlides[1]?.heading ?? ''}
                onChange={(v) => setHero(1, 'heading', v)} />
            </Col>
            <Col sm={6}>
              <TextField label="Highlighted Heading (gold text)" value={settings.heroSlides[1]?.headingHighlight ?? ''}
                onChange={(v) => setHero(1, 'headingHighlight', v)} />
            </Col>
            <Col xs={12}>
              <TextField label="Sub Text" value={settings.heroSlides[1]?.subtext ?? ''}
                onChange={(v) => setHero(1, 'subtext', v)} rows={2} />
            </Col>
            <Col sm={6}>
              <TextField label="Button Text" value={settings.heroSlides[1]?.buttonText ?? ''}
                onChange={(v) => setHero(1, 'buttonText', v)} />
            </Col>
            <Col sm={6}>
              <TextField label="Button Link" value={settings.heroSlides[1]?.buttonLink ?? ''}
                onChange={(v) => setHero(1, 'buttonLink', v)} />
            </Col>
            <Col xs={12}>
              <ImageField label="Hero Image URL" value={settings.heroSlides[1]?.image ?? ''}
                onChange={(v) => setHero(1, 'image', v)} />
            </Col>
          </Row>
        </Section>

        {/* ── PROMO BANNER 1 ───────────────────────────── */}
        <Section title="Promo Banner 1 (Left)" icon="📢">
          <Row className="g-3">
            <Col sm={6}><TextField label="Badge" value={settings.promoBanners[0]?.badge ?? ''} onChange={(v) => setPromo(0, 'badge', v)} /></Col>
            <Col sm={6}><TextField label="Background Color" value={settings.promoBanners[0]?.bgColor ?? ''} onChange={(v) => setPromo(0, 'bgColor', v)} /></Col>
            <Col xs={12}><TextField label="Heading" value={settings.promoBanners[0]?.heading ?? ''} onChange={(v) => setPromo(0, 'heading', v)} /></Col>
            <Col xs={12}><TextField label="Sub Text" value={settings.promoBanners[0]?.subtext ?? ''} onChange={(v) => setPromo(0, 'subtext', v)} rows={2} /></Col>
            <Col sm={6}><TextField label="Button Text" value={settings.promoBanners[0]?.buttonText ?? ''} onChange={(v) => setPromo(0, 'buttonText', v)} /></Col>
            <Col sm={6}><TextField label="Button Link" value={settings.promoBanners[0]?.buttonLink ?? ''} onChange={(v) => setPromo(0, 'buttonLink', v)} /></Col>
            <Col xs={12}><ImageField label="Banner Image URL" value={settings.promoBanners[0]?.image ?? ''} onChange={(v) => setPromo(0, 'image', v)} /></Col>
          </Row>
        </Section>

        {/* ── PROMO BANNER 2 ───────────────────────────── */}
        <Section title="Promo Banner 2 (Right)" icon="📢">
          <Row className="g-3">
            <Col sm={6}><TextField label="Badge" value={settings.promoBanners[1]?.badge ?? ''} onChange={(v) => setPromo(1, 'badge', v)} /></Col>
            <Col sm={6}><TextField label="Background Color" value={settings.promoBanners[1]?.bgColor ?? ''} onChange={(v) => setPromo(1, 'bgColor', v)} /></Col>
            <Col xs={12}><TextField label="Heading" value={settings.promoBanners[1]?.heading ?? ''} onChange={(v) => setPromo(1, 'heading', v)} /></Col>
            <Col xs={12}><TextField label="Sub Text" value={settings.promoBanners[1]?.subtext ?? ''} onChange={(v) => setPromo(1, 'subtext', v)} rows={2} /></Col>
            <Col sm={6}><TextField label="Button Text" value={settings.promoBanners[1]?.buttonText ?? ''} onChange={(v) => setPromo(1, 'buttonText', v)} /></Col>
            <Col sm={6}><TextField label="Button Link" value={settings.promoBanners[1]?.buttonLink ?? ''} onChange={(v) => setPromo(1, 'buttonLink', v)} /></Col>
            <Col xs={12}><ImageField label="Banner Image URL" value={settings.promoBanners[1]?.image ?? ''} onChange={(v) => setPromo(1, 'image', v)} /></Col>
          </Row>
        </Section>

        {/* ── SECTION HEADINGS ─────────────────────────── */}
        <Section title="Section Headings" icon="✏️">
          <Row className="g-3">
            <Col sm={6}><TextField label="Categories Section Title" value={settings.categoriesTitle} onChange={(v) => set('categoriesTitle', v)} /></Col>
            <Col sm={6}><TextField label="Categories Sub Text" value={settings.categoriesSubtext} onChange={(v) => set('categoriesSubtext', v)} /></Col>
            <Col sm={6}><TextField label="Recent Works Title" value={settings.featuredTitle} onChange={(v) => set('featuredTitle', v)} /></Col>
            <Col sm={6}><TextField label="Recent Works Sub Text" value={settings.featuredSubtext} onChange={(v) => set('featuredSubtext', v)} /></Col>
            <Col sm={6}><TextField label="Services Title" value={settings.whyTitle} onChange={(v) => set('whyTitle', v)} /></Col>
            <Col sm={6}><TextField label="Services Sub Text" value={settings.whySubtext} onChange={(v) => set('whySubtext', v)} /></Col>
            <Col sm={6}><TextField label="CTA Title" value={settings.newsletterTitle} onChange={(v) => set('newsletterTitle', v)} /></Col>
            <Col sm={6}><TextField label="CTA Sub Text" value={settings.newsletterSubtext} onChange={(v) => set('newsletterSubtext', v)} rows={2} /></Col>
          </Row>
        </Section>

        {/* ── ABOUT PAGE ───────────────────────────────── */}
        <Section title="About Page" icon="ℹ️">
          <Row className="g-3">
            <Col sm={6}><TextField label="Page Heading" value={settings.aboutHeading} onChange={(v) => set('aboutHeading', v)} /></Col>
            <Col sm={6}><TextField label="Page Sub Heading" value={settings.aboutSubheading} onChange={(v) => set('aboutSubheading', v)} /></Col>
            <Col xs={12}><TextField label="Our Story Text" value={settings.aboutStory} onChange={(v) => set('aboutStory', v)} rows={4} /></Col>
            <Col sm={6}><TextField label="Mission Text" value={settings.aboutMission} onChange={(v) => set('aboutMission', v)} rows={3} /></Col>
            <Col sm={6}><TextField label="Vision Text" value={settings.aboutVision} onChange={(v) => set('aboutVision', v)} rows={3} /></Col>
            <Col xs={12}><ImageField label="About Page Image" value={settings.aboutImage} onChange={(v) => set('aboutImage', v)} /></Col>
          </Row>
        </Section>

        {/* ── CONTACT PAGE ─────────────────────────────── */}
        <Section title="Contact Page" icon="📞">
          <Row className="g-3">
            <Col sm={6}><TextField label="Page Heading" value={settings.contactHeading} onChange={(v) => set('contactHeading', v)} /></Col>
            <Col sm={6}><TextField label="Page Sub Heading" value={settings.contactSubheading} onChange={(v) => set('contactSubheading', v)} /></Col>
          </Row>
        </Section>

        {/* Save button */}
        <button type="submit" className="btn btn-pink d-flex align-items-center gap-2"
          disabled={saving} style={{ height: 48, fontSize: '0.925rem' }}>
          {saving
            ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
            : <><FiSave size={16} /> Save All Content</>}
        </button>

      </Form>
    </div>
  );
};

export default AdminContent;
