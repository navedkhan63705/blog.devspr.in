const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const validator = require('validator');

// Helper function to validate and sanitize input
const sanitizeInput = (input) => {
  return validator.escape(input.trim());
};

// Basic spam detection
const isSpamComment = (content, email, name) => {
  const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'click here', 'free money', 'buy now'];
  const contentLower = content.toLowerCase();
  
  // Check for spam keywords
  const hasSpamKeywords = spamKeywords.some(keyword => contentLower.includes(keyword));
  
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  
  // Check for suspicious patterns
  const hasExcessiveCaps = content.match(/[A-Z]/g) && (content.match(/[A-Z]/g).length / content.length) > 0.5;
  const hasRepeatedChars = /(.)\1{4,}/.test(content);
  
  return hasSpamKeywords || linkCount > 3 || hasExcessiveCaps || hasRepeatedChars;
};

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '0.0.0.0';
};

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Public
const createComment = async (req, res) => {
  try {
    const { blogId, name, email, website, content } = req.body;

    // Validation
    if (!blogId || !name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID, name, email, and comment content are required'
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Sanitize input
    const sanitizedData = {
      blogId,
      name: sanitizeInput(name),
      email: email.toLowerCase().trim(),
      website: website ? sanitizeInput(website) : '',
      content: sanitizeInput(content)
    };

    // Check for spam
    const isSpam = isSpamComment(sanitizedData.content, sanitizedData.email, sanitizedData.name);

    // Rate limiting - check for recent comments from same email
    const recentComments = await Comment.find({
      email: sanitizedData.email,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });

    if (recentComments.length >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many comments. Please wait a few minutes before commenting again.'
      });
    }

    // Create comment
    const comment = new Comment({
      ...sanitizedData,
      status: isSpam ? 'pending' : 'approved',
      isSpam,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent') || ''
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: isSpam ? 'Comment submitted for review' : 'Comment posted successfully',
      comment: {
        _id: comment._id,
        name: comment.name,
        email: comment.email,
        website: comment.website,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        likes: comment.likes
      }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Get comments for a specific blog
// @route   GET /api/comments/blog/:blogId
// @access  Public
const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Validate blogId
    if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Set up sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'likes':
        sortOptions = { likes: -1, createdAt: -1 };
        break;
      default: // newest
        sortOptions = { createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get comments (only approved ones for public)
    const comments = await Comment.find({
      blogId,
      status: 'approved',
      parentComment: null // Only top-level comments
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('replies', 'name content createdAt likes')
      .select('-email -ipAddress -userAgent -isSpam')
      .lean();

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({
      blogId,
      status: 'approved',
      parentComment: null
    });

    const totalPages = Math.ceil(totalComments / limitNum);

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalComments,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Get all comments (Admin only)
// @route   GET /api/comments
// @access  Private/Admin
const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, blogId, search } = req.query;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (blogId) filter.blogId = blogId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get comments with blog details
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('blogId', 'title slug')
      .lean();

    const totalComments = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(totalComments / limitNum);

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalComments,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Update comment status
// @route   PUT /api/comments/:id/status
// @access  Private/Admin
const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('blogId', 'title slug');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Comment ${status} successfully`,
      comment
    });

  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Also delete any replies to this comment
    await Comment.deleteMany({ parentComment: id });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Like/Unlike a comment
// @route   PUT /api/comments/:id/like
// @access  Public
const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (action === 'like') {
      comment.likes += 1;
    } else if (action === 'unlike' && comment.likes > 0) {
      comment.likes -= 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: comment.likes,
      message: `Comment ${action}d successfully`
    });

  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Public
const replyToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, website, content } = req.body;

    // Validation
    if (!name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and reply content are required'
      });
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(id);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Sanitize input
    const sanitizedData = {
      blogId: parentComment.blogId,
      name: sanitizeInput(name),
      email: email.toLowerCase().trim(),
      website: website ? sanitizeInput(website) : '',
      content: sanitizeInput(content),
      parentComment: id
    };

    // Check for spam
    const isSpam = isSpamComment(sanitizedData.content, sanitizedData.email, sanitizedData.name);

    // Create reply
    const reply = new Comment({
      ...sanitizedData,
      status: isSpam ? 'pending' : 'approved',
      isSpam,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent') || ''
    });

    await reply.save();

    // Add reply to parent comment
    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json({
      success: true,
      message: isSpam ? 'Reply submitted for review' : 'Reply posted successfully',
      reply: {
        _id: reply._id,
        name: reply.name,
        content: reply.content,
        createdAt: reply.createdAt,
        likes: reply.likes
      }
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Get comment statistics
// @route   GET /api/comments/stats
// @access  Private/Admin
const getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const approvedComments = await Comment.countDocuments({ status: 'approved' });
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const spamComments = await Comment.countDocuments({ isSpam: true });

    res.status(200).json({
      success: true,
      stats: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
        spam: spamComments
      }
    });

  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  createComment,
  getCommentsByBlog,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  toggleCommentLike,
  replyToComment,
  getCommentStats
  };