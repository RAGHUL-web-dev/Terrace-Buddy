const Plant = require('../models/Plant');

// Add new plant
exports.addPlant = async (req, res) => {
  try {
    const { name, type, datePlanted, location, sunlight } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: `/uploads/plant-images/${file.filename}`,
        caption: file.originalname
      }));
    }

    const plant = await Plant.create({
      name,
      user: req.userId,
      type,
      datePlanted,
      location,
      sunlight,
      images
    });

    res.status(201).json({
      success: true,
      plant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's plants
exports.getUserPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plants.length,
      plants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update plant
exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Check ownership
    if (plant.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this plant'
      });
    }

    const updates = req.body;
    updates.updatedAt = Date.now();

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/plant-images/${file.filename}`,
        caption: file.originalname
      }));
      
      if (!updates.images) updates.images = [];
      updates.images = [...plant.images, ...newImages];
    }

    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      plant: updatedPlant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add note to plant
exports.addNote = async (req, res) => {
  try {
    const { content, type } = req.body;
    
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Check ownership
    if (plant.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this plant'
      });
    }

    plant.notes.push({
      content,
      type: type || 'observation'
    });

    plant.updatedAt = Date.now();
    await plant.save();

    res.status(200).json({
      success: true,
      plant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete plant
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Check ownership
    if (plant.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this plant'
      });
    }

    await plant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get plant statistics
exports.getPlantStats = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.userId });
    
    const stats = {
      total: plants.length,
      byStatus: {},
      byLocation: {},
      byType: {}
    };

    plants.forEach(plant => {
      // Count by status
      stats.byStatus[plant.status] = (stats.byStatus[plant.status] || 0) + 1;
      
      // Count by location
      stats.byLocation[plant.location] = (stats.byLocation[plant.location] || 0) + 1;
      
      // Count by type (simplified)
      const type = plant.type.split(' ')[0].toLowerCase();
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};