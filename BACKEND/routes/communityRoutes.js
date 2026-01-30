const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');
const { isCommunityAdmin } = require('../middleware/roleCheck');

// Public routes
router.get('/', communityController.getAllCommunities);
router.get('/:id', communityController.getCommunity);

// Protected routes
router.post('/', auth, communityController.createCommunity);
router.get('/user/my-communities', auth, communityController.getMyCommunities);
router.post('/:id/join', auth, communityController.requestToJoin);

// Admin only routes
router.post('/:communityId/approve-join', auth, isCommunityAdmin, communityController.approveJoinRequest);
router.post('/:communityId/remove-member', auth, isCommunityAdmin, communityController.removeMember);
router.post('/:communityId/channels', auth, isCommunityAdmin, communityController.createChannel);
router.get('/pending-requests', auth, communityController.getPendingRequests);

module.exports = router;