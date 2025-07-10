import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png'; 
import LogoutIcon from '@mui/icons-material/Logout';// Make sure this path is correct

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // Create a ref for the menu
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Remove the token
    navigate('/admin/login'); // Redirect to login page
  };

  // Close the menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const isLoggedIn = !!localStorage.getItem('adminToken'); // Check if user is logged in

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="navbar-logo-img" />
        <Link to="/"><span className="navbar-logo-text">Namo Namah Shaswat Parivar</span></Link>
      </div>

      <div className="burger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link to="/events" onClick={closeMenu}>Events</Link></li>
        <li><Link to="/donation" onClick={closeMenu}>Donation</Link></li>
        <li><Link to="/gallery" onClick={closeMenu}>Gallery</Link></li>
        <li><Link to="/contactus" onClick={closeMenu}>Contact</Link></li>
        {isLoggedIn && (
          <li style={{cursor:"pointer"}} onClick={handleLogout}><LogoutIcon/></li> // Logout button
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
