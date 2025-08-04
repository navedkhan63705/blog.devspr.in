import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentManager = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [currentPage, filter, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`http://localhost:5000/api/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setComments(response.data.comments || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalComments(response.data.pagination?.total || 0);
      } else {
        console.error('Failed to fetch comments:', response.data.message);
        // Fallback to mock data for development
        setMockData();
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback to mock data for development
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/comments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        // Generate stats from comments data
        generateStatsFromComments();
      }
    } catch (error) {
      console.error('Error fetching comment stats:', error);
      // Generate stats from comments data
      generateStatsFromComments();
    }
  };

  const setMockData = () => {
    // Mock data for development when API is not available
    const mockComments = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        content: 'This is a great blog post! I really enjoyed reading it and learned a lot from your insights.',
        status: 'approved',
        createdAt: new Date().toISOString(),
        blogId: { 
          _id: 'blog1', 
          title: 'Introduction to React Development' 
        }
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        content: 'Very informative article. Could you please write more about advanced topics?',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        blogId: { 
          _id: 'blog2', 
          title: 'JavaScript Best Practices' 
        }
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        content: 'I disagree with some points mentioned in this article.',
        status: 'rejected',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        blogId: { 
          _id: 'blog3', 
          title: 'Modern Web Development' 
        }
      },
      {
        _id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        content: 'Excellent explanation! This helped me understand the concepts much better.',
        status: 'approved',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        blogId: { 
          _id: 'blog1', 
          title: 'Introduction to React Development' 
        }
      },
      {
        _id: '5',
        name: 'David Brown',
        email: 'david@example.com',
        content: 'Waiting for your next post on this topic!',
        status: 'pending',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        blogId: { 
          _id: 'blog4', 
          title: 'Advanced CSS Techniques' 
        }
      }
    ];

    // Filter comments based on current filter
    let filteredComments = mockComments;
    if (filter !== 'all') {
      filteredComments = mockComments.filter(comment => comment.status === filter);
    }
    if (searchTerm) {
      filteredComments = filteredComments.filter(comment => 
        comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setComments(filteredComments);
    setTotalComments(filteredComments.length);
    setTotalPages(Math.ceil(filteredComments.length / 10));
  };

  const generateStatsFromComments = () => {
    const approved = comments.filter(c => c.status === 'approved').length;
    const pending = comments.filter(c => c.status === 'pending').length;
    const rejected = comments.filter(c => c.status === 'rejected').length;
    
    setStats({
      total: totalComments || comments.length,
      approved,
      pending,
      rejected
    });
  };

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      setActionLoading(true);
      
      const response = await axios.put(
        `http://localhost:5000/api/comments/${commentId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Update local state immediately for better UX
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, status: newStatus }
              : comment
          )
        );
        
        // Refresh data from server
        fetchComments();
        fetchStats();
        
        // Show success message
        showNotification(`Comment ${newStatus} successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      showNotification('Failed to update comment status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const response = await axios.delete(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Remove from local state immediately
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== commentId)
        );
        
        // Refresh data
        fetchComments();
        fetchStats();
        
        showNotification('Comment deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Failed to delete comment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedComments.length === 0) {
      showNotification('Please select comments to perform bulk action', 'warning');
      return;
    }
    
    const actionText = action === 'delete' ? 'delete' : `mark as ${action}`;
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedComments.length} comment(s)?`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const promises = selectedComments.map(commentId => {
        if (action === 'delete') {
          return axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
              'Content-Type': 'application/json'
            }
          });
        } else {
          return axios.put(
            `http://localhost:5000/api/comments/${commentId}/status`,
            { status: action },
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || 'admin-token'}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      });

      await Promise.all(promises);
      
      setSelectedComments([]);
      fetchComments();
      fetchStats();
      
      showNotification(`Bulk action completed successfully!`, 'success');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showNotification('Failed to perform bulk action', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (message, type) => {
    // Simple notification system - you can enhance this
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'bg-success',
      pending: 'bg-warning',
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: 'bi-check-circle',
      pending: 'bi-clock',
      rejected: 'bi-x-circle'
    };
    return icons[status] || 'bi-question-circle';
  };

  // Generate stats when comments change
  useEffect(() => {
    generateStatsFromComments();
  }, [comments]);

  return (
    <div className="comment-manager">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-chat-dots me-2"></i>
          Comment Management
          <small className="text-muted ms-2">({totalComments} total)</small>
        </h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={fetchComments}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'fa-spin' : ''}`}></i> 
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center comment-stat-card">
            <div className="card-body">
              <div className="stat-icon bg-primary mb-2">
                <i className="bi bi-chat-dots"></i>
              </div>
              <h3 className="text-primary">{stats.total}</h3>
              <p className="mb-0">Total Comments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center comment-stat-card">
            <div className="card-body">
              <div className="stat-icon bg-success mb-2">
                <i className="bi bi-check-circle"></i>
              </div>
              <h3 className="text-success">{stats.approved}</h3>
              <p className="mb-0">Approved</p>
              <small className="text-muted">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center comment-stat-card">
            <div className="card-body">
              <div className="stat-icon bg-warning mb-2">
                <i className="bi bi-clock"></i>
              </div>
              <h3 className="text-warning">{stats.pending}</h3>
              <p className="mb-0">Pending</p>
              {stats.pending > 0 && (
                <small className="text-danger">Needs attention!</small>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center comment-stat-card">
            <div className="card-body">
              <div className="stat-icon bg-danger mb-2">
                <i className="bi bi-x-circle"></i>
              </div>
              <h3 className="text-danger">{stats.rejected}</h3>
              <p className="mb-0">Rejected</p>
              <small className="text-muted">
                {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% of total
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Search Comments</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Filter by Status</label>
              <select 
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Comments ({stats.total})</option>
                <option value="approved">Approved ({stats.approved})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Bulk Actions</label>
              {selectedComments.length > 0 ? (
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle w-100"
                    type="button"
                    data-bs-toggle="dropdown"
                    disabled={actionLoading}
                  >
                    Actions ({selectedComments.length})
                  </button>
                  <ul className="dropdown-menu w-100">
                    <li>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleBulkAction('approved')}
                      >
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Approve Selected
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleBulkAction('rejected')}
                      >
                        <i className="bi bi-x-circle text-danger me-2"></i>
                        Reject Selected
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={() => handleBulkAction('delete')}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete Selected
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button className="btn btn-outline-secondary w-100" disabled>
                  Select comments first
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedComments(comments.map(c => c._id));
                            } else {
                              setSelectedComments([]);
                            }
                          }}
                          checked={selectedComments.length === comments.length && comments.length > 0}
                          indeterminate={selectedComments.length > 0 && selectedComments.length < comments.length}
                        />
                      </th>
                      <th>Author</th>
                      <th>Comment</th>
                      <th>Blog Post</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map(comment => (
                      <tr key={comment._id} className={selectedComments.includes(comment._id) ? 'table-active' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedComments.includes(comment._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedComments([...selectedComments, comment._id]);
                              } else {
                                setSelectedComments(selectedComments.filter(id => id !== comment._id));
                              }
                            }}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=6366f1&color=fff&size=32&rounded=true`}
                              alt={comment.name}
                              className="rounded-circle me-2"
                              width="32"
                              height="32"
                            />
                            <div>
                              <div className="fw-bold">{comment.name}</div>
                              <small className="text-muted">{comment.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '250px' }}>
                            <p className="mb-1">
                              {comment.content.length > 100 
                                ? `${comment.content.substring(0, 100)}...`
                                : comment.content
                              }
                            </p>
                            {comment.content.length > 100 && (
                              <button 
                                className="btn btn-sm btn-link p-0"
                                onClick={() => {
                                  // Show full content in modal or expand
                                  alert(comment.content);
                                }}
                              >
                                Read more
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '150px' }}>
                            <div className="fw-bold">{comment.blogId?.title || 'N/A'}</div>
                            {comment.blogId?._id && (
                              <small className="text-muted">ID: {comment.blogId._id.substring(0, 8)}...</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <small className="d-block">{formatDate(comment.createdAt)}</small>
                            <small className="text-muted">
                              {Math.ceil((new Date() - new Date(comment.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(comment.status)}`}>
                            <i className={`bi ${getStatusIcon(comment.status)} me-1`}></i>
                            {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {comment.status !== 'approved' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleStatusChange(comment._id, 'approved')}
                                disabled={actionLoading}
                                title="Approve Comment"
                              >
                                <i className="bi bi-check"></i>
                              </button>
                            )}
                            {comment.status !== 'rejected' && (
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleStatusChange(comment._id, 'rejected')}
                                disabled={actionLoading}
                                title="Reject Comment"
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(comment._id)}
                              disabled={actionLoading}
                              title="Delete Comment"
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

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalComments)} of {totalComments} comments
                      </small>
                    </div>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          First
                        </button>
                      </li>
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          Last
                        </button>
                      </li>
                    </ul>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-chat display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Comments Found</h4>
              <p className="text-muted">
                {filter !== 'all' 
                  ? `No ${filter} comments match your criteria.`
                  : searchTerm 
                    ? `No comments match "${searchTerm}".`
                    : 'No comments have been posted yet.'
                }
              </p>
              {(filter !== 'all' || searchTerm) && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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

export default CommentManager;