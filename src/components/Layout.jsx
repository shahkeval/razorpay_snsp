// src/components/Layout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    if (location.pathname.startsWith('/admin')) {
      const token = localStorage.getItem('adminToken');
      if (!token && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* <Footer/> */}
    </>
  );
};

export default Layout;
