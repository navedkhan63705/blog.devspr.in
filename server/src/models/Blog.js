const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
 featuredImage: {
  type: String,
  validate: {
    validator: function(v) {
      return (
        !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(v)
      );
    },
    message: 'Please provide a valid image URL'
  }
},
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate read time before saving
// ✅ Generate slug from title before saving
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const rawSlug = slugify(this.title, { lower: true, strict: true });
    let slug = rawSlug;
    let count = 1;

    // Ensure uniqueness by appending a number if needed
    while (await mongoose.models.Blog.exists({ slug })) {
      slug = `${rawSlug}-${count++}`;
    }

    this.slug = slug;
  }

  // Read time calculation
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    this.readTime = `${readTime} min read`;
  }

  next();
});
// ...everything you've written above...

module.exports = mongoose.model('Blog', blogSchema); // ✅ ADD THIS LINE
