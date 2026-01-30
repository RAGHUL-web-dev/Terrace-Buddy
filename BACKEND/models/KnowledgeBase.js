const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  plantTypes: [{
    type: String
  }],
  sunlight: {
    type: String,
    enum: ['full', 'partial', 'shade', 'any']
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'monsoon', 'winter', 'all']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);