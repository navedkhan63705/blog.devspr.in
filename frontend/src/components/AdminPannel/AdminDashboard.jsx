import React, { useState } from 'react';
import BlogManager from './BlogManager';
import TrendingManager from './TrendingManager';

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    // Call parent logout function
    onLogout();
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'blogs':
        return <BlogManager />;
      case 'trending':
        return <TrendingManager />;
      case 'dashboard':
      default:
        return (
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card admin-shadow">
                <div className="card-body text-center">
                  <div className="admin-stat-icon bg-primary">
                    <i className="bi bi-journal-text"></i>
                  </div>
                  <h4 className="mt-3 mb-1">0</h4>
                  <p className="text-muted mb-0">Total Posts</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card admin-shadow">
                <div className="card-body text-center">
                  <div className="admin-stat-icon bg-success">
                    <i className="bi bi-eye"></i>
                  </div>
                  <h4 className="mt-3 mb-1">0</h4>
                  <p className="text-muted mb-0">Published</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card admin-shadow">
                <div className="card-body text-center">
                  <div className="admin-stat-icon bg-warning">
                    <i className="bi bi-file-earmark"></i>
                  </div>
                  <h4 className="mt-3 mb-1">0</h4>
                  <p className="text-muted mb-0">Drafts</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card admin-shadow">
                <div className="card-body text-center">
                  <div className="admin-stat-icon bg-info">
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h4 className="mt-3 mb-1">0</h4>
                  <p className="text-muted mb-0">Total Views</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Safely extract user data with fallbacks
  const userName = adminUser?.name || 'Admin';
  const userEmail = adminUser?.email || 'admin@example.com';

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <h1 className="admin-title mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Admin Dashboard
              </h1>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <button 
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {userName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">Logged in as</small><br/>
                      <strong>{userEmail}</strong>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="admin-nav">
        <div className="container-fluid">
          <ul className="nav nav-tabs admin-tabs">
            <li className="nav-item" key="nav-dashboard">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </button>
            </li>
            <li className="nav-item" key="nav-blogs">
              <button 
                className={`nav-link ${activeTab === 'blogs' ? 'active' : ''}`}
                onClick={() => setActiveTab('blogs')}
              >
                <i className="bi bi-journal-text me-2"></i>
                Blog Posts
              </button>
            </li>
            <li className="nav-item" key="nav-trending">
              <button 
                className={`nav-link ${activeTab === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                <i className="bi bi-graph-up-arrow me-2"></i>
                Trending Posts
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="admin-content">
        <div className="container-fluid py-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;