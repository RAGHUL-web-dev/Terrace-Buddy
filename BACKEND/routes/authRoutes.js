const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, upload.single('profileImage'), authController.updateProfile);
router.put('/reset-password', auth, authController.resetPassword);

module.exports = router;