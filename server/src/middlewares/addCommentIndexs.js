const mongoose = require('mongoose');
const Comment = require('../models/Comment');

const addCommentIndexes = async () => {
  try {
    // Add indexes for better performance
    await Comment.collection.createIndex({ blogId: 1, createdAt: -1 });
    await Comment.collection.createIndex({ status: 1 });
    await Comment.collection.createIndex({ email: 1 });
    await Comment.collection.createIndex({ parentComment: 1 });
    await Comment.collection.createIndex({ isSpam: 1 });
    
    console.log('Comment indexes created successfully');
  } catch (error) {
    console.error('Error creating comment indexes:', error);
  }
};

module.exports = addCommentIndexes;