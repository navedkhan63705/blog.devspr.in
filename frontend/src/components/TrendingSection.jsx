import React, { useState, useEffect } from 'react';
import HeroSlider from './Page/HeroSlider';

const TrendingSection = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch trending posts
      const trendingResponse = await fetch('http://localhost:5000/api/trending');
      const trendingData = await trendingResponse.json();
      
      // Fetch regular blog posts
      const blogsResponse = await fetch('http://localhost:5000/api/blogs');
      const blogsData = await blogsResponse.json();
      
      if (trendingData.success) {
        setTrendingPosts(trendingData.trendingPosts || []);
      }
      
      if (blogsData.success && blogsData.blogs) {
        // Transform backend data to frontend format
        const transformedPosts = blogsData.blogs
          .filter(blog => blog.isPublished)
          .slice(0, 7)
          .map((blog, index) => ({
            id: blog._id,
            image: blog.coverImage ? `http://localhost:5000${blog.coverImage}` : "/assets/img/post-landscape-1.jpg",
            category: blog.category,
            date: new Date(blog.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: '2-digit' 
            }),
            title: blog.title,
            excerpt: blog.content.substring(0, 200) + '...',
            author: blog.author?.name || 'Unknown Author',
            authorImage: "/assets/img/person-1.jpg",
            isLarge: index === 0 // First post is large
          }));
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty arrays if API fails
      setTrendingPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="trending-category" className="trending-category section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading posts...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
    <HeroSlider />
    <section id="trending-category" className="trending-category section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="container" data-aos="fade-up">
          <div className="row g-5">
            <div className="col-lg-4">
              {posts.filter(post => post.isLarge).map(post => (
                <div key={post.id} className="post-entry lg">
                  <a href="/blog-details">
                    <img src={post.image} alt="" className="img-fluid" />
                  </a>
                  <div className="post-meta">
                    <span className="date">{post.category}</span> 
                    <span className="mx-1">•</span> 
                    <span>{post.date}</span>
                  </div>
                  <h2>
                    <a href="/blog-details">{post.title}</a>
                  </h2>
                  <p className="mb-4 d-block">{post.excerpt}</p>
                  
                  <div className="d-flex align-items-center author">
                    <div className="photo">
                      <img src={post.authorImage} alt="" className="img-fluid" />
                    </div>
                    <div className="name">
                      <h3 className="m-0 p-0">{post.author}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-8">
              <div className="row g-5">
                <div className="col-lg-4 border-start custom-border">
                  {posts.slice(1, 4).map(post => (
                    <div key={post.id} className="post-entry">
                      <a href="/blog-details">
                        <img src={post.image} alt="" className="img-fluid" />
                      </a>
                      <div className="post-meta">
                        <span className="date">{post.category}</span> 
                        <span className="mx-1">•</span> 
                        <span>{post.date}</span>
                      </div>
                      <h2>
                        <a href="/blog-details">{post.title}</a>
                      </h2>
                    </div>
                  ))}
                </div>
                
                <div className="col-lg-4 border-start custom-border">
                  {posts.slice(4, 7).map(post => (
                    <div key={post.id} className="post-entry">
                      <a href="/blog-details">
                        <img src={post.image} alt="" className="img-fluid" />
                      </a>
                      <div className="post-meta">
                        <span className="date">{post.category}</span> 
                        <span className="mx-1">•</span> 
                        <span>{post.date}</span>
                      </div>
                      <h2>
                        <a href="/blog-details">{post.title}</a>
                      </h2>
                    </div>
                  ))}
                </div>

                {/* Trending Section */}
                <div className="col-lg-4">
                  <div className="trending">
                    <h3>Trending</h3>
                    {trendingPosts.length > 0 ? (
                      <ul className="trending-post">
                        {trendingPosts.map(post => (
                          <li key={post.id}>
                            <a href="/blog-details">
                              <span className="number">{post.number}</span>
                              <h3>{post.title}</h3>
                              <span className="author">{post.author}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">
                        <p>No trending posts available.</p>
                        <small>Trending posts will be managed by administrators.</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default TrendingSection;
