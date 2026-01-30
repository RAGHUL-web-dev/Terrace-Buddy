const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a community name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  category: {
    type: String,
    enum: ['general', 'vegetables', 'herbs', 'flowers', 'organic', 'tools', 'regional'],
    default: 'general'
  },
  bannerImage: {
    type: String,
    default: ''
  },
  rules: [{
    type: String
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Community', communitySchema);