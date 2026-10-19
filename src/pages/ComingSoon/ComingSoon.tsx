/**
 * CRAFTONEST3D – Coming Soon Page (Animated)
 */
import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

// ── Animated 3D Printer SVG ────────────────────────────────────────────────
const PrinterAnimation: React.FC = () => (
  <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
    <style>{`
      @keyframes printHead {
        0%   { transform: translateX(0px); }
        25%  { transform: translateX(60px); }
        50%  { transform: translateX(60px); }
        75%  { transform: translateX(0px); }
        100% { transform: translateX(0px); }
      }
      @keyframes layerGrow {
        0%   { height: 0px; opacity: 0; }
        20%  { height: 0px; opacity: 0; }
        40%  { height: 12px; opacity: 1; }
        60%  { height: 24px; opacity: 1; }
        80%  { height: 36px; opacity: 1; }
        100% { height: 36px; opacity: 1; }
      }
      @keyframes nozzleDrip {
        0%   { opacity: 0; transform: scaleY(0); }
        30%  { opacity: 1; transform: scaleY(1); }
        60%  { opacity: 1; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(0); }
      }
      @keyframes printerGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.15); }
        50%       { box-shadow: 0 0 40px rgba(212,175,55,0.35); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes spin3D {
        0%   { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }
      @keyframes progressBar {
        0%   { width: 0%; }
        100% { width: 85%; }
      }
    `}</style>
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ animation: 'float 3s ease-in-out infinite' }}>
      {/* Printer body */}
      <rect x="20" y="20" width="140" height="100" rx="10" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="2" />
      {/* Top rail */}
      <rect x="30" y="35" width="120" height="16" rx="4" fill="#111" stroke="#d4af37" strokeWidth="1.5" />
      {/* Print head — animated */}
      <g style={{ animation: 'printHead 2.5s ease-in-out infinite' }}>
        <rect x="50" y="38" width="28" height="20" rx="4" fill="#d4af37" />
        <rect x="58" y="58" width="12" height="6" rx="2" fill="#b8941f" />
        {/* Nozzle drip */}
        <rect x="62" y="64" width="4" height="12" rx="2" fill="#d4af37" style={{ animation: 'nozzleDrip 2.5s ease-in-out infinite', transformOrigin: '64px 64px' }} />
      </g>
      {/* Print bed */}
      <rect x="30" y="95" width="120" height="8" rx="4" fill="#d4af37" opacity="0.6" />
      {/* Printed object — growing layers */}
      <g style={{ animation: 'layerGrow 2.5s ease-in-out infinite' }}>
        <rect x="65" y="59" width="50" height="36" rx="4" fill="#d4af37" opacity="0.25" />
        <rect x="65" y="83" width="50" height="12" rx="2" fill="#d4af37" opacity="0.6" />
        <rect x="70" y="71" width="40" height="12" rx="2" fill="#d4af37" opacity="0.5" />
        <rect x="75" y="59" width="30" height="12" rx="2" fill="#d4af37" opacity="0.4" />
      </g>
      {/* Base */}
      <rect x="10" y="130" width="160" height="28" rx="8" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="2" />
      {/* LED indicator */}
      <circle cx="155" cy="144" r="5" fill="#25D366" style={{ animation: 'blink 1.2s ease-in-out infinite' }} />
      <circle cx="140" cy="144" r="5" fill="#d4af37" style={{ animation: 'blink 1.8s ease-in-out infinite' }} />
      {/* Side pillars */}
      <rect x="20" y="20" width="10" height="110" rx="3" fill="#161616" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="150" y="20" width="10" height="110" rx="3" fill="#161616" stroke="#2a2a2a" strokeWidth="1" />
    </svg>
  </div>
);

// ── Typewriter Text ────────────────────────────────────────────────────────
const TypewriterText: React.FC<{ phrases: string[] }> = ({ phrases }) => {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === current.length) {
          setTimeout(() => setDeleting(true), 2000);
        } else {
          setCharIdx(c => c + 1);
        }
      }, 80);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setPhraseIdx(i => i + 1);
          setCharIdx(0);
        } else {
          setCharIdx(c => c - 1);
        }
      }, 40);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases]);

  return (
    <span style={{ color: '#d4af37' }}>
      {displayed}
      <span style={{ animation: 'blink 0.7s step-end infinite', display: 'inline-block', marginLeft: 2, color: '#d4af37' }}>|</span>
    </span>
  );
};

// ── Floating particles ─────────────────────────────────────────────────────
const Particles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: '#d4af37',
          opacity: 0.3,
          animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
