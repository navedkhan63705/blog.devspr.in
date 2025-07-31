// Simulated blog service for demo purposes
// In a real application, this would connect to your backend API

export const blogService = {
  

  // CRUD operations (simulated)
  async createBlog(blogData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBlog = {
      ...blogData,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      readTime: `${Math.ceil(blogData.content.length / 200)} min read`
    };
    
    return newBlog;
  },

  async updateBlog(id, blogData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedBlog = {
      ...blogData,
      id,
      updatedAt: new Date().toISOString().split('T')[0],
      readTime: `${Math.ceil(blogData.content.length / 200)} min read`
    };
    
    return updatedBlog;
  },

  async deleteBlog(id) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async toggleBlogStatus(id, newStatus) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, status: newStatus };
  },

  async getBlogStats() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalBlogs: 12,
      publishedBlogs: 8,
      draftBlogs: 4,
      totalViews: 1250,
      thisMonth: {
        newBlogs: 3,
        totalViews: 450
      }
    };
  },
 
  // Categories
  getCategories() {
    return [
      'Technology',
      'Programming', 
      'Design',
      'Business',
      'Lifestyle',
      'Travel',
      'Food',
      'Health',
      'Education',
      'Entertainment'
    ];
  },

  // Helper functions
  generateExcerpt(content, maxLength = 150) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }
};

export default blogService;
