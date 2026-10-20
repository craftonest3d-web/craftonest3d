/**
 * CRAFTONEST3D – Admin Dashboard
 * Stats + recent works + quick actions + seed button.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FiPackage, FiTag, FiPlusCircle, FiSettings, FiStar, FiEye, FiDatabase, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getAllProducts } from '../../services/productService';
import { getAllCategoriesAdmin } from '../../services/categoryService';
import { getSiteSettings } from '../../services/settingsService';
import { getVisitTotal } from '../../services/visitService';
import { seedFirestoreIfEmpty, clearAndReseed, syncNewSeedItems } from '../../firebase/firebaseSeeder';
import type { Product } from '../../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div
    className="bg-white rounded-4 p-4 d-flex align-items-center gap-3"
    style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)' }}
  >
    <div
      className="d-flex align-items-center justify-content-center rounded-3"
      style={{ width: 52, height: 52, backgroundColor: color + '18', color, flexShrink: 0 }}
    >
      {icon}
    </div>
    <div>
      <p className="text-muted mb-0" style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </p>
      <p className="fw-bold mb-0" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{value}</p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [catCount,  setCatCount]  = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [seeding,   setSeeding]   = useState(false);
  const [seedMsg,   setSeedMsg]   = useState('');
  const [seedError, setSeedError] = useState('');
  const [paymentReply, setPaymentReply] = useState('');
  const [copied,    setCopied]    = useState(false);
  const [visits,    setVisits]    = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getAllProducts(), getAllCategoriesAdmin()]).then(([prods, cats]) => {
      setProducts(prods);
      setCatCount(cats.length);
      setLoading(false);
    });
    getSiteSettings().then((s) => setPaymentReply(s.paymentReplyMessage ?? ''));
    getVisitTotal().then(setVisits);
  };

  useEffect(() => { load(); }, []);

  const copyPaymentReply = async () => {
    if (!paymentReply) return;
    try {
      await navigator.clipboard.writeText(paymentReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    setSeedError('');
    try {
      const results = await seedFirestoreIfEmpty();
      setSeedMsg(results.join(' · '));
      load(); // refresh stats
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Missing or insufficient permissions')) {
        setSeedError(
          'Firestore rules are blocking writes. Go to Firebase Console → Firestore → Rules and publish the rules from firestore.rules file.',
        );
      } else {
        setSeedError('Seed failed: ' + msg);
      }
    } finally {
      setSeeding(false);
    }
  };

  // Safe: adds only missing sample items, never deletes or overwrites your edits.
  const handleSync = async () => {
    setSeeding(true);
    setSeedMsg('');
    setSeedError('');
    try {
      const results = await syncNewSeedItems();
      setSeedMsg(results.join(' · '));
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSeedError('Sync failed: ' + msg);
    } finally {
      setSeeding(false);
    }
  };

  // Destructive: full factory reset. Wipes ALL products/categories incl. your edits.
  const handleClearReseed = async () => {
    if (!confirm('⚠️ FACTORY RESET\n\nThis DELETES every product and category — including all prices and edits you made in the admin — and replaces them with the original sample data.\n\nThis cannot be undone. Are you sure?')) return;
    if (!confirm('Last check: your edited prices WILL be lost. Type OK on the next screen only if you really want a full reset.\n\nContinue?')) return;
    setSeeding(true);
    setSeedMsg('');
    setSeedError('');
    try {
      const results = await clearAndReseed();
      setSeedMsg(results.join(' · '));
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSeedError('Reset failed: ' + msg);
    } finally {
      setSeeding(false);
    }
  };

  const featured   = products.filter((p) => p.isFeatured).length;
  const recent     = products.slice(0, 5);

  const QUICK_ACTIONS = [
    { to: '/admin/products/new', icon: <FiPlusCircle size={18} />, label: 'Add Work',          color: 'var(--pn-primary)' },
    { to: '/admin/categories',   icon: <FiTag size={18} />,        label: 'Manage Categories', color: '#0062cc' },
    { to: '/admin/settings',     icon: <FiSettings size={18} />,   label: 'Site Settings',     color: '#6c5ce7' },
    { to: '/preview/shop',       icon: <FiEye size={18} />,        label: 'Preview Shop',      color: '#25D366', target: '_blank' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Dashboard</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
          Welcome back! Here is what is happening with your studio.
        </p>
      </div>

      {/* ── Quick: Copy Payment Message ─────────────────── */}
      {paymentReply && (
        <div
          className="rounded-4 p-3 mb-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3"
          style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}
        >
          <div>
            <p className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: '#2e7d32' }}>
              <FaWhatsapp className="me-1" /> Payment Reply — ready to send
            </p>
            <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
              After confirming an order, copy this and paste it in WhatsApp to share your UPI details.
              <Link to="/admin/settings" style={{ marginLeft: 6, color: '#1565c0', fontWeight: 600 }}>Edit</Link>
            </p>
          </div>
          <button
            type="button"
            onClick={copyPaymentReply}
            className="btn d-flex align-items-center gap-2 flex-shrink-0"
            style={{
              backgroundColor: copied ? '#2e7d32' : '#25D366', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '0.85rem',
              padding: '9px 18px', borderRadius: 9,
            }}
          >
            {copied ? <><FiCheckCircle size={16} /> Copied!</> : <><FiCopy size={16} /> Copy Payment Message</>}
          </button>
        </div>
      )}

      {/* ── Seed Banner ─────────────────────────────────── */}
      {(products.length === 0 || catCount === 0) && !loading && (
        <div
          className="rounded-4 p-4 mb-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3"
          style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082' }}
        >
          <div>
            <p className="fw-bold mb-1" style={{ fontSize: '0.925rem', color: '#e65100' }}>
              📦 No data found in Firestore
            </p>
            <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
              Click "Load Sample Data" to add sample 3D printing works, categories and site settings automatically.
              Make sure Firestore rules are published first.
            </p>
            {seedError && (
              <p className="mt-2 mb-0 fw-semibold" style={{ fontSize: '0.82rem', color: '#c62828' }}>
                ⚠️ {seedError}
              </p>
            )}
            {seedMsg && (
              <p className="mt-2 mb-0 fw-semibold" style={{ fontSize: '0.82rem', color: '#2e7d32' }}>
                ✓ {seedMsg}
              </p>
            )}
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn d-flex align-items-center gap-2 flex-shrink-0"
            style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', height: 42, borderRadius: 8 }}
          >
            {seeding ? (
              <><span className="spinner-border spinner-border-sm" /> Seeding…</>
            ) : (
              <><FiDatabase size={16} /> Load Sample Data</>
            )}
          </button>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatCard icon={<FiEye size={22} />} label="Site Visits" value={visits === null ? '–' : visits.toLocaleString('en-IN')} color="#2e7d32" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard icon={<FiPackage size={22} />} label="Total Works" value={loading ? '–' : products.length} color="var(--pn-primary)" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard icon={<FiTag size={22} />} label="Categories" value={loading ? '–' : catCount} color="#0062cc" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard icon={<FiStar size={22} />} label="Featured" value={loading ? '–' : featured} color="#ff9f43" />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Recent Products */}
        <Col lg={8}>
          <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Recent Works</h6>
              <Link to="/admin/products" style={{ fontSize: '0.82rem', color: 'var(--pn-primary)', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted" style={{ fontSize: '0.875rem' }}>
                <div className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : recent.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0" style={{ fontSize: '0.875rem' }}>
                No works yet. Click "Load Sample Data" above or{' '}
                <Link to="/admin/products/new">add a work →</Link>
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--pn-text-muted)' }}>
                      <th className="border-0 fw-semibold pb-3">Product</th>
                      <th className="border-0 fw-semibold pb-3">Category</th>
                      <th className="border-0 fw-semibold pb-3">Price</th>
                      <th className="border-0 fw-semibold pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 align-middle">
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={p.image || 'https://via.placeholder.com/36x36?text=📦'}
                              alt={p.title}
                              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36x36?text=📦'; }}
                            />
                            <span className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>{p.title}</span>
                          </div>
                        </td>
                        <td className="py-2 align-middle text-muted">{p.categoryLabel}</td>
                        <td className="py-2 align-middle fw-semibold">₹{p.price}</td>
                        <td className="py-2 align-middle">
                          <span
                            className="px-2 py-1 rounded-pill"
                            style={{
                              fontSize: '0.72rem', fontWeight: 700,
                              backgroundColor: p.inStock ? '#e8f5e9' : '#fdecea',
                              color: p.inStock ? '#2e7d32' : '#c62828',
                            }}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <div className="bg-white rounded-4 p-4" style={{ border: '1px solid #f0f1f5', boxShadow: 'var(--pn-shadow-xs)' }}>
            <h6 className="fw-bold mb-3">Quick Actions</h6>
            <div className="d-flex flex-column gap-2">
              {QUICK_ACTIONS.map(({ to, icon, label, color, target }) => (
                <Link
                  key={to}
                  to={to}
                  target={target}
                  rel={target ? 'noopener noreferrer' : undefined}
                  className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                  style={{ border: '1px solid #f0f1f5', color: 'var(--pn-text-dark)', transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f0f1f5')}
                >
                  <span style={{ color }}>{icon}</span>
                  <span className="fw-semibold" style={{ fontSize: '0.875rem' }}>{label}</span>
                </Link>
              ))}
            </div>

            {/* Catalog data tools */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f0f1f5' }}>
              {/* SAFE — add only new sample items, keeps your edits */}
              <button
                onClick={handleSync}
                disabled={seeding}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', fontWeight: 700, fontSize: '0.82rem', height: 40, borderRadius: 8 }}
              >
                {seeding ? <><span className="spinner-border spinner-border-sm" /> Working…</> : <><FiDatabase size={14} /> Sync New Sample Items</>}
              </button>
              <p className="text-center mt-1 mb-0" style={{ fontSize: '0.7rem', color: '#8a8f99' }}>
                Adds missing sample products only · never deletes or changes your prices
              </p>

              {/* DESTRUCTIVE — full factory reset, de-emphasized */}
              <button
                onClick={handleClearReseed}
                disabled={seeding}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 mt-3"
                style={{ backgroundColor: 'transparent', color: '#c62828', border: '1px solid #f3cfcc', fontWeight: 600, fontSize: '0.74rem', height: 34, borderRadius: 8 }}
              >
                <FiDatabase size={12} /> Factory Reset (deletes all edits)
              </button>

              {seedMsg && <p className="text-center mt-2 mb-0" style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 600 }}>✓ {seedMsg}</p>}
              {seedError && <p className="text-center mt-2 mb-0" style={{ fontSize: '0.78rem', color: '#c62828' }}>⚠️ {seedError}</p>}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
