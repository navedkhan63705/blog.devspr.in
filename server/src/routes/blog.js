const express = require('express');
const {
  getAllBlogs,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  getTrendingBlogs,
  uploadImage
} = require('../controllers/blogController');  
const { protect, adminOnly, auth } = require('../middlewares/requireAuth');

const router = express.Router();

// Public routes
router.get('/',   getAllBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/:id', auth, getBlogById);

// Admin routes - note the order matters!
router.get('/admin/all', protect, adminOnly, getAdminBlogs);
router.get('/stats/overview', protect, adminOnly, getBlogStats);
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

// Image upload route
router.post('/upload', protect, adminOnly, uploadImage);

module.exports = router;