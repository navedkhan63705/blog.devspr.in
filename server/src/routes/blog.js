const express = require('express');
const {
  getAllBlogs,
  getAdminBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  getTrendingBlogs,
  uploadImage
} = require('../controllers/blogController');
const { protect, adminOnly, auth } = require('../middlewares/requireAuth');
const upload = require('../middlewares/upload');

const router = express.Router();

// ✅ Public routes
router.get('/', getAllBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/slug/:slug', getBlogBySlug); // Must come before `/:id`
 

// ✅ Admin routes
router.get('/admin/all', protect, adminOnly, getAdminBlogs);
router.get('/stats/overview', protect, adminOnly, getBlogStats);

// 🔧 Add image upload middleware here
router.post('/', protect, adminOnly, upload.single('featuredImage'), createBlog);
router.put('/:id', protect, adminOnly, upload.single('featuredImage'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

// ✅ Image upload
router.post('/upload', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
