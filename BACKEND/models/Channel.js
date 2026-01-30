const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a channel name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'announcements', 'help', 'general'],
    default: 'text'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Channel', channelSchema);