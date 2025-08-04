  import React, { useState, useEffect } from 'react';
  import BlogManager from './BlogManager';
  import TrendingManager from './TrendingManager';
  import CommentManager from './CommentManager';
  
 
  
  import axios from 'axios';

  const AdminDashboard = ({ adminUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      totalComments: 0,
      pendingComments: 0,
      totalUsers: 0,
      activeUsers: 0,
      todayVisits: 0,
      monthlyGrowth: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [topPosts, setTopPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
      fetchDashboardData();
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [
          blogsResponse,
          commentsResponse,
          usersResponse,
          analyticsResponse
        ] = await Promise.allSettled([
          axios.get('https://blog-devspr-in.onrender.com/api/blogs/stats'),
          axios.get('https://blog-devspr-in.onrender.com/api/comments/stats'),
          axios.get('https://blog-devspr-in.onrender.com/api/users/stats'),
          axios.get('https://blog-devspr-in.onrender.com/api/analytics/dashboard')
        ]);

        // Process blog stats
        if (blogsResponse.status === 'fulfilled') {
          const blogStats = blogsResponse.value.data.stats;
          setStats(prev => ({
            ...prev,
            totalPosts: blogStats.total || 0,
            publishedPosts: blogStats.published || 0,
            draftPosts: blogStats.drafts || 0,
            totalViews: blogStats.totalViews || 0
          }));
        }

        // Process comment stats
        if (commentsResponse.status === 'fulfilled') {
          const commentStats = commentsResponse.value.data.stats;
          setStats(prev => ({
            ...prev,
            totalComments: commentStats.total || 0,
            pendingComments: commentStats.pending || 0
          }));
        }

        // Process user stats
        if (usersResponse.status === 'fulfilled') {
          const userStats = usersResponse.value.data.stats;
          setStats(prev => ({
            ...prev,
            totalUsers: userStats.total || 0,
            activeUsers: userStats.active || 0
          }));
        }

        // Process analytics
        if (analyticsResponse.status === 'fulfilled') {
          const analytics = analyticsResponse.value.data;
          setStats(prev => ({
            ...prev,
            todayVisits: analytics.todayVisits || 0,
            monthlyGrowth: analytics.monthlyGrowth || 0
          }));
          setRecentActivity(analytics.recentActivity || []);
          setTopPosts(analytics.topPosts || []);
        }

        // Check for notifications
        checkNotifications();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkNotifications = () => {
      const newNotifications = [];
      
      if (stats.pendingComments > 0) {
        newNotifications.push({
          id: 'pending-comments',
          type: 'warning',
          title: 'Pending Comments',
          message: `${stats.pendingComments} comments waiting for approval`,
          action: () => setActiveTab('comments')
        });
      }

      if (stats.draftPosts > 5) {
        newNotifications.push({
          id: 'many-drafts',
          type: 'info',
          title: 'Many Drafts',
          message: `You have ${stats.draftPosts} unpublished drafts`,
          action: () => setActiveTab('blogs')
        });
      }

      setNotifications(newNotifications);
    };

    const handleLogout = () => {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      onLogout();
    };

    const calculateGrowthPercentage = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    const renderDashboardContent = () => (
      <div className="admin-dashboard-content">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="admin-notifications">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`alert alert-${notification.type} alert-dismissible fade show`}
                    role="alert"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{notification.title}:</strong> {notification.message}
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={notification.action}
                      >
                        View
                      </button>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setNotifications(prev => 
                        prev.filter(n => n.id !== notification.id)
                      )}
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card admin-stat-card admin-shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="admin-stat-icon bg-primary">
                      <i className="bi bi-journal-text"></i>
                    </div>
                    <h3 className="mt-3 mb-1">{formatNumber(stats.totalPosts)}</h3>
                    <p className="text-muted mb-0">Total Posts</p>
                    <small className="text-success">
                      <i className="bi bi-arrow-up"></i> {stats.publishedPosts} published
                    </small>
                  </div>
                  <div className="admin-stat-trend">
                    <span className="badge bg-primary">+{calculateGrowthPercentage(stats.totalPosts, stats.totalPosts - 5)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card admin-stat-card admin-shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="admin-stat-icon bg-success">
                      <i className="bi bi-eye"></i>
                    </div>
                    <h3 className="mt-3 mb-1">{formatNumber(stats.totalViews)}</h3>
                    <p className="text-muted mb-0">Total Views</p>
                    <small className="text-primary">
                      <i className="bi bi-calendar-day"></i> {formatNumber(stats.todayVisits)} today
                    </small>
                  </div>
                  <div className="admin-stat-trend">
                    <span className="badge bg-success">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card admin-stat-card admin-shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="admin-stat-icon bg-info">
                      <i className="bi bi-chat-dots"></i>
                    </div>
                    <h3 className="mt-3 mb-1">{formatNumber(stats.totalComments)}</h3>
                    <p className="text-muted mb-0">Comments</p>
                    <small className={stats.pendingComments > 0 ? "text-warning" : "text-success"}>
                      <i className="bi bi-clock"></i> {stats.pendingComments} pending
                    </small>
                  </div>
                  <div className="admin-stat-trend">
                    <span className="badge bg-info">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card admin-stat-card admin-shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="admin-stat-icon bg-warning">
                      <i className="bi bi-people"></i>
                    </div>
                    <h3 className="mt-3 mb-1">{formatNumber(stats.totalUsers)}</h3>
                    <p className="text-muted mb-0">Users</p>
                    <small className="text-success">
                      <i className="bi bi-person-check"></i> {stats.activeUsers} active
                    </small>
                  </div>
                  <div className="admin-stat-trend">
                    <span className="badge bg-warning">Growing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="row">
          {/* Recent Activity */}
          <div className="col-lg-8 mb-4">
            <div className="card admin-shadow h-100">
              <div className="card-header bg-transparent border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-activity me-2"></i>
                    Recent Activity
                  </h5>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="admin-activity-list">
                    {recentActivity.slice(0, 8).map((activity, index) => (
                      <div key={index} className="admin-activity-item">
                        <div className="admin-activity-icon">
                          <i className={`bi ${activity.icon}`}></i>
                        </div>
                        <div className="admin-activity-content">
                          <div className="admin-activity-title">{activity.title}</div>
                          <div className="admin-activity-desc">{activity.description}</div>
                          <div className="admin-activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox display-4"></i>
                    <p className="mt-2">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Posts */}
          <div className="col-lg-4 mb-4">
            <div className="card admin-shadow h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Top Performing Posts
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : topPosts.length > 0 ? (
                  <div className="admin-top-posts">
                    {topPosts.slice(0, 5).map((post, index) => (
                      <div key={index} className="admin-top-post-item">
                        <div className="admin-post-rank">#{index + 1}</div>
                        <div className="admin-post-content">
                          <div className="admin-post-title">{post.title}</div>
                          <div className="admin-post-stats">
                            <span className="me-3">
                              <i className="bi bi-eye"></i> {formatNumber(post.views)}
                            </span>
                            <span>
                              <i className="bi bi-chat"></i> {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-graph-up display-4"></i>
                    <p className="mt-2">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="card admin-shadow">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="bi bi-lightning me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="btn btn-outline-primary w-100 admin-quick-action"
                      onClick={() => setActiveTab('blogs')}
                    >
                      <i className="bi bi-plus-circle mb-2"></i>
                      <div>Create New Post</div>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="btn btn-outline-success w-100 admin-quick-action"
                      onClick={() => setActiveTab('comments')}
                    >
                      <i className="bi bi-check-circle mb-2"></i>
                      <div>Review Comments</div>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="btn btn-outline-warning w-100 admin-quick-action"
                      onClick={() => setActiveTab('trending')}
                    >
                      <i className="bi bi-graph-up-arrow mb-2"></i>
                      <div>Manage Trending</div>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="btn btn-outline-info w-100 admin-quick-action"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <i className="bi bi-bar-chart mb-2"></i>
                      <div>View Analytics</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderContent = () => {
      switch(activeTab) {
        case 'blogs':
          return <BlogManager />;
        case 'trending':
          return <TrendingManager />;
        case 'comments':
          return <CommentManager />;
        
         
        
        case 'dashboard':
        default:
          return renderDashboardContent();
      }
    };

    const userName = adminUser?.name || 'Admin';
    const userEmail = adminUser?.email || 'admin@example.com';
    const userRole = adminUser?.role || 'Administrator';

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
                {loading && (
                  <div className="ms-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="d-flex align-items-center gap-3">
                {/* Notifications */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary position-relative" 
                    type="button" 
                    id="notificationDropdown" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-bell"></i>
                    {notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{minWidth: '300px'}}>
                    <li><h6 className="dropdown-header">Notifications</h6></li>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <li key={notification.id}>
                          <div className="dropdown-item-text">
                            <strong>{notification.title}</strong><br/>
                            <small>{notification.message}</small>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li><span className="dropdown-item-text">No new notifications</span></li>
                    )}
                  </ul>
                </div>

                {/* User Dropdown */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown"
                  >
                    <div className="admin-user-avatar me-2">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&size=32&rounded=true`}
                        alt={userName}
                        className="rounded-circle"
                      />
                    </div>
                    {userName}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <div className="dropdown-item-text">
                        <div className="d-flex align-items-center">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&size=40&rounded=true`}
                            alt={userName}
                            className="rounded-circle me-3"
                          />
                          <div>
                            <strong>{userName}</strong><br/>
                            <small className="text-muted">{userRole}</small><br/>
                            <small className="text-muted">{userEmail}</small>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setActiveTab('settings')}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Settings
                      </button>
                    </li>
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

        {/* Enhanced Navigation */}
        <nav className="admin-nav">
          <div className="container-fluid">
            <ul className="nav nav-tabs admin-tabs">
              {[
                { id: 'dashboard', icon: 'speedometer2', label: 'Dashboard' },
                { id: 'blogs', icon: 'journal-text', label: 'Blog Posts', badge: stats.draftPosts > 0 ? stats.draftPosts : null },
                { id: 'comments', icon: 'chat-dots', label: 'Comments', badge: stats.pendingComments > 0 ? stats.pendingComments : null },
                { id: 'trending', icon: 'graph-up-arrow', label: 'Trending' },
                { id: 'users', icon: 'people', label: 'Users' },
                { id: 'analytics', icon: 'bar-chart', label: 'Analytics' },
                { id: 'settings', icon: 'gear', label: 'Settings' }
              ].map(tab => (
                <li className="nav-item" key={`nav-${tab.id}`}>
                  <button 
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi bi-${tab.icon} me-2`}></i>
                    {tab.label}
                    {tab.badge && (
                      <span className="badge bg-danger ms-2">{tab.badge}</span>
                    )}
                  </button>
                </li>
              ))}
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
