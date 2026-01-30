const Message = require('../models/Message');
const Community = require('../models/Community');

// Get messages for a channel
exports.getChannelMessages = async (req, res) => {
  try {
    const { communityId, channelId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is member of community
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    if (!community.members.includes(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this community'
      });
    }

    let query = {
      community: communityId,
      channel: channelId,
      isDirect: false
    };

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profileImage')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get direct messages between users
exports.getDirectMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: otherUserId, isDirect: true },
        { sender: otherUserId, receiver: req.userId, isDirect: true }
      ]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate('sender')
      .populate('community');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions
    const isSender = message.sender._id.toString() === req.userId;
    const isCommunityAdmin = message.community && 
      message.community.admin.toString() === req.userId;
    const isPlatformAdmin = req.userRole === 'platform_admin';

    if (!isSender && !isCommunityAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: req.userId,
        isDirect: true
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// In your chatRoutes.js or similar
exports.uploadImage = async (req, res, next) => {
    try {
        const { communityId, channelId, content } = req.body;
        const imageUrl = `/uploads/chat-images/${req.file.filename}`;
        
        // Save message to database
        const message = await Message.create({
            community: communityId,
            channel: channelId,
            sender: req.userId,
            content,
            imageUrl,
            type: 'image'
        });
        
        // Emit socket event
        req.app.get('socketio').to(communityId).emit('new-message', message);
        
        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};