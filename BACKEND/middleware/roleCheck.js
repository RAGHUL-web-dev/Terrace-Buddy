const Community = require('../models/Community');

const isCommunityAdmin = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.body.communityId;
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    if (community.admin.toString() !== req.userId && req.userRole !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Community admin only.'
      });
    }

    req.community = community;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isPlatformAdmin = (req, res, next) => {
  if (req.userRole !== 'platform_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Platform admin only.'
    });
  }
  next();
};

module.exports = { isCommunityAdmin, isPlatformAdmin };