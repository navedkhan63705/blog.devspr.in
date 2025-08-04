import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/SinglePost.css';// Assuming you have a CSS file for styling

const SinglePost = () => {
  const { slug } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(127);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    website: '',
    comment: ''
  });

  const [commentStatus, setCommentStatus] = useState({
    loading: false,
    error: '',
    success: false
  });

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('.single-post-article');
      if (!article) return;
      
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min((scrolled / (articleHeight - windowHeight)) * 100, 100);
      
      setReadingProgress(Math.max(0, progress));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch blog post and comments
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/slug/${slug}`);
        setBlogPost(response.data.blog);
        
        // Fetch related posts
        if (response.data.blog?.category) {
          const relatedResponse = await axios.get(
            `http://localhost:5000/api/blogs?category=${response.data.blog.category}&limit=3`
          );
          setRelatedPosts(relatedResponse.data.blogs?.filter(post => post.slug !== slug) || []);
        }
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Fetch comments when blog post is loaded
  useEffect(() => {
    if (blogPost?._id) {
      fetchComments();
    }
  }, [blogPost]);

  // Fetch comments function
  const fetchComments = async () => {
    if (!blogPost?._id) return;
    
    setCommentsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/blog/${blogPost._id}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    });
  };

  // Submit comment to database
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentStatus({ loading: true, error: '', success: false });

    try {
      const commentData = {
        blogId: blogPost._id,
        name: commentForm.name,
        email: commentForm.email,
        website: commentForm.website || '',
        content: commentForm.comment
      };

      const response = await axios.post('http://localhost:5000/api/comments', commentData);
      
      if (response.data.success) {
        // Add new comment to the beginning of comments array
        setComments(prev => [response.data.comment, ...prev]);
        setCommentForm({ name: '', email: '', website: '', comment: '' });
        setCommentStatus({ loading: false, error: '', success: true });

        // Hide success message after 5 seconds
        setTimeout(() => {
          setCommentStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      } else {
        throw new Error(response.data.message || 'Failed to post comment');
      }
    } catch (error) {
      setCommentStatus({
        loading: false,
        error: error.response?.data?.message || 'Failed to submit comment. Please try again.',
        success: false
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCommentDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(date);
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(' ').length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const sharePost = (platform) => {
    const url = window.location.href;
    const title = blogPost?.title || '';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: () => {
        navigator.clipboard.writeText(url);
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = 'Link copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    };
    
    if (platform === 'copy') {
      shareUrls.copy();
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="sp-error">
        <i className="bi bi-exclamation-triangle"></i>
        <h2>Article Not Found</h2>
        <p>The article you're looking for doesn't exist.</p>
        <Link to="/" className="sp-home-btn">
          <i className="bi bi-house"></i>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="single-post-container">
      
      {/* Reading Progress */}
      <div className="sp-progress-bar">
        <div 
          className="sp-progress-fill" 
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Floating Actions */}
      <div className="sp-floating-actions">
        <button 
          className={`sp-fab-btn ${isLiked ? 'liked' : ''}`}
          onClick={toggleLike}
          title="Like this post"
        >
          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          <span className="sp-fab-count">{likeCount}</span>
        </button>
        
        <button 
          className={`sp-fab-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={toggleBookmark}
          title="Bookmark this post"
        >
          <i className={`bi ${isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
        </button>
        
        <button 
          className="sp-fab-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll to top"
        >
          <i className="bi bi-arrow-up"></i>
        </button>
      </div>

      <article className="single-post-article">
        <div className="sp-container">
          
          {/* Breadcrumb */}
          <nav className="sp-breadcrumb">
            <Link to="/"><i className="bi bi-house"></i> Home</Link>
            <span>/</span>
            <span className="sp-current">{blogPost.title}</span>
          </nav>

          <div className="sp-content-wrapper">
            
            {/* Main Content */}
            <div className="sp-main-content">
              
              {/* Post Header */}
              <header className="sp-post-header">
                <div className="sp-category">
                  <span className="sp-category-tag">
                    <i className="bi bi-tag"></i>
                    {blogPost.category || 'General'}
                  </span>
                </div>

                <h1 className="sp-post-title">{blogPost.title}</h1>
                
                {blogPost.excerpt && (
                  <p className="sp-post-excerpt">{blogPost.excerpt}</p>
                )}

                <div className="sp-post-meta">
                  <div className="sp-meta-item">
                    <i className="bi bi-calendar3"></i>
                    <span>{formatDate(blogPost.createdAt)}</span>
                  </div>
                  <div className="sp-meta-item">
                    <i className="bi bi-clock"></i>
                    <span>{calculateReadTime(blogPost.content)} min read</span>
                  </div>
                  <div className="sp-meta-item">
                    <i className="bi bi-chat-dots"></i>
                    <span>{comments.length} comments</span>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {blogPost.featuredImage && (
                <div className="sp-featured-image">
                  <img 
                    src={blogPost.featuredImage} 
                    alt={blogPost.title}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="sp-post-content">
                <div 
                  className="sp-content-body"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />
              </div>

              {/* Tags */}
              <div className="sp-tags-section">
                <h4><i className="bi bi-tags"></i> Tags</h4>
                <div className="sp-tags-list">
                  {blogPost.tags ? blogPost.tags.map((tag, index) => (
                    <span key={index} className="sp-tag">#{tag}</span>
                  )) : (
                    <>
                      <span className="sp-tag">#webdevelopment</span>
                      <span className="sp-tag">#technology</span>
                      <span className="sp-tag">#programming</span>
                    </>
                  )}
                </div>
              </div>

              {/* Share Section */}
              <div className="sp-share-section">
                <h4><i className="bi bi-share"></i> Share this article</h4>
                <div className="sp-share-buttons">
                  <button 
                    className="sp-share-btn twitter"
                    onClick={() => sharePost('twitter')}
                  >
                    <i className="bi bi-twitter"></i>
                    <span>Twitter</span>
                  </button>
                  <button 
                    className="sp-share-btn facebook"
                    onClick={() => sharePost('facebook')}
                  >
                    <i className="bi bi-facebook"></i>
                    <span>Facebook</span>
                  </button>
                  <button 
                    className="sp-share-btn linkedin"
                    onClick={() => sharePost('linkedin')}
                  >
                    <i className="bi bi-linkedin"></i>
                    <span>LinkedIn</span>
                  </button>
                  <button 
                    className="sp-share-btn copy"
                    onClick={() => sharePost('copy')}
                  >
                    <i className="bi bi-link-45deg"></i>
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <section className="sp-comments-section" id="comments">
                <div className="sp-comments-header">
                  <h3>
                    <i className="bi bi-chat-dots"></i> 
                    Comments ({comments.length})
                  </h3>
                </div>

                {/* Comment Form */}
                <div className="sp-comment-form-container">
                  <h4><i className="bi bi-pencil"></i> Leave a Comment</h4>

                  {commentStatus.success && (
                    <div className="sp-alert sp-alert-success">
                      <i className="bi bi-check-circle"></i>
                      <span>Your comment has been posted successfully!</span>
                    </div>
                  )}

                  {commentStatus.error && (
                    <div className="sp-alert sp-alert-error">
                      <i className="bi bi-exclamation-triangle"></i>
                      <span>{commentStatus.error}</span>
                    </div>
                  )}

                  <form className="sp-comment-form" onSubmit={handleCommentSubmit}>
                    <div className="sp-form-row">
                      <div className="sp-form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={commentForm.name}
                          onChange={handleCommentChange}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="sp-form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={commentForm.email}
                          onChange={handleCommentChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="sp-form-group">
                      <label>Website (Optional)</label>
                      <input
                        type="url"
                        name="website"
                        value={commentForm.website}
                        onChange={handleCommentChange}
                        placeholder="Enter your website URL"
                      />
                    </div>

                    <div className="sp-form-group">
                      <label>Comment *</label>
                      <textarea
                        name="comment"
                        value={commentForm.comment}
                        onChange={handleCommentChange}
                        placeholder="Share your thoughts..."
                        rows="5"
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="sp-submit-btn"
                      disabled={commentStatus.loading}
                    >
                      {commentStatus.loading ? (
                        <>
                          <div className="sp-spinner"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send"></i>
                          Post Comment
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Comments List */}
                <div className="sp-comments-list">
                  {commentsLoading ? (
                    <div className="sp-comments-loading">
                      <div className="sp-loading-spinner"></div>
                      <p>Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    <>
                      {comments.map((comment) => (
                        <div key={comment._id} className="sp-comment-item">
                          <div className="sp-comment-avatar">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=6366f1&color=fff&size=50&rounded=true`}
                              alt={comment.name}
                            />
                          </div>
                          <div className="sp-comment-content">
                            <div className="sp-comment-header">
                              <div className="sp-comment-author">
                                {comment.website ? (
                                  <a 
                                    href={comment.website.startsWith('http') ? comment.website : `https://${comment.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sp-comment-name-link"
                                  >
                                    {comment.name}
                                    <i className="bi bi-box-arrow-up-right"></i>
                                  </a>
                                ) : (
                                  <span className="sp-comment-name">{comment.name}</span>
                                )}
                              </div>
                              <div className="sp-comment-meta">
                                <span className="sp-comment-date">
                                  <i className="bi bi-clock"></i>
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="sp-comment-body">
                              <p>{comment.content}</p>
                            </div>
                            <div className="sp-comment-actions">
                              <button className="sp-comment-action-btn">
                                <i className="bi bi-hand-thumbs-up"></i>
                                <span>Like</span>
                              </button>
                              <button className="sp-comment-action-btn">
                                <i className="bi bi-reply"></i>
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="sp-no-comments">
                      <i className="bi bi-chat"></i>
                      <h4>No comments yet</h4>
                      <p>Be the first to share your thoughts about this article!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="sp-sidebar">
              
              {/* Table of Contents */}
              <div className="sp-sidebar-card">
                <h4><i className="bi bi-list-ul"></i> Table of Contents</h4>
                <ul className="sp-toc-list">
                  <li><a href="#introduction">Introduction</a></li>
                  <li><a href="#main-content">Main Content</a></li>
                  <li><a href="#conclusion">Conclusion</a></li>
                  <li><a href="#comments">Comments</a></li>
                </ul>
              </div>

              {/* Recent Comments */}
              {comments.length > 0 && (
                <div className="sp-sidebar-card">
                  <h4><i className="bi bi-chat-quote"></i> Recent Comments</h4>
                  <div className="sp-recent-comments">
                    {comments.slice(0, 3).map((comment) => (
                      <div key={comment._id} className="sp-recent-comment">
                        <div className="sp-recent-comment-avatar">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=6366f1&color=fff&size=32&rounded=true`}
                            alt={comment.name}
                          />
                        </div>
                        <div className="sp-recent-comment-content">
                          <div className="sp-recent-comment-author">{comment.name}</div>
                          <div className="sp-recent-comment-text">
                            {comment.content.substring(0, 60)}
                            {comment.content.length > 60 ? '...' : ''}
                          </div>
                          <div className="sp-recent-comment-date">
                            {formatCommentDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="sp-sidebar-card">
                  <h4><i className="bi bi-journal-text"></i> Related Articles</h4>
                  <div className="sp-related-list">
                    {relatedPosts.map((post, index) => (
                      <Link 
                        key={index} 
                        to={`/blog/${post.slug}`} 
                        className="sp-related-item"
                      >
                        <div className="sp-related-image">
                          <img 
                            src={post.featuredImage || 'https://via.placeholder.com/80x60'}
                            alt={post.title}
                          />
                        </div>
                        <div className="sp-related-content">
                          <h5>{post.title}</h5>
                          <span className="sp-related-date">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="sp-sidebar-card sp-newsletter-card">
                <h4><i className="bi bi-envelope"></i> Newsletter</h4>
                <p>Get the latest articles delivered to your inbox.</p>
                <form className="sp-newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    required
                  />
                  <button type="submit">
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </form>
              </div>

            </aside>
          </div>
        </div>
      </article>
    </div>
  );
};

export default SinglePost;