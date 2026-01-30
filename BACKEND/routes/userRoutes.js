const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// User profile routes
router.get('/profile/:id', auth, userController.getUserProfile);
router.get('/search', auth, userController.searchUsers);

// Notification routes
router.get('/notifications', auth, userController.getNotifications);
router.put('/notifications/:notificationId/read', auth, userController.markNotificationAsRead);
router.put('/notifications/read-all', auth, userController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', auth, userController.deleteNotification);

// Dashboard and settings
router.get('/dashboard', auth, userController.getDashboardData);
router.put('/settings', auth, userController.updateSettings);
router.get('/weather-suggestions', auth, userController.getWeatherSuggestions);

module.exports = router;