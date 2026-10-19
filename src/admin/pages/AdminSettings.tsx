/**
 * CRAFTONEST3D – Admin Settings
 * Edit and save site settings to Firestore "settings/general".
 */
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FiSave, FiCheckCircle, FiCopy } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from 'react-icons/fa';
import { getSiteSettings, saveSiteSettings } from '../../services/settingsService';
import type { SiteSettings } from '../../types';

const AdminSettings: React.FC = () => {
  const [settings,    setSettings]    = useState<SiteSettings | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [copied,      setCopied]      = useState(false);

  const copyPaymentReply = async () => {
    const text = settings?.paymentReplyMessage ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy — please select the text and copy manually.');
    }
  };

  useEffect(() => {
    getSiteSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const set = (key: keyof SiteSettings, value: unknown) =>
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);

  const setSocial = (key: keyof SiteSettings['socialLinks'], value: string) =>
    setSettings((prev) =>
      prev ? { ...prev, socialLinks: { ...prev.socialLinks, [key]: value } } : prev,
    );

  // ── Shop colours ──────────────────────────────────────────────────────────
  const colours = settings?.shopColours ?? [];
  const setColours = (next: { label: string; hex: string }[]) => set('shopColours', next);
  const addColour      = () => setColours([...colours, { label: 'New Colour', hex: '#FF6B9D' }]);
  const removeColour   = (i: number) => setColours(colours.filter((_, idx) => idx !== i));
  const updateColour   = (i: number, field: 'label' | 'hex', value: string) =>
    setColours(colours.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setError('');
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm me-2" /> Loading settings…
      </div>
    );
  }

  if (!settings) return null;

  const labelClass = 'fw-semibold mb-1 d-block';
  const labelStyle = { fontSize: '0.875rem' };

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Site Settings</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
          These settings are stored in Firestore and affect the live store.
        </p>
      </div>

      {error && (
        <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.875rem' }} role="alert">
          ⚠️ {error}
        </div>
      )}

      {saved && (
        <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.875rem' }} role="status">
          <FiCheckCircle size={16} /> Settings saved successfully!
        </div>
      )}

      <Form onSubmit={handleSubmit} noValidate>

        {/* ── Theme Info ──────────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">Site Theme</h6>
          <div className="d-flex align-items-center gap-3 p-3 rounded-3"
            style={{ backgroundColor: '#1a1a1a', border: '2px solid #d4af37' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#d4af37', flexShrink: 0 }} />
            <div>
              <p className="fw-bold mb-0" style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>Dark + Gold</p>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>CRAFTONEST3D premium theme — black background with gold accents.</p>
            </div>
          </div>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
            The dark + gold theme is applied site-wide. No switching needed.
          </p>
        </div>
        {/* ── Business Info ─────────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">Business Information</h6>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="storeName">Store Name</label>
                <Form.Control
                  id="storeName" value={settings.storeName}
                  onChange={(e) => set('storeName', e.target.value)}
                  placeholder="CRAFTONEST3D"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="storeEmail">Email Address</label>
                <Form.Control
                  id="storeEmail" type="email" value={settings.storeEmail}
                  onChange={(e) => set('storeEmail', e.target.value)}
                  placeholder="hello@craftonest3d.com"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="storePhone">Phone Number</label>
                <Form.Control
                  id="storePhone" value={settings.storePhone}
                  onChange={(e) => set('storePhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="businessHours">Business Hours</label>
                <Form.Control
                  id="businessHours" value={settings.businessHours}
                  onChange={(e) => set('businessHours', e.target.value)}
                  placeholder="Mon – Sat: 10 AM – 8 PM"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="storeAddress">Store Address</label>
                <Form.Control
                  id="storeAddress" value={settings.storeAddress}
                  onChange={(e) => set('storeAddress', e.target.value)}
                  placeholder="Maker Studio, Your City – 400001"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ── WhatsApp & Announcement ───────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">WhatsApp &amp; Announcement</h6>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="waNumber">
                  <FaWhatsapp size={14} className="me-1" style={{ color: '#25D366' }} />
                  WhatsApp Number
                </label>
                <Form.Control
                  id="waNumber" value={settings.whatsappNumber}
                  onChange={(e) => set('whatsappNumber', e.target.value)}
                  placeholder="918072851386"
                  style={{ height: 44 }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Include country code, no + or spaces. e.g. 918072851386
                </Form.Text>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="announcement">Announcement Bar Text (scrolling)</label>
                <Form.Control
                  as="textarea" rows={2}
                  id="announcement" value={settings.announcementText}
                  onChange={(e) => set('announcementText', e.target.value)}
                  placeholder="🎉 Flat 20% OFF this week | 🚚 Free delivery above ₹499 | ✨ New designs added"
                  style={{ fontSize: '0.85rem' }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  This text scrolls across the top of the site. Add several ads/offers separated by <strong>|</strong> (a bar) — each shows as its own moving message. Leave empty to hide the bar.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ── Payment Options ───────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">💳 Payment Options</h6>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="upiNumber">GPay / UPI Number</label>
                <Form.Control
                  id="upiNumber" value={settings.upiNumber ?? ''}
                  onChange={(e) => set('upiNumber', e.target.value)}
                  placeholder="918072851386"
                  style={{ height: 44 }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Your GPay / PhonePe number for receiving payments.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="upiId">UPI ID (optional)</label>
                <Form.Control
                  id="upiId" value={settings.upiId ?? ''}
                  onChange={(e) => set('upiId', e.target.value)}
                  placeholder="craftonest3d@okaxis"
                  style={{ height: 44 }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Your UPI ID, e.g. yourname@okaxis or yourname@ybl
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ backgroundColor: settings.codAvailable ? '#e8f5e9' : '#f5f6f8', cursor: 'pointer' }}
                onClick={() => set('codAvailable', !settings.codAvailable)}
                role="checkbox" aria-checked={settings.codAvailable ?? false} tabIndex={0}
              >
                <div>
                  <span className="fw-semibold" style={{ fontSize: '0.9rem', color: settings.codAvailable ? '#2e7d32' : '#5c677d' }}>
                    {settings.codAvailable ? '✓ Cash on Delivery (COD) Available' : 'COD Disabled'}
                  </span>
                  <p className="mb-0" style={{ fontSize: '0.75rem', color: '#777' }}>
                    Show "COD Available" on the shop page
                  </p>
                </div>
                <div className="rounded-pill" style={{ width: 40, height: 22, backgroundColor: settings.codAvailable ? '#4caf50' : '#e0e0e0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: settings.codAvailable ? 20 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>
            </Col>

            {/* Payment reply message — copy & paste after confirming an order */}
            <Col xs={12}>
              <Form.Group>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className={labelClass} style={labelStyle} htmlFor="paymentReply">
                    Payment Reply Message
                  </label>
                  <button
                    type="button"
                    onClick={copyPaymentReply}
                    className="btn btn-sm d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: copied ? '#e8f5e9' : '#f0f1f5',
                      color: copied ? '#2e7d32' : '#333',
                      border: 'none', fontSize: '0.76rem', fontWeight: 700,
                      padding: '4px 12px', borderRadius: 7,
                    }}
                  >
                    {copied ? <><FiCheckCircle size={13} /> Copied!</> : <><FiCopy size={13} /> Copy</>}
                  </button>
                </div>
                <Form.Control
                  as="textarea" rows={6} id="paymentReply"
                  value={settings.paymentReplyMessage ?? ''}
                  onChange={(e) => set('paymentReplyMessage', e.target.value)}
                  placeholder={'Thank you for confirming your order!\n\nPlease pay the advance to:\n• GPay / PhonePe: 918072851386\n• UPI ID: yourname@okaxis'}
                  style={{ fontSize: '0.85rem', lineHeight: 1.5 }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  After you confirm an order on WhatsApp, click <strong>Copy</strong> and paste this message to send your UPI payment details. Update your number/UPI ID here anytime.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ── Available Colours ─────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="fw-bold mb-0">🎨 Available Colours</h6>
            <button
              type="button"
              onClick={addColour}
              className="btn btn-sm"
              style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', fontWeight: 700, fontSize: '0.78rem', padding: '5px 12px', borderRadius: 7 }}
            >
              + Add Colour
            </button>
          </div>
          <p className="text-muted mb-3" style={{ fontSize: '0.76rem' }}>
            These are the colours customers can pick in the shop. Remove one when it is out of stock, add new ones anytime.
          </p>

          {colours.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
              No colours set — the shop will use the default colour list. Click <strong>+ Add Colour</strong> to customise.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {colours.map((c, i) => (
                <div key={i} className="d-flex align-items-center gap-2">
                  {/* Colour picker swatch */}
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColour(i, 'hex', e.target.value)}
                    title="Pick colour"
                    style={{ width: 44, height: 40, border: '1px solid #e3e6ec', borderRadius: 8, padding: 2, cursor: 'pointer', flexShrink: 0 }}
                  />
                  {/* Name */}
                  <input
                    value={c.label}
                    onChange={(e) => updateColour(i, 'label', e.target.value)}
                    placeholder="Colour name"
                    style={{ flex: 1, height: 40, border: '1px solid #e3e6ec', borderRadius: 8, padding: '0 10px', fontSize: '0.85rem' }}
                  />
                  {/* Hex text */}
                  <input
                    value={c.hex}
                    onChange={(e) => updateColour(i, 'hex', e.target.value)}
                    placeholder="#FF6B9D"
                    style={{ width: 110, height: 40, border: '1px solid #e3e6ec', borderRadius: 8, padding: '0 10px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                  />
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeColour(i)}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#fdecea', color: '#c62828', border: 'none', fontWeight: 700, fontSize: '0.9rem', width: 38, height: 40, borderRadius: 8, flexShrink: 0 }}
                    title="Remove colour"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Social Links ──────────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">Social Links</h6>
          <Row className="g-3">
            {([
              { key: 'facebook',  icon: <FaFacebookF size={14} />,  label: 'Facebook URL',  placeholder: 'https://facebook.com/craftonest3d' },
              { key: 'instagram', icon: <FaInstagram size={14} />,  label: 'Instagram URL', placeholder: 'https://instagram.com/craftonest3d' },
              { key: 'youtube',   icon: <FaYoutube size={14} />,    label: 'YouTube URL',   placeholder: 'https://youtube.com/@craftonest3d' },
              { key: 'pinterest', icon: <FaPinterestP size={14} />, label: 'Pinterest URL', placeholder: 'https://pinterest.com/craftonest3d' },
            ] as { key: keyof SiteSettings['socialLinks']; icon: React.ReactNode; label: string; placeholder: string }[]).map(({ key, icon, label, placeholder }) => (
              <Col sm={6} key={key}>
                <Form.Group>
                  <label className={labelClass} style={labelStyle} htmlFor={`social-${key}`}>
                    <span className="me-1">{icon}</span> {label}
                  </label>
                  <Form.Control
                    id={`social-${key}`}
                    type="url"
                    value={settings.socialLinks[key] ?? ''}
                    onChange={(e) => setSocial(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ height: 44 }}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-pink d-flex align-items-center gap-2"
          disabled={saving}
          style={{ height: 48, fontSize: '0.925rem' }}
        >
          {saving
            ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
            : <><FiSave size={16} /> Save Settings</>
          }
        </button>

      </Form>
    </div>
  );
};

export default AdminSettings;

