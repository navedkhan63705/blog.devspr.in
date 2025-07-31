const Blog = require("../models/Blog");

// @desc    Upload blog image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      url: imageUrl // Alternative key for compatibility
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: err.message
    });
  }
};

// @desc    Get blog statistics
exports.getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });

    // Calculate total views
    const viewsResult = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // Get this month's statistics
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthBlogs = await Blog.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get popular categories
    const categoryStats = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews,
        thisMonth: {
          newBlogs: thisMonthBlogs
        },
        popularCategories: categoryStats
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: err.message
    });
  }
};

// @desc    Create new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, category, status, featuredImage, tags } = req.body;
    console.log('Creating blog with data:', {
      title, content, excerpt, author, category, status, featuredImage, tags
    });
    // Validate required fields
    if (!title || !content || !author || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, author, and category are required"
      });
    }

    const blog = new Blog({
      title: title.trim(),
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      author: author.trim(),
      category,
      status: status || 'draft',
      featuredImage,
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      createdBy: req.user._id
    });

    const savedBlog = await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: savedBlog
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({
      success: false,
      message: "Blog creation failed",
      error: err.message
    });
  }
};

// @desc    Get all blogs (public - only published)
// exports.getAllBlogs = async (req, res) => {
//   try {
//     const { status, category, search, limit = 10, page = 1 } = req.query;

//     const query = {};

//     // ✅ Only show published blogs to public users
//     if (!req.user || req.user.role !== 'admin') {
//       query.status = 'published';
//     } else if (status && status !== 'all') {
//       // Admins can filter by any status
//       query.status = status;
//     }

//     // ✅ Optional category filter
//     if (category && category !== 'all') {
//       query.category = category;
//     }

//     // ✅ Optional search filter (title, content, tags)
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { content: { $regex: search, $options: 'i' } },
//         { tags: { $in: [new RegExp(search, 'i')] } }
//       ];
//     }

//     // ✅ Fetch filtered blogs with pagination
//     const blogs = await Blog.find(query)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit))
//       .lean();

//     // ✅ Get total for pagination
//     const total = await Blog.countDocuments(query);

//     // console.log(`Fetched ${blogs.length} blogs for page ${page} with limit ${limit}`);
//     // console.log('Query used:', query);
//     console.log('Total blogs found:', blogs.length);
//     // ✅ Send response
//     res.json({
//       success: true,
//       blogs,
//       pagination: {
//         current: Number(page),
//         total: Math.ceil(total / limit),
//         hasNext: page * limit < total,
//         hasPrev: page > 1
//       }
//     });
//   } catch (err) {
//     console.error('Error fetching blogs:', err);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching blogs",
//       error: err.message
//     });
//   }
// };
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.json({
      success: true,
      blogs
    });
    console.log(`Fetched ${blogs.length} blogs ${blogs}`);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: err.message
    });
  }
};



// @desc    Get all blogs for admin (includes drafts)
exports.getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      blogs
    });
  } catch (err) {
    console.error('Error fetching admin blogs:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching admin blogs",
      error: err.message
    });
  }
};

// @desc    Get single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Only allow access to published blogs for non-admin users
    if (blog.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      blog.views = (blog.views || 0) + 1;
      await blog.save();
    }

    res.json({
      success: true,
      blog
    });
  } catch (err) {
    console.error('Error fetching blog:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: err.message
    });
  }
};

// @desc    Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, category, status, featuredImage, tags } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update fields
    blog.title = title.trim();
    blog.content = content;
    blog.excerpt = excerpt || content.substring(0, 150) + '...';
    blog.author = author.trim();
    blog.category = category;
    blog.status = status;
    blog.featuredImage = featuredImage;
    blog.tags = Array.isArray(tags) ? tags : [];
    blog.updatedAt = new Date();

    const updatedBlog = await blog.save();

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message
    });
  }
};

// @desc    Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message
    });
  }
};

// @desc    Get trending blogs (most viewed)
exports.getTrendingBlogs = async (req, res) => {
  try {
    const trendingBlogs = await Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      blogs: trendingBlogs
    });
  } catch (err) {
    console.error('Error fetching trending blogs:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching trending blogs",
      error: err.message
    });
  }
};
