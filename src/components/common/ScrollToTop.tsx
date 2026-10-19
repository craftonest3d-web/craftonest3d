/**
 * CRAFTONEST3D – Scroll To Top button
 * Appears after scrolling down, smoothly scrolls back to top.
 */
import React, { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      title="Back to top"
      style={{
        position: 'fixed',
        bottom: 140,         // sits above WhatsApp button + mobile nav
        right: 20,
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#d4af37',
        color: '#0a0a0a',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9998,
        boxShadow: '0 4px 16px rgba(212,175,55,0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.8)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0d060'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d4af37'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; }}
    >
      <FiArrowUp size={22} />
    </button>
  );
};

export default ScrollToTop;
