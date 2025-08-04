const API_BASE_URL = 'https://blog-devspr-in.onrender.com/api';

class BlogService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Helper method for API calls
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      const data = await response.json();
      console.log('API response:', data);
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      console.log('API request successful:', endpoint, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
async login({ email, password, adminKey }) {
  const data = await this.makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, adminKey })
  });

  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
  }

  return data;
}

 async register({ name, email, password, adminKey }) {
  const data = await this.makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, adminKey })
  });

  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
  }

  return data;
}


  async verifyToken() {
    try {
      return await this.makeRequest('/auth/verify');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
      throw error;
    }
  }

  // Blog methods for public access
  async getAllBlogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/blogs${query ? `?${query}` : ''}`;
    const data = await this.makeRequest(endpoint);
    console.log('Fetched blogs:', data);
    return data.blogs || [];
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return [];
  }
}

async getTrendingPosts() {
  try {
    const data = await this.makeRequest('/trending');
    console.log('Fetched trending posts:', data);
    return data.trendingPosts || [];
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
}
  // Blog methods for admin access
  async getAdminBlogs() {
    try {
      const data = await this.makeRequest('/blogs/admin');
      return data.blogs || [];
    } catch (error) {
      console.error('Error fetching admin blogs:', error);
      throw error;
    }
  }

  async getBlogById(id) {
    try {
      const data = await this.makeRequest(`/blogs/${id}`);
      return data.blog;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      throw error;
    }
  }

  async createBlog(blogData) {
    try {
      const data = await this.makeRequest('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData)
      });
      
      return data.blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  async updateBlog(id, blogData) {
    try {
      const data = await this.makeRequest(`/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogData)
      });
      return data.blog;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(id) {
    try {
      return await this.makeRequest(`/blogs/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  async getBlogStats() {
    try {
      const data = await this.makeRequest('/blogs/stats/overview');
      return data.stats;
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      return {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0
      };
    }
  }

  // Utility methods
  getCategories() {
    return [
      'Technology',
      'Web Development',
      'Mobile Development',
      'AI & Machine Learning',
      'Data Science',
      'Cybersecurity',
      'DevOps',
      'Tutorial',
      'News',
      'Review',
      'Opinion',
      'Lifestyle',
      'Business',
      'Other'
    ];
  }

  generateExcerpt(content) {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }

  calculateReadTime(content) {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
  }
}

export default new BlogService();
