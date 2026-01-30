const Notification = require('../models/Notification');
const socketConfig = require('../config/socket');

class NotificationService {
  async createNotification(userId, type, title, message, relatedId = null, relatedType = null) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        relatedId,
        relatedType
      });

      // Emit socket notification
      this.emitNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  emitNotification(userId, notification) {
    const io = require('socket.io').getIO();
    if (io) {
      io.to(`user-${userId}`).emit('new-notification', notification);
    }
  }

  async getUserNotifications(userId) {
    try {
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      await Notification.deleteOne({ _id: notificationId, user: userId });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();