import React, { useState, useEffect } from 'react';
import blogService from '../../services/apiService';

const TrendingManager = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    position: 1,
    blogRef: '',
    isActive: true
  });

  useEffect(() => {
    loadTrendingPosts();
  }, []);

  const loadTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/trending/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTrendingPosts(data.trendingPosts);
      }
    } catch (error) {
      console.error('Error loading trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = currentPost 
        ? `http://localhost:5000/api/trending/${currentPost.id}`
        : 'http://localhost:5000/api/trending';
      
      const method = currentPost ? 'PUT' : 'POST';
      console.log(localStorage.getItem('token'));
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          position: parseInt(formData.position),
          blogRef: formData.blogRef || null,
          isActive: formData.isActive
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadTrendingPosts();
        resetForm();
        alert(currentPost ? 'Trending post updated!' : 'Trending post created!');
      } else {
        alert(data.message || 'Error saving trending post');
      }
    } catch (error) {
      console.error('Error saving trending post:', error);
      alert('Error saving trending post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      author: post.author,
      position: post.number,
      blogRef: post.blogRef || '',
      isActive: post.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this trending post?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/trending/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadTrendingPosts();
        alert('Trending post deleted successfully!');
      } else {
        alert(data.message || 'Error deleting trending post');
      }
    } catch (error) {
      console.error('Error deleting trending post:', error);
      alert('Error deleting trending post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      position: 1,
      blogRef: '',
      isActive: true
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-fire me-2"></i>
            Trending Posts Management
          </h2>
          <p className="text-muted mb-0">Manage trending posts displayed on the homepage</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          {showForm ? 'Cancel' : 'Add Trending Post'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {currentPost ? 'Edit Trending Post' : 'Add New Trending Post'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter trending post title..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="author" className="form-label">Author *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter author name..."
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="position" className="form-label">Position *</label>
                    <select
                      className="form-select"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (currentPost ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Trending Posts ({trendingPosts.length})</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Added By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingPosts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No trending posts found. Create your first trending post to get started!
                      </td>
                    </tr>
                  ) : (
                    trendingPosts.map(post => (
                      <tr key={post.id}>
                        <td>
                          <span className="badge bg-primary">{post.number}</span>
                        </td>
                        <td>{post.title}</td>
                        <td>{post.author}</td>
                        <td>
                          <span className={`badge ${post.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {post.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{post.addedBy}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(post)}
                              disabled={loading}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(post.id)}
                              disabled={loading}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingManager;
