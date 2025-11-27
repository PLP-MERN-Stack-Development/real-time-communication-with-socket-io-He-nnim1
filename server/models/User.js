/**
 * models/User.js
 * Mongoose model for storing chat users.
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 30,
  },
  socketId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null/missing values
  },
  online: {
    type: Boolean,
    default: false,
  },
  // Add creation date for potential future features
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);