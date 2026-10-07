import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// ── Public site ────────────────────────────────────────────────────────────
import MainLayout from './layout/MainLayout';
import Home       from './pages/Home/Home';
import Products   from './pages/Products/Products';
import About      from './pages/About/About';
import Contact    from './pages/Contact/Contact';
import NotFound   from './pages/NotFound/NotFound';

// ── Admin shell ────────────────────────────────────────────────────────────
import ProtectedRoute  from './admin/components/ProtectedRoute';
import AdminLayout     from './admin/layout/AdminLayout';
import AdminSuspense   from './admin/components/AdminSuspense';

// ── Admin pages (lazy — never bundled into the public site) ────────────────
const AdminLogin       = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard   = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProducts    = lazy(() => import('./admin/pages/AdminProducts'));
const AdminProductForm = lazy(() => import('./admin/pages/AdminProductForm'));
const AdminCategories  = lazy(() => import('./admin/pages/AdminCategories'));
const AdminContent     = lazy(() => import('./admin/pages/AdminContent'));
const AdminSettings    = lazy(() => import('./admin/pages/AdminSettings'));

// ── Wrap helper ────────────────────────────────────────────────────────────
const w = (C: React.ReactNode) => <AdminSuspense>{C}</AdminSuspense>;

export const router = createBrowserRouter([

  // ── Public site ───────────────────────────────────────────────────────────
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,      element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'about',    element: <About /> },
      { path: 'contact',  element: <Contact /> },
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
      { path: 'products/new',     element: w(<AdminProductForm />) },
      { path: 'products/:id',     element: w(<AdminProductForm />) },
      { path: 'categories',       element: w(<AdminCategories />) },
      { path: 'content',          element: w(<AdminContent />) },
      { path: 'settings',         element: w(<AdminSettings />) },
    ],
  },
]);

export default router;
