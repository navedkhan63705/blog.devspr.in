import React, { useState, useEffect } from 'react';
import blogService from '../../services/apiService';
import { Link } from 'react-router-dom';
import '../style/HeroSlider.css';

const HeroSlider = ({ searchQuery, onSearchStateChange }) => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [originalBlogs, setOriginalBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine if search is active
  const isSearchActive = searchQuery && searchQuery.trim() !== '';
  
  // Use featuredBlogs as displayBlogs for consistency
  const displayBlogs = featuredBlogs;

  useEffect(() => { 
    fetchBlogsData(); 
  }, []);

  useEffect(() => {
    // Call onSearchStateChange if provided
    if (onSearchStateChange) {
      onSearchStateChange(loading);
    }
  }, [loading, onSearchStateChange]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFeaturedBlogs(originalBlogs);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filteredBlogs = originalBlogs.filter(blog =>
      blog.title.toLowerCase().includes(lowerQuery) ||
      blog.content.toLowerCase().includes(lowerQuery) ||
      blog.category.toLowerCase().includes(lowerQuery) ||
      blog.author.toLowerCase().includes(lowerQuery)
    );

    // Sort filtered results to show exact matches first
    const sortedBlogs = filteredBlogs.sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(lowerQuery);
      const bMatch = b.title.toLowerCase().includes(lowerQuery);
      return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
    });

    setFeaturedBlogs(sortedBlogs);
  }, [searchQuery, originalBlogs]);

  const fetchBlogsData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured blogs
      const featuredResponse = await blogService.getAllBlogs({ limit: 15, page: 1 });
      let featuredData = Array.isArray(featuredResponse)
        ? featuredResponse
        : featuredResponse?.blogs || [];

      // Fetch trending posts
      const trendingData = await blogService.getTrendingPosts();

      setFeaturedBlogs(featuredData);
      setOriginalBlogs(featuredData);
      setTrendingBlogs(Array.isArray(trendingData) ? trendingData : []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'Recent';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: '2-digit' 
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getImageUrl = (blog) => {
    if (blog.image) {
      // If image starts with http/https, use it directly
      if (blog.image.startsWith('http')) {
        return blog.image;
      }
      // If it's a relative path, construct the full URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${blog.image}`;
    }
    // Default placeholder image
    return 'https://via.placeholder.com/400x200/007bff/ffffff?text=Blog+Image';
  };

  const getAuthorImage = (author) => {
    if (!author) return 'https://via.placeholder.com/40x40/6c757d/ffffff?text=A';
    
    // Generate a simple avatar based on author name
    const firstLetter = author.charAt(0).toUpperCase();
    return `https://via.placeholder.com/40x40/007bff/ffffff?text=${firstLetter}`;
  };

  const handleClearSearch = () => {
    if (onSearchStateChange) {
      onSearchStateChange(false);
    }
    setFeaturedBlogs(originalBlogs);
  };

  // Loading state
  if (loading) {
    return (
      <section className="trending-category section">
        <div className="container">
          <div className="loading-container">
            <div className="skeleton-sidebar">
              <div className="skeleton-trending"></div>
              <div className="skeleton-ads"></div>
            </div>
            <div className="skeleton-blog-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="skeleton-blog-item"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="trending-category section">
        <div className="container">
          <div className="error-state">
            <h2>🚫 Something went wrong!</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchBlogsData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
  <section id="trending-category" className="trending-category section">
    <div className="container" data-aos="fade-up" data-aos-delay="100">
      
      <div className="main-layout">
        
        {/* Left Content - 80% (Blogs) */}
        <div className="left-content">
          
          {/* Search Results Header (if searching) */}
          {isSearchActive && (
            <div className="search-results-header">
              <div className="search-results-info">
                <h3>
                  <i className="bi bi-search me-2"></i>
                  Search Results for "{searchQuery}"
                </h3>
                <p>{displayBlogs.length} blog{displayBlogs.length !== 1 ? 's' : ''} found</p>
              </div>
              <button 
                className="clear-search-btn"
                onClick={handleClearSearch}
              >
                <i className="bi bi-x-circle me-1"></i>
                Show All Blogs
              </button>
            </div>
          )}

          {/* Blog Content Wrapper */}
          <div className="blog-content-wrapper">
            
            {/* Blog Grid or Empty State */}
            {displayBlogs.length === 0 ? (
              <div className="empty-content">
                {/* Empty state content */}
                <div className="empty-message">
                  <h2>No Blogs Available</h2>
                  <p>Check back later for new content or explore our trending posts.</p>
                  <button className="btn" onClick={fetchBlogsData}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Page
                  </button>
                </div>
                
                {/* Content Ads */}
                <div className="content-ads">
                  <div className="content-ad">
                    <div className="ad-placeholder">
                      <i className="bi bi-megaphone"></i>
                      Featured Advertisement
                      <div className="ad-size">400x300</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Blog Grid */
              <div className="blog-content">
                {displayBlogs.map((blog, index) => (
                  <React.Fragment key={blog._id || index}>
                    
                    {/* Insert ads every 3rd post */}
                    {index > 0 && index % 3 === 0 && (
                      <div className="content-ad">
                        <div className="ad-placeholder">
                          <i className="bi bi-badge-ad"></i>
                          Sponsored Content
                          <div className="ad-size">300x200</div>
                        </div>
                      </div>
                    )}

                    <article className={`post-entry ${index === 0 ? 'featured' : ''}`}>
                      
                      <Link to={`/blog/${blog.slug || blog.title.replace(/\s+/g, '-').toLowerCase()}`} className="post-image-link">
                        <div className="post-image-container">
                          <img 
                            src={getImageUrl(blog)} 
                            alt={blog.title || 'Blog post'} 
                            className="post-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200/007bff/ffffff?text=Blog+Image';
                            }}
                          />
                          <div className="post-image-overlay"></div>
                        </div>
                      </Link>
                      
                      <div className="post-meta">
                        <span className="date">{blog.category || 'Tech'}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      
                      <h2 className="post-title">
                        <Link to={`/blog/${blog.slug || blog.title.replace(/\s+/g, '-').toLowerCase()}`}>
                          {blog.title || 'Untitled Post'}
                        </Link>
                      </h2>
                      
                      <p className="post-excerpt">
                        {truncateText(blog.excerpt || blog.content, 120)}
                      </p>

                      <div className="author">
                        <img 
                          src={getAuthorImage(blog.author)} 
                          alt={blog.author || 'Author'} 
                          className="author-avatar"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40/6c757d/ffffff?text=A';
                          }}
                        />
                        <div className="name">
                          <h3>{blog.author || 'Anonymous'}</h3>
                        </div>
                      </div>
                      
                    </article>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - 20% (Trending + Sponsored) */}
        <div className="right-sidebar">
          
          {/* Trending Section */}
          <div className="trending">
            <h3>Trending Posts</h3>
            {trendingBlogs.length > 0 ? (
              <ul className="trending-post">
                {trendingBlogs.slice(0, 8).map((blog, index) => (
                  <li key={blog._id || index}>
                    <Link to={`/blog/${blog.slug || blog.title.replace(/\s+/g, '-').toLowerCase()}`}>
                      <div className="number">{index + 1}</div>
                      <div className="trending-content">
                        <h3>{truncateText(blog.title, 60)}</h3>
                        <div className="author">{blog.author || 'Anonymous'}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="trending-empty">
                <p>No trending posts available</p>
              </div>
            )}
          </div>

          {/* Sponsored Content Section */}
          <div className="sponsored-section">
            <h4>Sponsored Content</h4>
            <div className="sidebar-ads">
              <div className="ad-space">
                <div className="ad-placeholder">
                  <i className="bi bi-megaphone"></i>
                  Premium Ads
                  <div className="ad-size">300x250</div>
                </div>
              </div>
              <div className="ad-space">
                <div className="ad-placeholder">
                  <i className="bi bi-star"></i>
                  Featured Brand
                  <div className="ad-size">300x200</div>
                </div>
              </div>
              <div className="ad-space">
                <div className="ad-placeholder">
                  <i className="bi bi-award"></i>
                  Partner Content
                  <div className="ad-size">300x150</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </section>
  );
};

export default HeroSlider;