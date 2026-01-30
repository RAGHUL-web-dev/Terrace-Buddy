const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    unique: true,
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer']
  },
  category: {
    type: String,
    enum: ['watering', 'pests', 'soil', 'growth', 'seeds', 'tools', 'general'],
    required: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
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

module.exports = mongoose.model('FAQ', faqSchema);