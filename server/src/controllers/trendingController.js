const TrendingPost = require("../models/TrendingPost");
const Blog = require("../models/Blog");

// @desc    Get all trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const trendingPosts = await TrendingPost.find({ isActive: true })
      .sort({ position: 1 })
      .populate('blogRef', 'title author')
      .populate('addedBy', 'name');

    res.json({
      success: true,
      trendingPosts: trendingPosts.map(post => ({
        id: post._id,
        number: post.position,
        title: post.title,
        author: post.author,
        blogRef: post.blogRef?._id,
        createdAt: post.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending posts",
      error: err.message
    });
  }
};

// @desc    Create trending post (Admin only)
exports.createTrendingPost = async (req, res) => {
  try {
    const { title, author, position, blogRef } = req.body;

    // Check if position is already taken
    const existingPost = await TrendingPost.findOne({ position, isActive: true });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: `Position ${position} is already occupied`
      });
    }

    const trendingPost = await TrendingPost.create({
      title,
      author,
      position,
      blogRef: blogRef || null,
      addedBy: req.user._id
    });

    await trendingPost.populate('blogRef', 'title author');

    res.status(201).json({
      success: true,
      message: "Trending post created successfully",
      trendingPost: {
        id: trendingPost._id,
        number: trendingPost.position,
        title: trendingPost.title,
        author: trendingPost.author,
        blogRef: trendingPost.blogRef?._id,
        createdAt: trendingPost.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create trending post",
      error: err.message
    });
  }
};

// @desc    Update trending post (Admin only)
exports.updateTrendingPost = async (req, res) => {
  try {
    const { title, author, position, blogRef, isActive } = req.body;
    
    const trendingPost = await TrendingPost.findById(req.params.id);
    if (!trendingPost) {
      return res.status(404).json({
        success: false,
        message: "Trending post not found"
      });
    }

    // Check if new position is already taken (if position is being changed)
    if (position && position !== trendingPost.position) {
      const existingPost = await TrendingPost.findOne({ 
        position, 
        isActive: true, 
        _id: { $ne: req.params.id } 
      });
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: `Position ${position} is already occupied`
        });
      }
    }

    Object.assign(trendingPost, {
      title: title || trendingPost.title,
      author: author || trendingPost.author,
      position: position || trendingPost.position,
      blogRef: blogRef !== undefined ? blogRef : trendingPost.blogRef,
      isActive: isActive !== undefined ? isActive : trendingPost.isActive
    });

    await trendingPost.save();
    await trendingPost.populate('blogRef', 'title author');

    res.json({
      success: true,
      message: "Trending post updated successfully",
      trendingPost: {
        id: trendingPost._id,
        number: trendingPost.position,
        title: trendingPost.title,
        author: trendingPost.author,
        blogRef: trendingPost.blogRef?._id,
        createdAt: trendingPost.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update trending post",
      error: err.message
    });
  }
};

// @desc    Delete trending post (Admin only)
exports.deleteTrendingPost = async (req, res) => {
  try {
    const trendingPost = await TrendingPost.findById(req.params.id);
    if (!trendingPost) {
      return res.status(404).json({
        success: false,
        message: "Trending post not found"
      });
    }

    await TrendingPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Trending post deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete trending post",
      error: err.message
    });
  }
};

// @desc    Get all trending posts for admin (includes inactive)
exports.getAllTrendingPostsAdmin = async (req, res) => {
  try {
    const trendingPosts = await TrendingPost.find({})
      .sort({ position: 1 })
      .populate('blogRef', 'title author')
      .populate('addedBy', 'name');

    res.json({
      success: true,
      trendingPosts: trendingPosts.map(post => ({
        id: post._id,
        number: post.position,
        title: post.title,
        author: post.author,
        blogRef: post.blogRef?._id,
        isActive: post.isActive,
        addedBy: post.addedBy?.name,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending posts",
      error: err.message
    });
  }
};