export const ComingSoon: React.FC = () => {
  const { whatsappNumber, socialLinks } = useSiteSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I saw your coming soon page. Please notify me when you launch! 🎉')}`;

  const features = [
    { icon: '✏️', text: 'Custom Name Pencil Toppers' },
    { icon: '🔑', text: 'Personalized Keychains' },
    { icon: '🐉', text: 'Miniatures & Figurines' },
    { icon: '🧸', text: 'Toys & Models' },
    { icon: '🎨', text: 'Custom 3D Prints' },
    { icon: '📦', text: 'Bulk Orders Welcome' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(212,175,55,0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .feature-pill {
          transition: all 0.2s ease;
        }
        .feature-pill:hover {
          transform: translateY(-2px);
          border-color: #d4af37 !important;
        }
        .wa-btn {
          transition: all 0.2s ease !important;
          position: relative;
          overflow: hidden;
        }
        .wa-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2.5s infinite;
        }
        .wa-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 40px rgba(37,211,102,0.4) !important;
        }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      <Particles />

      {/* Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 680,
        opacity: visible ? 1 : 0,
        animation: visible ? 'fadeIn 0.8s ease both' : 'none',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeUp 0.6s 0.1s ease both' }}>
          <svg viewBox="0 0 32 32" style={{ width: 48, height: 48, margin: '0 auto 10px', display: 'block' }}>
            <path d="M16 3 L28 9.5 L28 22.5 L16 29 L4 22.5 L4 9.5 Z" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinejoin="round" />
            <path d="M4 9.5 L16 16 L28 9.5" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinejoin="round" />
            <path d="M16 16 L16 29" fill="none" stroke="#d4af37" strokeWidth="2" />
          </svg>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            fontWeight: 900, color: '#ffffff',
            letterSpacing: '-1px', margin: 0, lineHeight: 1,
          }}>
            CRAFTONEST<span style={{ color: '#d4af37' }}>3D</span>
          </h1>
          <p style={{
            color: '#d4af37', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '3px', margin: '8px 0 0', textTransform: 'uppercase',
          }}>
            Where Ideas Take Shape
          </p>
        </div>

        {/* Main card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #2a2a2a',
          borderRadius: 24,
          padding: 'clamp(1.5rem, 5vw, 3rem)',
          marginBottom: '1.5rem',
          animation: 'fadeUp 0.6s 0.2s ease both',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold top border accent */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          }} />

          {/* Printer animation */}
          <PrinterAnimation />

          {/* Heading */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.4rem, 5vw, 2rem)',
              fontWeight: 900, color: '#ffffff',
              margin: '0 0 8px', lineHeight: 1.2,
            }}>
              Something exciting is
            </h2>
            <h2 style={{
              fontSize: 'clamp(1.4rem, 5vw, 2rem)',
              fontWeight: 900, margin: 0, lineHeight: 1.2,
            }}>
              <TypewriterText phrases={[
                'being printed...',
                'coming soon!',
                'taking shape!',
                'almost ready!',
              ]} />
            </h2>
          </div>

          <p style={{
            textAlign: 'center', color: '#999',
            fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 1.5rem',
          }}>
            We're setting up our <strong style={{ color: '#fff' }}>custom 3D printing studio</strong>.<br />
            Get ready for personalized prints like never before!
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Launch progress</span>
              <span style={{ color: '#d4af37', fontSize: '0.78rem', fontWeight: 700 }}>85%</span>
            </div>
            <div style={{ height: 8, backgroundColor: '#1a1a1a', borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #b8941f, #d4af37, #f0d060)',
                backgroundSize: '200% 100%',
                animation: 'progressBar 2s 0.5s ease both, gradientShift 3s ease infinite',
                borderRadius: 10,
                width: '85%',
              }} />
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-pill" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 50, padding: '6px 14px',
                fontSize: '0.8rem', color: '#ccc', fontWeight: 600,
                animation: `fadeUp 0.5s ${0.3 + i * 0.08}s ease both`,
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #1f1f1f', margin: '0 0 1.5rem' }} />

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#777', fontSize: '0.875rem', marginBottom: 14 }}>
              Want to place an early order or get notified when we launch?
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                backgroundColor: '#25D366', color: '#fff',
                padding: '14px 32px', borderRadius: 12,
                fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                animation: 'pulseGold 2.5s infinite',
              }}
            >
              <FaWhatsapp size={22} />
              Chat on WhatsApp
            </a>
            <p style={{ color: '#444', fontSize: '0.72rem', marginTop: 10 }}>
              We typically reply within a few minutes
            </p>
          </div>
        </div>

        {/* Social + footer */}
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s 0.6s ease both' }}>
          <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 12 }}>Follow us for updates</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{
                width: 42, height: 42, borderRadius: '50%',
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d4af37', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#d4af37'; el.style.color = '#000'; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#1a1a1a'; el.style.color = '#d4af37'; el.style.transform = 'translateY(0)'; }}
              >
                <FaInstagram size={18} />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{
                width: 42, height: 42, borderRadius: '50%',
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d4af37', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#d4af37'; el.style.color = '#000'; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#1a1a1a'; el.style.color = '#d4af37'; el.style.transform = 'translateY(0)'; }}
              >
                <FaFacebookF size={18} />
              </a>
            )}
            <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
              width: 42, height: 42, borderRadius: '50%',
              backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#25D366', textDecoration: 'none', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#25D366'; el.style.color = '#fff'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#1a1a1a'; el.style.color = '#25D366'; el.style.transform = 'translateY(0)'; }}
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
          <p style={{ color: '#2a2a2a', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} CRAFTONEST3D. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ComingSoon;
