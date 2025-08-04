const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createComment,
  getCommentsByBlog,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  toggleCommentLike,
  replyToComment,
  getCommentStats
} = require('../controllers/commentController');

// Import your existing auth middleware
const { protect, adminOnly } = require('../middlewares/requireAuth');

// Rate limiting for comment creation
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 comments per windowMs
  message: {
    success: false,
    message: 'Too many comments created from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for likes
const likeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 likes per windowMs
  message: {
    success: false,
    message: 'Too many like actions, please try again later.'
  }
});

// Public routes
router.post('/', commentLimiter, createComment);
router.get('/blog/:blogId', getCommentsByBlog);
router.put('/:id/like', likeLimiter, toggleCommentLike);
router.post('/:id/reply', commentLimiter, replyToComment);

// Admin routes (protected)
router.get('/', protect, adminOnly, getAllComments);
router.put('/:id/status', protect, adminOnly, updateCommentStatus);
router.delete('/:id', protect, adminOnly, deleteComment);
router.get('/stats', protect, adminOnly, getCommentStats);

module.exports = router;