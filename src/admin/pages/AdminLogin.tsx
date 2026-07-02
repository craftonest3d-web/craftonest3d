/**
 * PaperNest – Admin Login
 * Firebase Email/Password authentication. No registration link.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  // Already logged in
  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Show the real Firebase error code to help diagnose
      const code = (err as { code?: string }).code ?? '';
      const msg: Record<string, string> = {
        'auth/invalid-credential':      'Wrong email or password. Please check and try again.',
        'auth/user-not-found':          'No account found with this email address.',
        'auth/wrong-password':          'Incorrect password. Please try again.',
        'auth/invalid-email':           'Please enter a valid email address.',
        'auth/user-disabled':           'This account has been disabled.',
        'auth/too-many-requests':       'Too many failed attempts. Please wait a few minutes and try again.',
        'auth/network-request-failed':  'Network error. Please check your internet connection.',
        'auth/operation-not-allowed':   'Email/Password sign-in is not enabled in Firebase Console.',
      };
      setError((msg[code] ?? `Login failed (${code || 'unknown error'})`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: 'linear-gradient(135deg, var(--pn-primary-bg) 0%, #fce4ec 100%)' }}
    >
      <div
        className="bg-white rounded-4 p-4 p-md-5 w-100"
        style={{ maxWidth: 420, boxShadow: 'var(--pn-shadow-lg)' }}
      >
        {/* Brand */}
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 56, height: 56, backgroundColor: 'var(--pn-primary)', fontSize: '1.6rem' }}
            aria-hidden="true"
          >
            📦
          </div>
          <h4 className="fw-bold mb-1">PaperNest Admin</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Sign in to manage your store
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2"
            style={{ backgroundColor: '#fdecea', color: '#c62828', fontSize: '0.875rem' }}
            role="alert"
          >
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="admin-email" className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <FiMail size={16} style={{ color: 'var(--pn-text-muted)' }} />
              </span>
              <input
                id="admin-email"
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="admin@papernest.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ height: 46 }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="admin-password" className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <FiLock size={16} style={{ color: 'var(--pn-text-muted)' }} />
              </span>
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ height: 46 }}
              />
              <button
                type="button"
                className="input-group-text border-start-0 bg-white"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-pink w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={busy}
            style={{ height: 48, fontSize: '0.925rem' }}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
          Admin access only. No public registration.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
