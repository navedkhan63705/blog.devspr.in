import React, { useState, useEffect, useCallback } from 'react';
import blogService from '../../services/apiService';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load blogs from backend
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setInitialLoading(true);
      const blogsData = await blogService.getAllBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading blogs:', error);
      alert('Error loading blogs. Please check if the server is running.');
    } finally {
      setInitialLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    status: 'draft',
    featuredImage: '',
    tags: ''
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      status: 'draft',
      featuredImage: '',
      tags: ''
    });
    setCurrentBlog(null);
    setShowForm(false);
  }, []);

  // Fixed input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || blogService.generateExcerpt(formData.content),
        author: formData.author,
        category: formData.category,
        status: formData.status,
        featuredImage: formData.featuredImage,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (currentBlog) {
        const updatedBlog = await blogService.updateBlog(currentBlog._id, blogData);
        setBlogs(blogs.map(blog =>
          blog._id === currentBlog._id ? updatedBlog : blog
        ));
      } else {
        const newBlog = await blogService.createBlog(blogData);
        setBlogs([newBlog, ...blogs]);
      }

      resetForm();
      alert(currentBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert(error.message || 'Error saving blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      author: getAuthorName(blog.author),
      category: blog.category || '',
      status: blog.status || 'draft',
      featuredImage: blog.featuredImage || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      setLoading(true);
      try {
        await blogService.deleteBlog(blogId);
        setBlogs(blogs.filter(blog => blog._id !== blogId));
        alert('Blog deleted successfully!');
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert(error.message || 'Error deleting blog. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusToggle = async (blogId, newStatus) => {
    setLoading(true);
    try {
      const blog = blogs.find(b => b._id === blogId);
      const updatedBlog = await blogService.updateBlog(blogId, {
        ...blog,
        status: newStatus
      });

      setBlogs(blogs.map(blog =>
        blog._id === blogId ? updatedBlog : blog
      ));
      alert(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Error updating blog status:', error);
      alert(error.message || 'Error updating blog status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely extract author name
  const getAuthorName = (author) => {
    if (!author) return 'Unknown';
    if (typeof author === 'string') return author;
    if (typeof author === 'object' && author.name) return author.name;
    if (typeof author === 'object' && author.email) return author.email;
    return 'Unknown';
  };

  // Filter blogs with proper error handling
  const filteredBlogs = blogs.filter(blog => {
    if (!blog || typeof blog !== 'object') return false;

    const title = String(blog.title || '').toLowerCase();
    const content = String(blog.content || '').toLowerCase();
    const authorName = getAuthorName(blog.author).toLowerCase();
    const tags = Array.isArray(blog.tags) ? blog.tags : [];
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = title.includes(searchLower) ||
      content.includes(searchLower) ||
      authorName.includes(searchLower) ||
      tags.some(tag => String(tag).toLowerCase().includes(searchLower));

    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // BlogList component with fixed keys and proper data handling
  const BlogList = () => (
    <div className="card admin-shadow">
      <div className="card-header d-flex justify-content-between align-items-center bg-light">
        <h5 className="mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Blog Posts ({filteredBlogs.length} of {blogs.length})
        </h5>
        <button
          className="btn btn-primary btn-admin-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Post
        </button>
      </div>
      <div className="card-body">
        {initialLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>Loading blogs from server...</div>
          </div>
        ) : (
          <>
            <div className="admin-search-bar">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search blogs, authors, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Drafts Only</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {blogService.getCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterCategory('all');
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Post Details</th>
                    <th style={{ width: '12%' }}>Author</th>
                    <th style={{ width: '12%' }}>Category</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '8%' }}>Views</th>
                    <th style={{ width: '10%' }}>Updated</th>
                    <th style={{ width: '13%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="text-muted">
                          <i className="bi bi-inbox display-4 d-block mb-2"></i>
                          {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' ?
                            'No blogs match your search criteria.' :
                            'No blog posts found. Create your first post to get started!'
                          }
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map(blog => {
                      const blogId = blog._id;
                      const tags = Array.isArray(blog.tags) ? blog.tags : [];
                      const authorName = getAuthorName(blog.author);

                      return (
                        <tr key={blogId}>
                          <td>
                            <div className="d-flex align-items-start">
                              {blog.featuredImage && (
                                <img
                                  src={blog.featuredImage}
                                  alt={blog.title || 'Blog image'}
                                  className="me-3 admin-border-radius"
                                  style={{
                                    width: '60px',
                                    height: '45px',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <div className="fw-bold text-dark">{blog.title || 'Untitled'}</div>
                                {blog.excerpt && (
                                  <div className="text-muted small mt-1">
                                    {blog.excerpt.length > 80 ?
                                      blog.excerpt.substring(0, 80) + '...' :
                                      blog.excerpt
                                    }
                                  </div>
                                )}
                                <div className="mt-1">
                                  {tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={`${blogId}-tag-${index}`}
                                      className="badge bg-light text-dark me-1"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      {String(tag)}
                                    </span>
                                  ))}
                                  {tags.length > 3 && (
                                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                      +{tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                                {blog.readTime && (
                                  <div className="text-muted small">
                                    <i className="bi bi-clock me-1"></i>
                                    {blog.readTime}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-medium">{authorName}</div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{blog.category || 'Uncategorized'}</span>
                          </td>
                          <td>
                            <span className={`badge ${blog.status === 'published'
                              ? 'bg-success'
                              : 'bg-warning text-dark'
                              }`}>
                              <i className={`bi ${blog.status === 'published'
                                ? 'bi-eye'
                                : 'bi-file-earmark'
                                } me-1`}></i>
                              {blog.status || 'draft'}
                            </span>
                          </td>
                          <td>
                            <div className="fw-medium">{(blog.views || 0).toLocaleString()}</div>
                          </td>
                          <td>
                            <div className="small">
                              {blog.updatedAt ? blogService.formatDate(blog.updatedAt) : 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="btn-group" role="group" aria-label="Blog actions">
                              <button
                                className="btn btn-sm btn-outline-primary admin-action-btn"
                                onClick={() => handleEdit(blog)}
                                title="Edit blog post"
                                disabled={loading}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className={`btn btn-sm ${blog.status === 'published'
                                  ? 'btn-outline-warning'
                                  : 'btn-outline-success'
                                  } admin-action-btn`}
                                onClick={() => handleStatusToggle(
                                  blogId,
                                  blog.status === 'published' ? 'draft' : 'published'
                                )}
                                title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                disabled={loading}
                              >
                                <i className={`bi ${blog.status === 'published'
                                  ? 'bi-eye-slash'
                                  : 'bi-eye'
                                  }`}></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info admin-action-btn"
                                onClick={() => window.open(`/blog/${blogId}`, '_blank')}
                                title="Preview blog post"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger admin-action-btn"
                                onClick={() => handleDelete(blogId)}
                                title="Delete blog post"
                                disabled={loading}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredBlogs.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  Showing {filteredBlogs.length} of {blogs.length} blog posts
                </div>
                <div className="text-muted small">
                  Total Views: {blogs.reduce((sum, blog) => sum + (blog.views || 0), 0).toLocaleString()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-journal-text me-2"></i>
            Blog Management
          </h2>
          <p className="text-muted mb-0">Create, edit, and manage your blog posts</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            Total: {blogs.length}
          </span>
          <span className="badge bg-success fs-6">
            Published: {blogs.filter(b => b.status === 'published').length}
          </span>
          <span className="badge bg-warning text-dark fs-6">
            Drafts: {blogs.filter(b => b.status === 'draft').length}
          </span>
        </div>
      </div>

      {showForm ? (
        <BlogForm
          formData={formData}
          currentBlog={currentBlog}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      ) : (
        <BlogList />
      )}

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow">
            <div className="d-flex align-items-center">
              <div className="spinner-border text-primary me-3" role="status"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// BlogForm component with proper error handling
const BlogForm = ({ formData, currentBlog, loading, onInputChange, onSubmit, onCancel }) => (
  <div className="card admin-shadow">
    <div className="card-header d-flex justify-content-between align-items-center bg-light">
      <h5 className="mb-0">
        <i className={`bi ${currentBlog ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
        {currentBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h5>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onCancel}
      >
        <i className="bi bi-x-lg me-1"></i>
        Cancel
      </button>
    </div>
    <div className="card-body">
      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="mb-3">
              <label htmlFor="title" className="form-label fw-bold">Title *</label>
              <input
                type="text"
                className="form-control admin-form-control"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={onInputChange}
                required
                placeholder="Enter an engaging blog title..."
              />
            </div>

            <div className="mb-3">
              <label htmlFor="excerpt" className="form-label fw-bold">Excerpt</label>
              <textarea
                className="form-control admin-form-control"
                id="excerpt"
                name="excerpt"
                rows="2"
                value={formData.excerpt || ''}
                onChange={onInputChange}
                placeholder="Brief description (will auto-generate if left empty)..."
              />
              <div className="form-text">
                Leave empty to auto-generate from content. Max 150 characters recommended.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="content" className="form-label fw-bold">Content *</label>
              <textarea
                className="form-control admin-form-control"
                id="content"
                name="content"
                rows="12"
                value={formData.content || ''}
                onChange={onInputChange}
                required
                placeholder="Write your blog content here... You can use Markdown formatting."
              />
              <div className="form-text">
                Supports Markdown formatting. Estimated read time: {blogService.calculateReadTime(formData.content || '')}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="tags" className="form-label fw-bold">Tags</label>
              <input
                type="text"
                className="form-control admin-form-control"
                id="tags"
                name="tags"
                value={formData.tags || ''}
                onChange={onInputChange}
                placeholder="React, JavaScript, Tutorial (separate with commas)"
              />
              <div className="form-text">
                Enter tags separated by commas. Use relevant keywords for better discoverability.
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="mb-3">
              <label htmlFor="author" className="form-label fw-bold">Author *</label>
              <input
                type="text"
                className="form-control admin-form-control"
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={onInputChange}
                required
                placeholder="Author name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label fw-bold">Category *</label>
              <select
                className="form-select admin-form-control"
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={onInputChange}
                required
              >
                <option value="">Select Category</option>
                {blogService.getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="status" className="form-label fw-bold">Publication Status</label>
              <select
                className="form-select admin-form-control"
                id="status"
                name="status"
                value={formData.status || 'draft'}
                onChange={onInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div className="form-text">
                Draft posts are not visible to public. Published posts are live on your blog.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="featuredImage" className="form-label fw-bold">Featured Image URL</label>
              <input
                type="file"
                className="form-control admin-form-control"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage || ''}
                onChange={onInputChange}
              />

              <div className="form-text">
                Optional. Use a high-quality image (recommended: 800x400px).
              </div>
            </div>

            {formData.featuredImage && (
              <div className="mb-3">
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  className="img-fluid admin-border-radius"
                  style={{ maxHeight: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-admin-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {currentBlog ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`bi ${currentBlog ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                    {currentBlog ? 'Update Blog Post' : 'Create Blog Post'}
                  </>
                )}
              </button>

              {currentBlog && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancel}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);

export default BlogManager;