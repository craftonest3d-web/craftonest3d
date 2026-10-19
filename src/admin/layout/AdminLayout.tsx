/**
 * CRAFTONEST3D – Admin Layout
 * Sidebar navigation + topbar + main content area.
 * Completely isolated from the public site layout.
 */
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToOrders } from '../../services/orderService';
import {
  FiGrid, FiPackage, FiTag, FiSettings, FiLogOut,
  FiMenu, FiX, FiExternalLink, FiEdit, FiShoppingCart,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: <FiGrid size={18} />,         label: 'Dashboard' },
  { to: '/admin/orders',     icon: <FiShoppingCart size={18} />, label: 'Orders' },
  { to: '/admin/products',   icon: <FiPackage size={18} />,      label: 'Works / Portfolio' },
  { to: '/admin/categories', icon: <FiTag size={18} />,          label: 'Categories' },
  { to: '/admin/content',    icon: <FiEdit size={18} />,         label: 'Content' },
  { to: '/admin/settings',   icon: <FiSettings size={18} />,     label: 'Settings' },
];

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Live badge — updates instantly on new orders / status changes.
    const unsub = subscribeToOrders((orders) =>
      setPendingCount(orders.filter((o) => o.status === 'pending').length),
    );
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className="d-flex align-items-center gap-2 px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--pn-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 3 L28 9.5 L28 22.5 L16 29 L4 22.5 L4 9.5 Z" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M4 9.5 L16 16 L28 9.5" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M16 16 L16 29" fill="none" stroke="#0a0a0a" strokeWidth="2.5" />
          </svg>
        </div>
        <div>
          <p className="mb-0 fw-bold text-white" style={{ fontSize: '1rem', lineHeight: 1.1, color: 'var(--pn-primary)' }}>CRAFTONEST3D</p>
          <p className="mb-0" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>ADMIN PANEL</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 py-3 px-2">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 rounded-3 mb-1 text-decoration-none fw-semibold ${
                isActive
                  ? 'text-white'
                  : ''
              }`
            }
            style={({ isActive }) => ({
              fontSize: '0.875rem',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              backgroundColor: isActive ? 'var(--pn-primary)' : 'transparent',
              transition: 'all 0.15s',
            })}
            onClick={() => setSidebarOpen(false)}
          >
            {icon}
            <span className="flex-grow-1">{label}</span>
            {to === '/admin/orders' && pendingCount > 0 && (
              <span
                style={{
                  backgroundColor: '#e74c3c', color: '#fff', fontSize: '0.68rem',
                  fontWeight: 800, minWidth: 20, height: 20, borderRadius: 10,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                }}
              >
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}
      >
        <p className="mb-1 text-truncate" title={user?.email ?? ''}>
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          className="d-flex align-items-center gap-2 btn btn-sm p-0 border-0"
          style={{ color: 'rgba(255,255,255,0.55)', background: 'none', fontSize: '0.82rem' }}
        >
          <FiLogOut size={14} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="d-flex admin-root" style={{ minHeight: '100vh', backgroundColor: '#f4f5f7' }}>

      {/* Desktop Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column"
        style={{ width: 240, minHeight: '100vh', background: '#0a1128', flexShrink: 0, position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh', overflowY: 'auto' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="position-fixed top-0 start-0 d-flex flex-column"
            style={{ width: 240, height: '100vh', background: '#0a1128', zIndex: 1040, overflowY: 'auto' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>

        {/* Topbar */}
        <header
          className="d-flex align-items-center justify-content-between px-4"
          style={{ height: 60, backgroundColor: 'white', borderBottom: '1px solid #e8eaed', position: 'sticky', top: 0, zIndex: 100 }}
        >
          <button
            className="btn btn-sm border-0 d-lg-none p-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <p className="mb-0 fw-bold d-none d-lg-block" style={{ fontSize: '0.875rem', color: 'var(--pn-text-muted)' }}>
            CRAFTONEST3D Admin
          </p>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <a
              href="/preview/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="d-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: '0.8rem', color: 'var(--pn-text-muted)', fontWeight: 600 }}
            >
              <FiExternalLink size={14} /> View Shop
            </a>
            <button
              onClick={handleLogout}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ backgroundColor: 'var(--pn-primary-bg)', color: 'var(--pn-primary)', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
