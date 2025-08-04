import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Page/Footer';
import Preloader from './components/Preloader';
import About from './components/Page/About';
import Contact from './components/Page/Contact';
import SinglePost from './components/Page/SinglePost';
import HomePage1 from './components/Page/HomePage';
import Login from './components/Login';
import AdminDashboard from './components/AdminPannel/AdminDashboard';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin auth check
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');

      if (savedUser && token) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          setAdminUser(user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
        }
      }
    } catch {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    if (userData.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      return;
    }
    setAdminUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    localStorage.setItem('adminToken', userData.token || '');
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  const handleSearch = (query) => setSearchQuery(query);
  const handleSearchStateChange = (searching) => setIsSearching(searching);

  const ShowNavbar = () => {
    const location = useLocation();
    // Show global Navbar for public pages except HomePage and admin
    if (location.pathname.startsWith('/admin') || location.pathname === '/') {
      return null;
    }
    return <Navbar onSearch={handleSearch} isSearching={isSearching} />;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <ShowNavbar />

        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <HomePage1
                searchQuery={searchQuery}
                onSearch={handleSearch}
                isSearching={isSearching}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog/:slug" element={<SinglePost />} />

          {/* Admin */}
          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated ? (
                <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Footer/Preloader only for public */}
        {!window.location.pathname.startsWith('/admin') && (
          <>
            <Footer />
            <Preloader />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
