import React, { useState } from 'react';

const SinglePost = () => {
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

  // Sample blog data
  const blogPost = {
    id: 1,
    title: "Dolorum optio tempore voluptas dignissimos cumque fuga qui quibusdam quia",
    image: "assets/img/blog/blog-1.jpg",
    author: "John Doe",
    date: "Jan 1, 2022",
    commentsCount: 8,
    category: "Business",
    tags: ["Creative", "Tips", "Marketing"],
    content: {
      intro: "Similique neque nam consequuntur ad non maxime aliquam quas. Quibusdam animi praesentium. Aliquam et laboriosam eius aut nostrum quidem aliquid dicta. Et eveniet enim. Qui velit est ea dolorem doloremque deleniti aperiam unde soluta. Est cum et quod quos aut ut et sit sunt. Voluptate porro consequatur assumenda perferendis dolore.",
      paragraph2: "Sit repellat hic cupiditate hic ut nemo. Quis nihil sunt non reiciendis. Sequi in accusamus harum vel aspernatur. Excepturi numquam nihil cumque odio. Et voluptate cupiditate.",
      quote: "Et vero doloremque tempore voluptatem ratione vel aut. Deleniti sunt animi aut. Aut eos aliquam doloribus minus autem quos.",
      paragraph3: "Sed quo laboriosam qui architecto. Occaecati repellendus omnis dicta inventore tempore provident voluptas mollitia aliquid. Id repellendus quia. Asperiores nihil magni dicta est suscipit perspiciatis. Voluptate ex rerum assumenda dolores nihil quaerat. Dolor porro tempora et quibusdam voluptas. Beatae aut at ad qui tempore corrupti velit quisquam rerum. Omnis dolorum exercitationem harum qui qui blanditiis neque. Iusto autem itaque. Repudiandae hic quae aspernatur ea neque qui. Architecto voluptatem magni. Vel magnam quod et tempora deleniti error rerum nihil tempora.",
      insideImage: "assets/img/blog/blog-inside-post.jpg"
    }
  };

  // Sample comments data
  const comments = [
    {
      id: 1,
      author: "Georgia Reader",
      avatar: "assets/img/blog/comments-1.jpg",
      date: "01 Jan,2022",
      content: "Et rerum totam nisi. Molestiae vel quam dolorum vel voluptatem et et. Est ad aut sapiente quis molestiae est qui cum soluta. Vero aut rerum vel. Rerum quos laboriosam placeat ex qui. Sint qui facilis et.",
      replies: []
    },
    {
      id: 2,
      author: "Aron Alvarado",
      avatar: "assets/img/blog/comments-2.jpg",
      date: "01 Jan,2022",
      content: "Ipsam tempora sequi voluptatem quis sapiente non. Autem itaque eveniet saepe. Officiis illo ut beatae.",
      replies: [
        {
          id: 3,
          author: "Lynda Small",
          avatar: "assets/img/blog/comments-3.jpg",
          date: "01 Jan,2022",
          content: "Enim ipsa eum fugiat fuga repellat. Commodi quo quo dicta. Est ullam aspernatur ut vitae quia mollitia id non. Qui ad quas nostrum rerum sed necessitatibus aut est.",
          replies: [
            {
              id: 4,
              author: "Sianna Ramsay",
              avatar: "assets/img/blog/comments-4.jpg",
              date: "01 Jan,2022",
              content: "Et dignissimos impedit nulla et quo distinctio ex nemo. Omnis quia dolores cupiditate et. Ut unde qui eligendi sapiente omnis ullam."
            }
          ]
        }
      ]
    },
    {
      id: 5,
      author: "Nolan Davidson",
      avatar: "assets/img/blog/comments-5.jpg",
      date: "01 Jan,2022",
      content: "Distinctio nesciunt rerum reprehenderit sed. Iste omnis eius repellendus quia nihil ut accusantium tempore. Nesciunt expedita id dolor exercitationem aspernatur aut quam ut.",
      replies: []
    },
    {
      id: 6,
      author: "Kay Duggan",
      avatar: "assets/img/blog/comments-6.jpg",
      date: "01 Jan,2022",
      content: "Dolorem atque aut. Omnis doloremque blanditiis quia eum porro quis ut velit tempore. Cumque sed quia ut maxime. Est ad aut cum. Ut exercitationem non in fugiat.",
      replies: []
    }
  ];

  // Sample sidebar data
  const recentPosts = [
    { id: 1, title: "Nihil blanditiis at in nihil autem", image: "assets/img/blog/blog-recent-1.jpg", date: "Jan 1, 2020" },
    { id: 2, title: "Quidem autem et impedit", image: "assets/img/blog/blog-recent-2.jpg", date: "Jan 1, 2020" },
    { id: 3, title: "Id quia et et ut maxime similique occaecati ut", image: "assets/img/blog/blog-recent-3.jpg", date: "Jan 1, 2020" },
    { id: 4, title: "Laborum corporis quo dara net para", image: "assets/img/blog/blog-recent-4.jpg", date: "Jan 1, 2020" },
    { id: 5, title: "Et dolores corrupti quae illo quod dolor", image: "assets/img/blog/blog-recent-5.jpg", date: "Jan 1, 2020" }
  ];

  const tags = ["App", "IT", "Business", "Mac", "Design", "Office", "Creative", "Studio", "Smart", "Tips", "Marketing"];

  const handleCommentChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentStatus({ loading: true, error: '', success: false });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setCommentForm({ name: '', email: '', website: '', comment: '' });
      setCommentStatus({ loading: false, error: '', success: true });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setCommentStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      setCommentStatus({ 
        loading: false, 
        error: 'Something went wrong. Please try again.', 
        success: false 
      });
    }
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} id={`comment-${comment.id}`} className={`comment ${isReply ? 'comment-reply' : ''}`}>
      <div className="d-flex">
        <div className="comment-img">
          <img src={comment.avatar} alt="" />
        </div>
        <div>
          <h5>
            <a href="">{comment.author}</a> 
            <a href="#" className="reply">
              <i className="bi bi-reply-fill"></i> Reply
            </a>
          </h5>
          <time dateTime="2020-01-01">{comment.date}</time>
          <p>{comment.content}</p>
        </div>
      </div>
      
      {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
    </div>
  );

  return (
    <>
      {/* Page Title */}
      <div className="page-title">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Single Post</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Home</a></li>
              <li className="current">Single Post</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            
            {/* Blog Details Section */}
            <section id="blog-details" className="blog-details section">
              <div className="container">
                <article className="article">
                  
                  <div className="post-img">
                    <img src={blogPost.image} alt="" className="img-fluid" />
                  </div>

                  <h2 className="title">{blogPost.title}</h2>

                  <div className="meta-top">
                    <ul>
                      <li className="d-flex align-items-center">
                        <i className="bi bi-person"></i> 
                        <a href="#">{blogPost.author}</a>
                      </li>
                      <li className="d-flex align-items-center">
                        <i className="bi bi-clock"></i> 
                        <a href="#"><time dateTime="2020-01-01">{blogPost.date}</time></a>
                      </li>
                      <li className="d-flex align-items-center">
                        <i className="bi bi-chat-dots"></i> 
                        <a href="#">{blogPost.commentsCount} Comments</a>
                      </li>
                    </ul>
                  </div>

                  <div className="content">
                    <p>{blogPost.content.intro}</p>
                    <p>{blogPost.content.paragraph2}</p>
                    
                    <blockquote>
                      <p>{blogPost.content.quote}</p>
                    </blockquote>

                    <p>{blogPost.content.paragraph3}</p>

                    <h3>Et quae iure vel ut odit alias.</h3>
                    <p>
                      Officiis animi maxime nulla quo et harum eum quis a. Sit hic in qui quos fugit ut rerum atque. Optio provident dolores atque voluptatem rem excepturi molestiae qui. Voluptatem laborum omnis ullam quibusdam perspiciatis nulla nostrum.
                    </p>
                    
                    <img src={blogPost.content.insideImage} className="img-fluid" alt="" />

                    <h3>Ut repellat blanditiis est dolore sunt dolorum quae.</h3>
                    <p>
                      Rerum ea est assumenda pariatur quasi et quam. Facilis nam porro amet nostrum. In assumenda quia quae a id praesentium. Quos deleniti libero sed occaecati aut porro autem.
                    </p>
                  </div>

                  <div className="meta-bottom">
                    <i className="bi bi-folder"></i>
                    <ul className="cats">
                      <li><a href="#">{blogPost.category}</a></li>
                    </ul>

                    <i className="bi bi-tags"></i>
                    <ul className="tags">
                      {blogPost.tags.map((tag, index) => (
                        <li key={index}><a href="#">{tag}</a></li>
                      ))}
                    </ul>
                  </div>

                </article>
              </div>
            </section>

            {/* Blog Comments Section */}
            <section id="blog-comments" className="blog-comments section">
              <div className="container">
                <h4 className="comments-count">{comments.length} Comments</h4>
                {comments.map(comment => renderComment(comment))}
              </div>
            </section>

            {/* Comment Form Section */}
            <section id="comment-form" className="comment-form section">
              <div className="container">
                <form onSubmit={handleCommentSubmit}>
                  <h4>Post Comment</h4>
                  <p>Your email address will not be published. Required fields are marked *</p>
                  
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <input 
                        name="name" 
                        type="text" 
                        className="form-control" 
                        placeholder="Your Name*"
                        value={commentForm.name}
                        onChange={handleCommentChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <input 
                        name="email" 
                        type="email" 
                        className="form-control" 
                        placeholder="Your Email*"
                        value={commentForm.email}
                        onChange={handleCommentChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col form-group">
                      <input 
                        name="website" 
                        type="text" 
                        className="form-control" 
                        placeholder="Your Website"
                        value={commentForm.website}
                        onChange={handleCommentChange}
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col form-group">
                      <textarea 
                        name="comment" 
                        className="form-control" 
                        placeholder="Your Comment*"
                        value={commentForm.comment}
                        onChange={handleCommentChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    {commentStatus.loading && (
                      <div className="loading" style={{ marginBottom: '1rem' }}>Loading...</div>
                    )}
                    
                    {commentStatus.error && (
                      <div className="error-message" style={{ marginBottom: '1rem', color: 'red' }}>
                        {commentStatus.error}
                      </div>
                    )}
                    
                    {commentStatus.success && (
                      <div className="sent-message" style={{ marginBottom: '1rem', color: 'green' }}>
                        Your comment has been posted. Thank you!
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={commentStatus.loading}
                    >
                      {commentStatus.loading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="col-lg-4 sidebar">
            <div className="widgets-container">

              {/* Blog Author Widget */}
              <div className="blog-author-widget widget-item">
                <div className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center w-100">
                    <img src="assets/img/blog/blog-author.jpg" className="rounded-circle flex-shrink-0" alt="" />
                    <div>
                      <h4>Jane Smith</h4>
                      <div className="social-links">
                        <a href="https://x.com/#"><i className="bi bi-twitter-x"></i></a>
                        <a href="https://facebook.com/#"><i className="bi bi-facebook"></i></a>
                        <a href="https://instagram.com/#"><i className="bi bi-instagram"></i></a>
                        <a href="https://linkedin.com/#"><i className="bi bi-linkedin"></i></a>
                      </div>
                    </div>
                  </div>
                  <p>
                    Itaque quidem optio quia voluptatibus dolorem dolor. Modi eum sed possimus accusantium. Quas repellat voluptatem officia numquam sint aspernatur voluptas. Esse et accusantium ut unde voluptas.
                  </p>
                </div>
              </div>

              {/* Search Widget */}
              <div className="search-widget widget-item">
                <h3 className="widget-title">Search</h3>
                <form action="">
                  <input type="text" />
                  <button type="submit" title="Search">
                    <i className="bi bi-search"></i>
                  </button>
                </form>
              </div>

              {/* Recent Posts Widget */}
              <div className="recent-posts-widget widget-item">
                <h3 className="widget-title">Recent Posts</h3>
                {recentPosts.map(post => (
                  <div key={post.id} className="post-item">
                    <img src={post.image} alt="" className="flex-shrink-0" />
                    <div>
                      <h4><a href="#">{post.title}</a></h4>
                      <time dateTime="2020-01-01">{post.date}</time>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags Widget */}
              <div className="tags-widget widget-item">
                <h3 className="widget-title">Tags</h3>
                <ul>
                  {tags.map((tag, index) => (
                    <li key={index}><a href="#">{tag}</a></li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SinglePost;
