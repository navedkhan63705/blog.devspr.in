import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminPannel/AdminDashboard';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const savedUser = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');
      
      if (savedUser && token) {
        const user = JSON.parse(savedUser);
        
        // Check if user has admin role
        if (user.role === 'admin') {
          setAdminUser(user);
          setIsAuthenticated(true);
        } else {
          // Not an admin, clear storage
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    // Check if user has admin role
    if (userData.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      return;
    }
    
    setAdminUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
};

export default AdminApp;
