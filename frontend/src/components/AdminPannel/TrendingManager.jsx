import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrendingManager = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    position: 1,
    blogRef: '',
    isActive: true,
    description: ''
  });

  // Dynamic API configuration
  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Get auth token dynamically
  const getAuthToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin-token';
  };

  // Dynamic API headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    loadTrendingPosts();
    loadAllPosts();
  }, []);

  // GET /admin - Fetch all trending posts for admin
  const loadTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/trending/admin`, {
        headers: getHeaders()
      });
      
      if (response.data.success) {
        setTrendingPosts(response.data.trendingPosts || []);
      } else {
        console.error('Failed to load trending posts:', response.data.message);
        // Fallback to mock data
        setMockTrendingData();
      }
    } catch (error) {
      console.error('Error loading trending posts:', error);
      // Fallback to mock data for development
      setMockTrendingData();
    } finally {
      setLoading(false);
    }
  };

  // Load all available blog posts for selection
  const loadAllPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs?limit=100`, {
        headers: getHeaders()
      });
      
      if (response.data.success) {
        setAllPosts(response.data.blogs || []);
      }
    } catch (error) {
      console.error('Error loading all posts:', error);
    }
  };

  // Mock data fallback
  const setMockTrendingData = () => {
    const mockData = [
      {
        _id: '1',
        title: 'Introduction to React Hooks',
        author: 'John Doe',
        position: 1,
        isActive: true,
        blogRef: 'blog1',
        createdAt: new Date().toISOString(),
        views: 1250,
        blog: {
          _id: 'blog1',
          title: 'Introduction to React Hooks',
          slug: 'intro-react-hooks'
        }
      },
      {
        _id: '2', 
        title: 'Advanced JavaScript Patterns',
        author: 'Jane Smith',
        position: 2,
        isActive: true,
        blogRef: 'blog2',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        views: 980,
        blog: {
          _id: 'blog2',
          title: 'Advanced JavaScript Patterns',
          slug: 'advanced-js-patterns'
        }
      }
    ];
    setTrendingPosts(mockData);
  };

  // POST / - Create new trending post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        position: parseInt(formData.position),
        blogRef: formData.blogRef || null,
        isActive: formData.isActive,
        description: formData.description
      };

      let response;
      
      if (currentPost) {
        // PUT /:id - Update existing trending post
        response = await axios.put(
          `${API_BASE_URL}/trending/${currentPost._id}`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        // POST / - Create new trending post
        response = await axios.post(
          `${API_BASE_URL}/trending`,
          payload,
          { headers: getHeaders() }
        );
      }
      
      if (response.data.success) {
        await loadTrendingPosts();
        resetForm();
        showNotification(
          currentPost ? 'Trending post updated successfully!' : 'Trending post created successfully!',
          'success'
        );
      } else {
        showNotification(response.data.message || 'Error saving trending post', 'error');
      }
    } catch (error) {
      console.error('Error saving trending post:', error);
      showNotification('Error saving trending post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE /:id - Delete trending post
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this trending post?')) {
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await axios.delete(
        `${API_BASE_URL}/trending/${postId}`,
        { headers: getHeaders() }
      );
      
      if (response.data.success) {
        await loadTrendingPosts();
        showNotification('Trending post deleted successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Error deleting trending post', 'error');
      }
    } catch (error) {
      console.error('Error deleting trending post:', error);
      showNotification('Error deleting trending post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (post) => {
    try {
      setActionLoading(true);
      
      const response = await axios.put(
        `${API_BASE_URL}/trending/${post._id}`,
        { ...post, isActive: !post.isActive },
        { headers: getHeaders() }
      );
      
      if (response.data.success) {
        await loadTrendingPosts();
        showNotification(
          `Trending post ${!post.isActive ? 'activated' : 'deactivated'} successfully!`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      showNotification('Error updating status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      author: post.author,
      position: post.position,
      blogRef: post.blogRef || '',
      isActive: post.isActive,
      description: post.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      position: 1,
      blogRef: '',
      isActive: true,
      description: ''
    });
    setCurrentPost(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="trending-manager">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up-arrow me-2"></i>
          Trending Posts Management
        </h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={actionLoading}
          >
            <i className="bi bi-plus me-2"></i>
            Add Trending Post
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={loadTrendingPosts}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'fa-spin' : ''}`}></i> 
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{trendingPosts.length}</h3>
              <p className="mb-0">Total Trending Posts</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">
                {trendingPosts.filter(post => post.isActive).length}
              </h3>
              <p className="mb-0">Active Posts</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">
                {trendingPosts.filter(post => !post.isActive).length}
              </h3>
              <p className="mb-0">Inactive Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Posts List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Current Trending Posts</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading trending posts...</p>
            </div>
          ) : trendingPosts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingPosts
                    .sort((a, b) => a.position - b.position)
                    .map(post => (
                    <tr key={post._id}>
                      <td>
                        <span className="badge bg-primary">{post.position}</span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{post.title}</div>
                          {post.blog?.slug && (
                            <small className="text-muted">/{post.blog.slug}</small>
                          )}
                        </div>
                      </td>
                      <td>{post.author}</td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={post.isActive}
                            onChange={() => handleToggleActive(post)}
                            disabled={actionLoading}
                          />
                          <label className="form-check-label">
                            <span className={`badge ${post.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {post.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <small>{formatDate(post.createdAt)}</small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(post)}
                            disabled={actionLoading}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(post._id)}
                            disabled={actionLoading}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-graph-up display-4 text-muted"></i>
              <p className="mt-2 text-muted">No trending posts configured</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create First Trending Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentPost ? 'Edit Trending Post' : 'Add New Trending Post'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Position</label>
                    <input
                      type="number"
                      className="form-control"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Blog Reference (Optional)</label>
                    <select
                      className="form-select"
                      name="blogRef"
                      value={formData.blogRef}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a blog post</option>
                      {allPosts.map(post => (
                        <option key={post._id} value={post._id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">
                        Active (visible on website)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {currentPost ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      currentPost ? 'Update Post' : 'Create Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 9999 }}>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingManager;