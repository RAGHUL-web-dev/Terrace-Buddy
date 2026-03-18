const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { isPlatformAdmin } = require('../middleware/roleCheck');

// Protect all routes with auth and platform admin check
router.use(auth);
router.use(isPlatformAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Community Management
router.get('/communities', adminController.getAllCommunities);
router.put('/communities/:id', adminController.updateCommunity);
router.delete('/communities/:id', adminController.deleteCommunity);

module.exports = router;
