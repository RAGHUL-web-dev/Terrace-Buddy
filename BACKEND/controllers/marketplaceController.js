const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');

// Create marketplace item
exports.createItem = async (req, res) => {
  try {
    const { title, description, category, type, price, location, contactMethod } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/marketplace-images/${file.filename}`);
    }

    const item = await MarketplaceItem.create({
      title,
      description,
      seller: req.userId,
      category,
      type,
      price,
      images,
      location: location ? JSON.parse(location) : {},
      contactMethod
    });

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all marketplace items
exports.getAllItems = async (req, res) => {
  try {
    const { category, type, search, location, minPrice, maxPrice } = req.query;
    
    let query = { status: 'available' };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (location) query['location.city'] = { $regex: location, $options: 'i' };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name profileImage location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name profileImage email phone location');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const updates = req.body;
    
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => `/uploads/marketplace-images/${file.filename}`);
    }

    updates.updatedAt = Date.now();

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      item: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.seller.toString() !== req.userId && req.userRole !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's items
exports.getMyItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ seller: req.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};