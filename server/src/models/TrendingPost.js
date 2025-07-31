const mongoose = require("mongoose");

const trendingPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    blogRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique position for active trending posts
trendingPostSchema.index({ position: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model("TrendingPost", trendingPostSchema);
