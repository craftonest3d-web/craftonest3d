import React, { Suspense } from 'react';

const AdminSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border" style={{ color: 'var(--pn-primary)' }} role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export default AdminSuspense;
