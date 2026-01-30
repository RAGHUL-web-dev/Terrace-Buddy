const User = require('../models/User');
const Community = require('../models/Community');
const Plant = require('../models/Plant');
const Notification = require('../models/Notification');
const weatherService = require('../services/weatherService');
const notificationService = require('../services/notificationService');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedCommunities', 'name description category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's plant count
    const plantCount = await Plant.countDocuments({ user: req.params.id });
    
    // Get user's marketplace items count
    const MarketplaceItem = require('../models/MarketplaceItem');
    const itemCount = await MarketplaceItem.countDocuments({ 
      seller: req.params.id,
      status: 'available'
    });

    const profile = {
      ...user.toObject(),
      stats: {
        plants: plantCount,
        marketplaceItems: itemCount,
        communities: user.joinedCommunities.length
      }
    };

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.userId);

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.userId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await notificationService.deleteNotification(
      req.params.notificationId,
      req.userId
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get weather suggestions for user
exports.getWeatherSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('location');
    
    if (!user.location || !user.location.city) {
      return res.status(400).json({
        success: false,
        message: 'Please set your location in profile to get weather suggestions'
      });
    }

    const weatherData = await weatherService.getWeatherByCity(user.location.city);

    res.status(200).json({
      success: true,
      weather: weatherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('name gardeningLevel location joinedCommunities')
      .populate('joinedCommunities', 'name memberCount');

    // Get user's plants
    const plants = await Plant.find({ user: req.userId })
      .select('name status location')
      .limit(5)
      .sort({ updatedAt: -1 });

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      user: req.userId,
      isRead: false
    });

    // Get recent marketplace items
    const MarketplaceItem = require('../models/MarketplaceItem');
    const recentItems = await MarketplaceItem.find({ 
      seller: req.userId,
      status: 'available'
    })
    .select('title category type price')
    .limit(5)
    .sort({ createdAt: -1 });

    // Get weather data if location is set
    let weather = null;
    if (user.location && user.location.city) {
      weather = await weatherService.getWeatherByCity(user.location.city);
    }

    // Get gardening tips based on user level
    const KnowledgeBase = require('../models/KnowledgeBase');
    const tips = await KnowledgeBase.find({
      category: user.gardeningLevel || 'beginner'
    })
    .select('title tags')
    .limit(3)
    .sort({ views: -1 });

    const dashboardData = {
      user: {
        name: user.name,
        gardeningLevel: user.gardeningLevel,
        location: user.location
      },
      stats: {
        plants: await Plant.countDocuments({ user: req.userId }),
        communities: user.joinedCommunities.length,
        marketplaceItems: await MarketplaceItem.countDocuments({ 
          seller: req.userId,
          status: 'available'
        }),
        unreadNotifications
      },
      recent: {
        plants,
        marketplaceItems: recentItems
      },
      weather,
      tips,
      communities: user.joinedCommunities.slice(0, 3)
    };

    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const { notifications, privacy, gardeningLevel } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (gardeningLevel) {
      user.gardeningLevel = gardeningLevel;
    }
    
    // Store settings in a separate field or in user document
    user.settings = {
      notifications: notifications || user.settings?.notifications || {},
      privacy: privacy || user.settings?.privacy || {}
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.userId } // Exclude current user
    })
    .select('name profileImage gardeningLevel location')
    .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};