/**
 * CRAFTONEST3D – Festival Greeting
 * Admin-controlled seasonal popup (once per visit) + optional home banner.
 * Reads settings.festival. Shows nothing when disabled.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/** POPUP — appears once per browser session when enabled. */
export const FestivalPopup: React.FC = () => {
  const { festival } = useSiteSettings();
  const [show, setShow] = useState(false);

  const enabled = !!festival?.enabled && !!festival?.showPopup;
  // Session key changes with the image/title so a new festival re-shows.
  const sig = `${festival?.title ?? ''}|${festival?.image ?? ''}`;

  useEffect(() => {
    if (!enabled) { setShow(false); return; }
    const key = 'c3d-festival-seen';
    if (sessionStorage.getItem(key) === sig) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 600); // small delay after load
    return () => clearTimeout(t);
  }, [enabled, sig]);

  if (!enabled || !show) return null;
  const accent = festival?.accent || '#d4af37';

  const close = () => {
    sessionStorage.setItem('c3d-festival-seen', sig);
    setShow(false);
  };

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="c3d-festival-card c3d-fest-glow"
        style={{
          position: 'relative', width: 'min(760px, 96vw)', maxHeight: '92vh', overflowY: 'auto',
          backgroundColor: '#111', borderRadius: 20,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 60px ${accent}55, 0 24px 60px rgba(0,0,0,0.7)`,
          textAlign: 'center',
          ['--c3d-accent' as string]: accent,
        }}
      >
        {/* Close */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 3,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', border: `1px solid ${accent}66`,
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FiX size={18} />
        </button>

        {/* Greeting image with shine sweep + twinkle sparkles */}
        {festival?.image && (
          <div className="c3d-fest-imgwrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <img
              src={festival.image}
              alt={festival.title || 'Festival greeting'}
              style={{ width: '100%', display: 'block' }}
            />
            {/* Sparkles */}
            <span className="c3d-fest-spark" style={{ top: '18%', left: '12%' }}>✦</span>
            <span className="c3d-fest-spark" style={{ top: '30%', left: '82%', animationDelay: '0.6s' }}>✦</span>
            <span className="c3d-fest-spark" style={{ top: '62%', left: '26%', animationDelay: '1.1s' }}>✧</span>
            <span className="c3d-fest-spark" style={{ top: '70%', left: '68%', animationDelay: '1.6s' }}>✦</span>
            <span className="c3d-fest-spark" style={{ top: '45%', left: '50%', animationDelay: '0.3s' }}>✧</span>
          </div>
        )}

        {/* Text */}
        <div style={{ padding: '18px 22px 24px' }}>
          {festival?.title && (
            <h3 style={{ color: accent, fontWeight: 900, fontSize: '1.4rem', margin: '0 0 8px' }}>
              {festival.title}
            </h3>
          )}
          {festival?.message && (
            <p style={{ color: '#ddd', fontSize: '0.95rem', margin: '0 0 18px', lineHeight: 1.5 }}>
              {festival.message}
            </p>
          )}
          {festival?.buttonText && festival?.buttonLink && (
            <Link
              to={festival.buttonLink}
              onClick={close}
              className="c3d-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: accent, color: '#000', fontWeight: 800,
                padding: '12px 26px', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem',
              }}
            >
              {festival.buttonText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

/** BANNER — slim strip for the home page when enabled. */
export const FestivalBanner: React.FC = () => {
  const { festival } = useSiteSettings();
  if (!festival?.enabled || !festival?.showBanner) return null;
  const accent = festival.accent || '#d4af37';

  const hasImage = !!festival.image?.trim();

  // If there's an image, show it FULL-WIDTH as a proper banner (clickable).
  if (hasImage) {
    const inner = (
      <div
        className="c3d-festival-banner c3d-fest-imgwrap"
        style={{
          position: 'relative', width: '100%', overflow: 'hidden',
          borderBottom: `2px solid ${accent}55`,
          ['--c3d-accent' as string]: accent,
        }}
      >
        <img
          src={festival.image}
          alt={festival.title || 'Festival offer'}
          style={{
            width: '100%', height: 'auto', display: 'block',
            maxHeight: 320, objectFit: 'contain',   // show WHOLE image, never crop or stretch
          }}
        />
        {/* subtle shine sweep + optional button overlay */}
        {festival.buttonText && festival.buttonLink && (
          <span
            className="c3d-btn"
            style={{
              position: 'absolute', bottom: 12, right: 16,
              backgroundColor: accent, color: '#000', fontWeight: 800,
              padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            {festival.buttonText}
          </span>
        )}
      </div>
    );
    return festival.buttonLink
      ? <Link to={festival.buttonLink} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>
      : inner;
  }

  // No image → text-only strip (original style).
  return (
    <div
      className="c3d-festival-banner"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        padding: '12px 18px', margin: '0',
        background: `linear-gradient(90deg, ${accent}22, ${accent}0d, ${accent}22)`,
        borderTop: `1px solid ${accent}44`, borderBottom: `1px solid ${accent}44`,
        textAlign: 'center',
      }}
    >
      <span style={{ color: accent, fontWeight: 800, fontSize: '1rem' }}>{festival.title}</span>
      {festival.message && <span style={{ color: '#ccc', fontSize: '0.88rem' }}>{festival.message}</span>}
      {festival.buttonText && festival.buttonLink && (
        <Link
          to={festival.buttonLink}
          className="c3d-btn"
          style={{
            backgroundColor: accent, color: '#000', fontWeight: 800,
            padding: '7px 18px', borderRadius: 9, textDecoration: 'none', fontSize: '0.84rem',
          }}
        >
          {festival.buttonText}
        </Link>
      )}
    </div>
  );
};
