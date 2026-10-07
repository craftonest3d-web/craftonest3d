/**
 * PaperNest – Admin Settings
 * Edit and save site settings to Firestore "settings/general".
 */
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FiSave, FiCheckCircle, FiDroplet } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from 'react-icons/fa';
import { getSiteSettings, saveSiteSettings } from '../../services/settingsService';
import type { SiteSettings } from '../../types';

// ── Theme definitions ──────────────────────────────────────────────────────
const THEMES = [
  { id: 'pink',   label: 'Soft Pink',     color: '#ff4f7a', bg: '#fff0f3' },
  { id: 'purple', label: 'Royal Purple',  color: '#7c3aed', bg: '#f5f0ff' },
  { id: 'green',  label: 'Emerald Green', color: '#059669', bg: '#ecfdf5' },
  { id: 'blue',   label: 'Ocean Blue',    color: '#0062cc', bg: '#eff6ff' },
];

function applyTheme(themeId: string) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('pn-theme', themeId);
}

const AdminSettings: React.FC = () => {
  const [settings,    setSettings]    = useState<SiteSettings | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem('pn-theme') ?? 'pink'
  );

  useEffect(() => {
    getSiteSettings().then((s) => { setSettings(s); setLoading(false); });
    // Apply saved theme on load
    applyTheme(localStorage.getItem('pn-theme') ?? 'pink');
  }, []);

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
  };

  const set = (key: keyof SiteSettings, value: unknown) =>
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);

  const setSocial = (key: keyof SiteSettings['socialLinks'], value: string) =>
    setSettings((prev) =>
      prev ? { ...prev, socialLinks: { ...prev.socialLinks, [key]: value } } : prev,
    );

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

        {/* ── Theme Switcher ─────────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FiDroplet size={16} style={{ color: 'var(--pn-primary)' }} />
            Store Theme
          </h6>
          <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
            Choose a color theme for the entire store. Changes apply instantly.
          </p>
          <div className="d-flex flex-wrap gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                style={{
                  border: activeTheme === theme.id
                    ? `2.5px solid ${theme.color}`
                    : '2px solid #e8eaed',
                  backgroundColor: activeTheme === theme.id ? theme.bg : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: activeTheme === theme.id ? theme.color : 'var(--pn-text-muted)',
                }}
              >
                {/* Color dot */}
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: theme.color, flexShrink: 0,
                  boxShadow: activeTheme === theme.id ? `0 0 0 3px ${theme.bg}, 0 0 0 4px ${theme.color}` : 'none',
                  transition: 'box-shadow 0.2s',
                }} />
                {theme.label}
                {activeTheme === theme.id && (
                  <FiCheckCircle size={14} style={{ color: theme.color }} />
                )}
              </button>
            ))}
          </div>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
            Theme is saved in your browser. Visitors see the default pink theme unless you update the code.
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
                  placeholder="PaperNest"
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
                  placeholder="hello@papernest.in"
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
                  placeholder="123, Stationery Street, City – 400001"
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
                  placeholder="919876543210"
                  style={{ height: 44 }}
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Include country code, no + or spaces. e.g. 919876543210
                </Form.Text>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <label className={labelClass} style={labelStyle} htmlFor="announcement">Announcement Bar Text</label>
                <Form.Control
                  id="announcement" value={settings.announcementText}
                  onChange={(e) => set('announcementText', e.target.value)}
                  placeholder="🎉 Free delivery on orders above ₹499!"
                  style={{ height: 44 }}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ── Social Links ──────────────────────────── */}
        <div className="bg-white rounded-4 p-4 mb-4" style={{ border: '1px solid #f0f1f5' }}>
          <h6 className="fw-bold mb-3">Social Links</h6>
          <Row className="g-3">
            {([
              { key: 'facebook',  icon: <FaFacebookF size={14} />,  label: 'Facebook URL',  placeholder: 'https://facebook.com/papernest' },
              { key: 'instagram', icon: <FaInstagram size={14} />,  label: 'Instagram URL', placeholder: 'https://instagram.com/papernest' },
              { key: 'youtube',   icon: <FaYoutube size={14} />,    label: 'YouTube URL',   placeholder: 'https://youtube.com/@papernest' },
              { key: 'pinterest', icon: <FaPinterestP size={14} />, label: 'Pinterest URL', placeholder: 'https://pinterest.com/papernest' },
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
