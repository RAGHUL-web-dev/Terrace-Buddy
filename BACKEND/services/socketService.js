const socketConfig = require('../config/socket');
const Notification = require('../models/Notification');

class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = socketConfig(server);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.userId}`);

      // Join user's personal room for notifications
      socket.join(`user-${socket.userId}`);

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { communityId, channelId } = data;
        socket.to(`community-${communityId}`).emit('user-typing', {
          userId: socket.userId,
          username: socket.username,
          channelId
        });
      });

      // Handle stop typing
      socket.on('stop-typing', (data) => {
        const { communityId, channelId } = data;
        socket.to(`community-${communityId}`).emit('user-stop-typing', {
          userId: socket.userId,
          channelId
        });
      });

      // Handle online status
      socket.on('set-online', () => {
        this.io.emit('user-online', { userId: socket.userId });
      });

      socket.on('set-offline', () => {
        this.io.emit('user-offline', { userId: socket.userId });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.userId}`);
        this.io.emit('user-offline', { userId: socket.userId });
      });
    });
  }

  // Emit notification to user
  emitNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit('new-notification', notification);
    }
  }

  // Emit message to community
  emitCommunityMessage(communityId, message) {
    if (this.io) {
      this.io.to(`community-${communityId}`).emit('new-message', message);
    }
  }

  // Emit direct message
  emitDirectMessage(senderId, receiverId, message) {
    if (this.io) {
      this.io.to(`user-${receiverId}`).emit('direct-message', message);
      this.io.to(`user-${senderId}`).emit('direct-message-sent', message);
    }
  }

  // Get online users
  getOnlineUsers() {
    if (!this.io) return [];
    
    const sockets = this.io.sockets.sockets;
    const onlineUsers = new Set();
    
    for (const [socketId, socket] of sockets) {
      if (socket.userId) {
        onlineUsers.add(socket.userId);
      }
    }
    
    return Array.from(onlineUsers);
  }

  // Check if user is online
  isUserOnline(userId) {
    if (!this.io) return false;
    
    const sockets = this.io.sockets.sockets;
    for (const [socketId, socket] of sockets) {
      if (socket.userId === userId) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = new SocketService();