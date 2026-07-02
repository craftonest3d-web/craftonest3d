import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import CartDrawer from '../components/cart/CartDrawer';

export const MainLayout: React.FC = () => {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: 'var(--pn-bg-light)' }}
    >
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      {/* Cart drawer — renders at root level so it overlays everything */}
      <CartDrawer />
    </div>
  );
};

export default MainLayout;
