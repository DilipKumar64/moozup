const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    // No CORS needed for mobile apps
    transports: ['websocket'], // Use WebSocket transport only
    pingTimeout: 60000, // Increase ping timeout for mobile
    pingInterval: 25000 // Increase ping interval for mobile
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join event room
    socket.on('joinEvent', async (eventId) => {
      if (!eventId) {
        socket.emit('error', { message: 'Event ID is required' });
        return;
      }
      socket.join(`event:${eventId}`);
      console.log(`User ${socket.userId} joined event ${eventId}`);
    });

    // Leave event room
    socket.on('leaveEvent', (eventId) => {
      if (!eventId) {
        socket.emit('error', { message: 'Event ID is required' });
        return;
      }
      socket.leave(`event:${eventId}`);
      console.log(`User ${socket.userId} left event ${eventId}`);
    });

    // Join session room
    socket.on('joinSession', async (sessionId) => {
      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      socket.join(`session:${sessionId}`);
      console.log(`User ${socket.userId} joined session ${sessionId}`);
    });

    // Leave session room
    socket.on('leaveSession', (sessionId) => {
      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      socket.leave(`session:${sessionId}`);
      console.log(`User ${socket.userId} left session ${sessionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'Internal server error' });
    });
  });

  return io;
};

// Helper functions to emit events
const emitSessionUpdate = (eventId, sessionData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(`event:${eventId}`).emit('eventSessionUpdate', sessionData);
};

const emitQuestionUpdate = (sessionId, questionData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(`session:${sessionId}`).emit('sessionQuestions', questionData);
};

module.exports = {
  initializeSocket,
  getIO: () => io,
  emitSessionUpdate,
  emitQuestionUpdate
}; 