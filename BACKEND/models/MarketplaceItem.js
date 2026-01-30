const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['plants', 'seeds', 'tools', 'compost', 'soil', 'pots', 'other'],
    required: true
  },
  type: {
    type: String,
    enum: ['sell', 'buy', 'exchange'],
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  location: {
    city: String,
    state: String
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'exchanged'],
    default: 'available'
  },
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'in-app'],
    default: 'in-app'
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

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);