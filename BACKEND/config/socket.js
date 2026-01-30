const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

let io;

const socketConfig = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.name;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username}`);

    // Join community room
    socket.on('join-community', (communityId) => {
      socket.join(`community-${communityId}`);
      console.log(`${socket.username} joined community ${communityId}`);
    });

    // Leave community room
    socket.on('leave-community', (communityId) => {
      socket.leave(`community-${communityId}`);
    });

    // Send message to community channel
    socket.on('send-message', async (data) => {
      try {
        const { communityId, channelId, content } = data;
        
        const message = new Message({
          community: communityId,
          channel: channelId,
          sender: socket.userId,
          content: content,
          timestamp: new Date()
        });

        await message.save();
        
        // Populate sender info
        await message.populate('sender', 'name profileImage');
        
        io.to(`community-${communityId}`).emit('new-message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Direct message
    socket.on('send-direct-message', async (data) => {
      try {
        const { receiverId, content } = data;
        
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content: content,
          isDirect: true,
          timestamp: new Date()
        });

        await message.save();
        
        // Emit to both sender and receiver
        io.emit(`direct-message-${receiverId}`, message);
        socket.emit(`direct-message-${socket.userId}`, message);
      } catch (error) {
        console.error('Error sending direct message:', error);
      }
    });

    // Join user's personal room for notifications
    socket.on('join-notifications', () => {
      socket.join(`user-${socket.userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username}`);
    });
  });

  return io;
};

module.exports = socketConfig;