/**
 * PaperNest – Admin Layout
 * Sidebar navigation + topbar + main content area.
 * Completely isolated from the public site layout.
 */
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiGrid, FiPackage, FiTag, FiSettings, FiLogOut,
  FiMenu, FiX, FiExternalLink, FiEdit,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: <FiGrid size={18} />,    label: 'Dashboard' },
  { to: '/admin/products',   icon: <FiPackage size={18} />, label: 'Products' },
  { to: '/admin/categories', icon: <FiTag size={18} />,     label: 'Categories' },
  { to: '/admin/content',    icon: <FiEdit size={18} />,    label: 'Content' },
  { to: '/admin/settings',   icon: <FiSettings size={18} />,label: 'Settings' },
];

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <span style={{ fontSize: '1.1rem' }}>📦</span>
        </div>
        <div>
          <p className="mb-0 fw-bold text-white" style={{ fontSize: '1rem', lineHeight: 1.1 }}>PaperNest</p>
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
            {label}
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
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f5f7' }}>

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
            PaperNest Admin
          </p>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="d-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: '0.8rem', color: 'var(--pn-text-muted)' }}
            >
              <FiExternalLink size={14} /> View Store
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
