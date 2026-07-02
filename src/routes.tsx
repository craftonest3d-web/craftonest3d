import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// ── Public site (unchanged) ────────────────────────────────────────────────
import MainLayout from './layout/MainLayout';
import Home       from './pages/Home/Home';
import Products   from './pages/Products/Products';
import About      from './pages/About/About';
import Contact    from './pages/Contact/Contact';
import NotFound   from './pages/NotFound/NotFound';

// ── Admin panel (lazy-loaded so it never loads on the public site) ─────────
import ProtectedRoute    from './admin/components/ProtectedRoute';
import AdminLayout       from './admin/layout/AdminLayout';
const AdminLogin         = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard     = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProducts      = lazy(() => import('./admin/pages/AdminProducts'));
const AdminProductForm   = lazy(() => import('./admin/pages/AdminProductForm'));
const AdminCategories    = lazy(() => import('./admin/pages/AdminCategories'));
const AdminSettings      = lazy(() => import('./admin/pages/AdminSettings'));

const AdminSuspense = ({ children }: { children: React.ReactNode }) => (
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

export const router = createBrowserRouter([
  // ── Public site ───────────────────────────────────────────────────────────
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,          element: <Home /> },
      { path: 'products',     element: <Products /> },
      { path: 'about',        element: <About /> },
      { path: 'contact',      element: <Contact /> },
      { path: '*',            element: <NotFound /> },
    ],
  },

  // ── Admin: login (public) ─────────────────────────────────────────────────
  {
    path: '/admin/login',
    element: <AdminSuspense><AdminLogin /></AdminSuspense>,
  },

  // ── Admin: protected shell ────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,                   element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',             element: <AdminSuspense><AdminDashboard /></AdminSuspense> },
      { path: 'products',              element: <AdminSuspense><AdminProducts /></AdminSuspense> },
      { path: 'products/new',          element: <AdminSuspense><AdminProductForm /></AdminSuspense> },
      { path: 'products/:id',          element: <AdminSuspense><AdminProductForm /></AdminSuspense> },
      { path: 'categories',            element: <AdminSuspense><AdminCategories /></AdminSuspense> },
      { path: 'settings',              element: <AdminSuspense><AdminSettings /></AdminSuspense> },
    ],
  },
]);

export default router;
