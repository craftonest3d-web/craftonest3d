/**
 * CRAFTONEST3D – Scroll To Top button
 * Appears after scrolling down, smoothly scrolls back to top.
 * Works reliably on mobile (window + document scroll) and avoids hover-stuck
 * states on touch devices.
 */
import React, { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hover, setHover]     = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Read scroll position from whichever source the browser uses.
      const y =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setVisible(y > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollUp = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      title="Back to top"
      className="c3d-scrolltop"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        right: 20,
        width: 46,
        height: 46,
        borderRadius: '50%',
        backgroundColor: hover ? '#f0d060' : '#d4af37',
        color: '#0a0a0a',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9998,
        boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
        transition: 'background-color 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        animation: 'c3dFadeIn 0.25s ease both',
      }}
    >
      <FiArrowUp size={22} />
    </button>
  );
};

export default ScrollToTop;
