const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a plant name'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please provide plant type']
  },
  datePlanted: {
    type: Date,
    required: true
  },
  lastWatered: {
    type: Date
  },
  status: {
    type: String,
    enum: ['seed', 'seedling', 'growing', 'flowering', 'fruiting', 'harvested', 'dormant', 'deceased'],
    default: 'seed'
  },
  location: {
    type: String,
    enum: ['terrace', 'balcony', 'indoor', 'window', 'garden'],
    required: true
  },
  sunlight: {
    type: String,
    enum: ['full', 'partial', 'shade'],
    required: true
  },
  images: [{
    url: String,
    caption: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['observation', 'milestone', 'issue', 'care']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plant', plantSchema);