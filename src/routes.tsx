import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// ── MAINTENANCE MODE ───────────────────────────────────────────────────────
// Set to true  → shows Coming Soon page to all visitors (TESTING)
// Set to false → shows the full website (LIVE)
const MAINTENANCE_MODE = true;

// Secret preview path — admins can always access the full site via this path
// Visit: craftonest3d.in/preview to see the full site while in maintenance mode
const PREVIEW_PATH = '/preview';

// ── Public site ────────────────────────────────────────────────────────────
import MainLayout  from './layout/MainLayout';
import Home        from './pages/Home/Home';
import Products    from './pages/Products/Products';
import About       from './pages/About/About';
import Contact     from './pages/Contact/Contact';
import NotFound    from './pages/NotFound/NotFound';
import ComingSoon  from './pages/ComingSoon/ComingSoon';
import Policy      from './pages/Policy/Policy';

// ── Admin shell ────────────────────────────────────────────────────────────
import ProtectedRoute  from './admin/components/ProtectedRoute';
import AdminLayout     from './admin/layout/AdminLayout';
import AdminSuspense   from './admin/components/AdminSuspense';

// ── Lazy loader with auto-reload on stale chunk ─────────────────────────────
// After a new deploy, old cached chunk filenames 404. We catch that and
// reload the page once so the browser fetches the new file names.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithReload(importFn: () => Promise<any>) {
  return lazy(() =>
    importFn().catch((err: unknown) => {
      const key = 'chunk-reload-once';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // Return a never-resolving promise while reloading
        return new Promise(() => {});
      }
      throw err;
    }),
  );
}

// ── Admin pages (lazy — never bundled into the public site) ────────────────
const AdminLogin       = lazyWithReload(() => import('./admin/pages/AdminLogin'));
const AdminDashboard   = lazyWithReload(() => import('./admin/pages/AdminDashboard'));
const AdminProducts    = lazyWithReload(() => import('./admin/pages/AdminProducts'));
const AdminOrders      = lazyWithReload(() => import('./admin/pages/AdminOrders'));
const AdminProductForm = lazyWithReload(() => import('./admin/pages/AdminProductForm'));
const AdminCategories  = lazyWithReload(() => import('./admin/pages/AdminCategories'));
const AdminContent     = lazyWithReload(() => import('./admin/pages/AdminContent'));
const AdminSettings    = lazyWithReload(() => import('./admin/pages/AdminSettings'));

// ── Wrap helper ────────────────────────────────────────────────────────────
const w = (C: React.ReactNode) => <AdminSuspense>{C}</AdminSuspense>;

export const router = createBrowserRouter([

  // ── Public site ───────────────────────────────────────────────────────────
  {
    path: '/',
    element: MAINTENANCE_MODE ? <ComingSoon /> : <MainLayout />,
    children: MAINTENANCE_MODE ? undefined : [
      { index: true,      element: <Home /> },
      { path: 'shop',     element: <Products /> },
      { path: 'our-work', element: <Products /> },
      { path: 'about',    element: <About /> },
      { path: 'contact',  element: <Contact /> },
      { path: 'policies', element: <Policy /> },
      { path: '*',        element: <NotFound /> },
    ],
  },

  // Catch-all in maintenance mode → coming soon
  ...(MAINTENANCE_MODE ? [{ path: '*', element: <ComingSoon /> }] : []),

  // ── Secret preview path (works even in maintenance mode) ──────────────────
  {
    path: PREVIEW_PATH,
    element: <MainLayout />,
    children: [
      { index: true,      element: <Home /> },
      { path: 'shop',     element: <Products /> },
      { path: 'about',    element: <About /> },
      { path: 'contact',  element: <Contact /> },
      { path: 'policies', element: <Policy /> },
      { path: '*',        element: <NotFound /> },
    ],
  },

  // ── Admin login (public) ──────────────────────────────────────────────────
  {
    path: '/admin/login',
    element: w(<AdminLogin />),
  },

  // ── Admin protected shell ─────────────────────────────────────────────────
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true,              element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',        element: w(<AdminDashboard />) },
      { path: 'products',         element: w(<AdminProducts />) },
      { path: 'orders',           element: w(<AdminOrders />) },
      { path: 'products/new',     element: w(<AdminProductForm />) },
      { path: 'products/:id',     element: w(<AdminProductForm />) },
      { path: 'categories',       element: w(<AdminCategories />) },
      { path: 'content',          element: w(<AdminContent />) },
      { path: 'settings',         element: w(<AdminSettings />) },
    ],
  },
]);

export default router;
