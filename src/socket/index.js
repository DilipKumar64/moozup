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
    // Check both auth object and headers for token
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    console.log('Socket connection attempt with token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log('Socket authenticated for user:', socket.userId);
      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    console.log('Socket rooms:', socket.rooms);

    // Join event room
    socket.on('joinEvent', async (eventId) => {
      console.log('joinEvent called with eventId:', eventId);
      if (!eventId) {
        socket.emit('error', { message: 'Event ID is required' });
        return;
      }
      const roomName = `event:${eventId}`;
      socket.join(roomName);
      console.log(`User ${socket.userId} joined event room: ${roomName}`);
      console.log('Current socket rooms:', socket.rooms);
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
      const roomName = `session:${sessionId}`;
      socket.join(roomName);
      console.log(`User ${socket.userId} joined session ${sessionId}`);
      
      // Also join the session's poll room
      const pollRoomName = `session:${sessionId}:polls`;
      socket.join(pollRoomName);
      console.log(`User ${socket.userId} joined poll room for session ${sessionId}`);
    });

    // Leave session room
    socket.on('leaveSession', (sessionId) => {
      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      const roomName = `session:${sessionId}`;
      socket.leave(roomName);
      console.log(`User ${socket.userId} left session ${sessionId}`);
      
      // Also leave the session's poll room
      const pollRoomName = `session:${sessionId}:polls`;
      socket.leave(pollRoomName);
      console.log(`User ${socket.userId} left poll room for session ${sessionId}`);
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
  try {
    const roomName = `event:${eventId}`;
    console.log('Emitting session update to room:', roomName);
    console.log('Session data:', sessionData);
    console.log('Connected sockets in room:', io.sockets.adapter.rooms.get(roomName)?.size || 0);
    
    io.to(roomName).emit('eventSessionUpdate', sessionData);
    console.log('Event session update emitted to room:', roomName);
  } catch (error) {
    console.error('Error emitting event session update:', error);
  }
};

const emitQuestionUpdate = (sessionId, questionData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  io.to(`session:${sessionId}`).emit('sessionQuestions', questionData);
};

// Poll event emitter functions
const emitPollCreated = (sessionId, pollData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  try {
    const roomName = `session:${sessionId}:polls`;
    console.log('Emitting poll created to room:', roomName);
    console.log('Poll data:', pollData);
    
    io.to(roomName).emit('pollCreated', pollData);
    console.log('Poll created event emitted to room:', roomName);
  } catch (error) {
    console.error('Error emitting poll created event:', error);
  }
};

const emitPollUpdated = (sessionId, pollData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  try {
    const roomName = `session:${sessionId}:polls`;
    console.log('Emitting poll updated to room:', roomName);
    console.log('Poll data:', pollData);
    
    io.to(roomName).emit('pollUpdated', pollData);
    console.log('Poll updated event emitted to room:', roomName);
  } catch (error) {
    console.error('Error emitting poll updated event:', error);
  }
};

const emitPollResponse = (sessionId, pollId, responseData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  try {
    const roomName = `session:${sessionId}:polls`;
    console.log('Emitting poll response to room:', roomName);
    console.log('Response data:', responseData);
    
    io.to(roomName).emit('pollResponse', {
      pollId,
      ...responseData
    });
    console.log('Poll response event emitted to room:', roomName);
  } catch (error) {
    console.error('Error emitting poll response event:', error);
  }
};

const emitPollEnded = (sessionId, pollData) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  try {
    const roomName = `session:${sessionId}:polls`;
    console.log('Emitting poll ended to room:', roomName);
    console.log('Poll data:', pollData);
    
    io.to(roomName).emit('pollEnded', pollData);
    console.log('Poll ended event emitted to room:', roomName);
  } catch (error) {
    console.error('Error emitting poll ended event:', error);
  }
};

module.exports = {
  initializeSocket,
  getIO: () => io,
  emitSessionUpdate,
  emitQuestionUpdate,
  emitPollCreated,
  emitPollUpdated,
  emitPollResponse,
  emitPollEnded
}; 