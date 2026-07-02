/**
 * PaperNest – 404 Not Found Page
 */
import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

export const NotFound: React.FC = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '70vh', backgroundColor: 'var(--pn-bg-section)' }}
    >
      <Container>
        <div className="text-center py-5">
          {/* Large illustrated 404 */}
          <div
            className="mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: 'var(--pn-primary-bg)',
              color: 'var(--pn-primary)',
            }}
            aria-hidden="true"
          >
            <span style={{ fontSize: '2.5rem' }}>📄</span>
          </div>

          <h1
            className="fw-bold mb-2"
            style={{ fontSize: '6rem', lineHeight: 1, color: 'var(--pn-primary)', letterSpacing: '-3px' }}
            aria-label="404 error"
          >
            404
          </h1>
          <h2 className="fw-bold mb-3" style={{ fontSize: '1.5rem' }}>
            Page Lost in the Mail
          </h2>
          <p
            className="text-muted mx-auto mb-5"
            style={{ maxWidth: 440, fontSize: '0.95rem', lineHeight: 1.7 }}
          >
            We couldn't find the page you were looking for. It may have been moved or the
            address might be incorrect. Let's get you back on track!
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link
              to="/"
              className="btn btn-pink d-flex align-items-center gap-2"
              style={{ height: 46, fontSize: '0.9rem' }}
            >
              <FiHome size={17} /> Back to Home
            </Link>
            <Link
              to="/products"
              className="btn btn-outline-pink d-flex align-items-center gap-2"
              style={{ height: 46, fontSize: '0.9rem' }}
            >
              <FiShoppingBag size={17} /> Browse Products
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
