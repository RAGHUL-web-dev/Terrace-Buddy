const Community = require('../models/Community');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create community
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, visibility, category, rules } = req.body;

    // Check if community name exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community name already exists'
      });
    }

    // Create community
    const community = await Community.create({
      name,
      description,
      admin: req.userId,
      visibility,
      category,
      rules: rules ? rules.split(',') : [],
      members: [req.userId]
    });

    // Create default channels
    const generalChannel = await Channel.create({
      name: 'general',
      description: 'General discussions',
      community: community._id,
      createdBy: req.userId,
      type: 'general'
    });

    const announcementsChannel = await Channel.create({
      name: 'announcements',
      description: 'Community announcements',
      community: community._id,
      createdBy: req.userId,
      type: 'announcements'
    });

    const helpChannel = await Channel.create({
      name: 'help',
      description: 'Ask for help',
      community: community._id,
      createdBy: req.userId,
      type: 'help'
    });

    // Add channels to community
    community.channels = [generalChannel._id, announcementsChannel._id, helpChannel._id];
    await community.save();

    // Update user's joined communities
    await User.findByIdAndUpdate(req.userId, {
      $push: { joinedCommunities: community._id }
    });

    res.status(201).json({
      success: true,
      community
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all communities
exports.getAllCommunities = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { visibility: 'public' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const communities = await Community.find(query)
      .populate('admin', 'name profileImage')
      .populate('members', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      communities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single community
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('admin', 'name profileImage')
      .populate('members', 'name profileImage')
      .populate('channels')
      .populate('pendingRequests', 'name profileImage');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.status(200).json({
      success: true,
      community
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    // Find communities where user is admin
    const communities = await Community.find({
      admin: req.userId,
      pendingRequests: { $exists: true, $not: { $size: 0 } }
    })
    .populate({
      path: 'pendingRequests',
      select: 'name email profileImage _id'
    })
    .populate('admin', 'name profileImage _id');

    res.status(200).json({
      success: true,
      communities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join community request
exports.requestToJoin = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if already a member
    if (community.members.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this community'
      });
    }

    // Check if already requested
    if (community.pendingRequests.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Join request already pending'
      });
    }

    // Add to pending requests
    community.pendingRequests.push(req.userId);
    await community.save();

    // Create notification for admin
    const user = await User.findById(req.userId);
    await Notification.create({
      user: community.admin,
      type: 'community_join_request',
      title: 'New Join Request',
      message: `${user.name} wants to join ${community.name}`,
      relatedId: community._id,
      relatedType: 'community'
    });

    res.status(200).json({
      success: true,
      message: 'Join request sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve join request
exports.approveJoinRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const community = req.community;

    // Remove from pending requests
    community.pendingRequests = community.pendingRequests.filter(
      id => id.toString() !== userId
    );

    // Add to members
    if (!community.members.includes(userId)) {
      community.members.push(userId);
    }

    await community.save();

    // Update user's joined communities
    await User.findByIdAndUpdate(userId, {
      $push: { joinedCommunities: community._id }
    });

    // Create notification for user
    await Notification.create({
      user: userId,
      type: 'community_approved',
      title: 'Join Request Approved',
      message: `Your request to join ${community.name} has been approved`,
      relatedId: community._id,
      relatedType: 'community'
    });

    res.status(200).json({
      success: true,
      message: 'Join request approved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const community = req.community;

    // Remove from members
    community.members = community.members.filter(
      id => id.toString() !== userId
    );

    await community.save();

    // Remove from user's joined communities
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create channel
exports.createChannel = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const community = req.community;

    const channel = await Channel.create({
      name,
      description,
      community: community._id,
      createdBy: req.userId,
      type
    });

    community.channels.push(channel._id);
    await community.save();

    res.status(201).json({
      success: true,
      channel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's communities
exports.getMyCommunities = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'joinedCommunities',
      populate: [
        { path: 'admin', select: 'name profileImage' },
        { path: 'channels' }
      ]
    });

    res.status(200).json({
      success: true,
      communities: user.joinedCommunities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};