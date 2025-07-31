import React, { useState, useEffect } from 'react';
import blogService from '../../services/apiService';
// import '../style/HeroSlider.css'; // Assuming you have a CSS file for styling

const HeroSlider = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogsData();
  }, []);

  const fetchBlogsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured blogs
      const featuredResponse = await blogService.getAllBlogs({ 
        limit: 15,
        page: 1 
      });
      
      // Handle different response structures
      let featuredData = [];
      if (Array.isArray(featuredResponse)) {
        featuredData = featuredResponse;
      } else if (featuredResponse?.blogs && Array.isArray(featuredResponse.blogs)) {
        featuredData = featuredResponse.blogs;
      }
      
      if (featuredData.length === 0) {
        setError('No blogs available');
        return;
      }
      
      // Create trending from featured (sorted by views)
      const trendingData =  await blogService.getTrendingPosts();
      if (!Array.isArray(trendingData)) {
        setError('Failed to fetch trending posts');
        return;
      }
      // Set featured and trending blogs
      setFeaturedBlogs(featuredData);
      setTrendingBlogs(trendingData);
      
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(`Failed to load blog content: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
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

  const getImageUrl = (blog) =>
    blog.featuredImage || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80';

  const getAuthorImage = (authorName) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&size=80&background=random&color=fff`;

  if (loading) {
    return (
      <section id="trending-category" className="trending-category section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="loading-container">
            <div className="skeleton-main"></div>
            <div className="skeleton-grid">
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
            <div className="skeleton-trending">
              <div className="skeleton-trending-item"></div>
              <div className="skeleton-trending-item"></div>
              <div className="skeleton-trending-item"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredBlogs.length === 0) {
    return (
      <section id="trending-category" className="trending-category section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="error-state">
            <h2>Unable to load content</h2>
            <p>{error || 'No blogs available'}</p>
            <button onClick={fetchBlogsData} className="btn btn-primary retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

   
const mainBlog = featuredBlogs;
  const sideBlogs = trendingBlogs.slice(0,3);
  const leftColumnBlogs = mainBlog.slice(0, 3);
  const rightColumnBlogs = sideBlogs.slice(3, 6);

  return (
    <section id="trending-category" className="trending-category section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="container" data-aos="fade-up">
          <div className="row g-5">
            
            
           

            {/* Blog Grid and Trending - Right Side */}
            <div className="col-lg-12">
              <div className="row g-8">
                
                {/* Left Column of Small Posts */}
                <div className="col-lg-4 border-start custom-border">
                  {leftColumnBlogs.map((blog, index) => (
                    <div key={blog._id || index} className="post-entry small-post">
                      <a href={`/blog/${blog._id}`} className="post-image-link">
                        <div className="post-image-container small">
                          
                        </div>
                      </a>
                      <div className="post-meta">
                        <span className="date">{blog.category || 'Technology'}</span> 
                        <span className="mx-1">•</span> 
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <h2 className="post-title small">
                        <a href={`/blog/${blog._id}`}>
                          {truncateText(blog.title, 50)}
                        </a>
                      </h2>
                    </div>
                  ))}
                </div>

                {/* Right Column of Small Posts */}
                <div className="col-lg-4 border-start custom-border">
                  {rightColumnBlogs.map((blog, index) => (
                    <div key={blog._id || index} className="post-entry small-post">
                      <a href={`/blog/${blog._id}`} className="post-image-link">
                        <div className="post-image-container small">
                          <img 
                            src={getImageUrl(blog)} 
                            alt={blog.title} 
                            className="img-fluid post-image"
                          />
                        </div>
                      </a>
                      <div className="post-meta">
                        <span className="date">{blog.category || 'Technology'}</span> 
                        <span className="mx-1">•</span> 
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <h2 className="post-title small">
                        <a href={`/blog/${blog._id}`}>
                          {truncateText(blog.title, 50)}
                        </a>
                      </h2>
                    </div>
                  ))}
                </div>

                {/* Trending Section */}
                <div className="col-lg-4">
                  <div className="trending">
                    <h3>Trending</h3>
                    <ul className="trending-post">
                      {trendingBlogs.map((blog, index) => (
                        <li key={blog._id || index}>
                          <a href={`/blog/${blog._id}`}>
                            <span className="number">{index + 1}</span>
                            <div className="trending-content">
                              <h3>{truncateText(blog.title, 60)}</h3>
                              <span className="author">{blog.author}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
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