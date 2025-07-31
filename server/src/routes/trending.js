const express = require("express");
const router = express.Router();
const {
  getTrendingPosts,
  createTrendingPost,
  updateTrendingPost,
  deleteTrendingPost,
  getAllTrendingPostsAdmin,
} = require("../controllers/trendingController");

const { protect, adminOnly } = require("../middlewares/requireAuth");

// Public routes
router.get("/", getTrendingPosts);

// Admin only routes
router.get("/admin", protect, adminOnly, getAllTrendingPostsAdmin);
router.post("/", protect, adminOnly, createTrendingPost);
router.put("/:id", protect, adminOnly, updateTrendingPost);
router.delete("/:id", protect, adminOnly, deleteTrendingPost);

module.exports = router;
