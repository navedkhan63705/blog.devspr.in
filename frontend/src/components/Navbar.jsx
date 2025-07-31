import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current path to highlight active link
  const getCurrentPage = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/about')) return 'about';
    if (location.pathname.startsWith('/post')) return 'single-post';
    if (location.pathname.startsWith('/contact')) return 'contact';
    return '';
  };

  const currentPage = getCurrentPage();

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid position-relative d-flex align-items-center justify-content-between">

        <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
          <h1 className="sitename">ZenBlog</h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li>
              <Link to="/" className={currentPage === 'home' ? 'active' : ''}>Home</Link>
            </li>
            <li>
              <Link to="/about" className={currentPage === 'about' ? 'active' : ''}>About</Link>
            </li>
            <li>
              <Link to="/post/sample-id" className={currentPage === 'single-post' ? 'active' : ''}>Single Post</Link>
            </li>
            <li>
              <Link to="/contact" className={currentPage === 'contact' ? 'active' : ''}>Contact</Link>
            </li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        <div className="header-social-links">
          <a href="#" className="twitter"><i className="bi bi-twitter"></i></a>
          <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
          <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
          <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>

          {/* Login Button for Admin */}
          <button 
            className="btn btn-outline-primary btn-sm ms-3"
            onClick={() => navigate('/admin/login')}
            title="Admin Login"
          >
            <i className="bi bi-person-lock me-1"></i>
            Login
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
