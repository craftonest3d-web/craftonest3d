/**
 * CRAFTONEST3D – Mobile Bottom Navigation
 * App-style sticky bottom bar with raised central Quote launcher.
 * Only visible on mobile (hidden >= 992px via CSS).
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiFileText, FiMessageCircle } from 'react-icons/fi';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const MobileNav: React.FC = () => {
  const { whatsappNumber } = useSiteSettings();
  const { pathname } = useLocation();

  // detect preview mode so links stay inside /preview while testing
  const base = pathname.startsWith('/preview') ? '/preview' : '';
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I would like a quote for a custom 3D print.')}`;

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 3, flex: 1, height: '100%', textDecoration: 'none',
    color: active ? '#d4af37' : '#8a8a8a',
    fontSize: '0.62rem', fontWeight: active ? 800 : 600,
    transition: 'color 0.2s',
  });

  return (
    <nav
      className="c3d-mobile-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, zIndex: 1500,
        backgroundColor: 'rgba(14,14,18,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #222',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Home */}
      <NavLink to={base || '/'} end style={({ isActive }) => itemStyle(isActive)}>
        <FiHome size={20} />
        <span>Home</span>
      </NavLink>

      {/* Shop */}
      <NavLink to={`${base}/shop`} style={({ isActive }) => itemStyle(isActive)}>
        <FiGrid size={20} />
        <span>Shop</span>
      </NavLink>

      {/* Center raised Quote launcher */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get a quote"
          style={{
            position: 'relative', top: -18,
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#d4af37', color: '#0a0a0a',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(212,175,55,0.5)',
            textDecoration: 'none',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
            <path d="M3 7 L12 12 L21 7" />
            <path d="M12 12 L12 22" />
          </svg>
        </a>
      </div>

      {/* Policies */}
      <NavLink to={`${base}/policies`} style={({ isActive }) => itemStyle(isActive)}>
        <FiFileText size={20} />
        <span>Info</span>
      </NavLink>

      {/* Chat */}
      <a href={waHref} target="_blank" rel="noopener noreferrer" style={itemStyle(false)}>
        <FiMessageCircle size={20} />
        <span>Chat</span>
      </a>
    </nav>
  );
};

export default MobileNav;
