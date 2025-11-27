/**
 * models/Message.js
 * Mongoose model for persistent storage of chat messages.
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String, // The username of the sender
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  // Optional room name (for channels). Defaults to 'global'
  room: {
    type: String,
    default: 'global',
  },
  // Optional base64 image string or image URL
  image: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  recipient: {
    type: String, // Recipient's username (if isPrivate is true)
    required: function() { return this.isPrivate; },
  },
  // Reactions: simple array of { username, reaction }
  reactions: {
    type: [
      {
        username: String,
        reaction: String,
      }
    ],
    default: [],
  }
});

module.exports = mongoose.model('Message', MessageSchema);