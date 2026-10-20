import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import ScrollToTop from '../components/common/ScrollToTop';
import MobileNav from '../components/common/MobileNav';
import { FestivalPopup } from '../components/common/FestivalGreeting';
import { recordVisitOncePerSession } from '../services/visitService';

export const MainLayout: React.FC = () => {
  useEffect(() => { recordVisitOncePerSession(); }, []);
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: 'var(--pn-bg-paper)' }}
    >
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      {/* Cart drawer — renders at root level so it overlays everything */}
      <CartDrawer />
      {/* Smooth scroll-to-top button */}
      <ScrollToTop />
      {/* App-style bottom navigation (mobile only) */}
      <MobileNav />
      {/* Festival greeting popup (admin-controlled, once per visit) */}
      <FestivalPopup />
    </div>
  );
};

export default MainLayout;
