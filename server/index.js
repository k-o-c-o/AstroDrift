const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { checkProximity, getRoomId } = require('./utils/proximity');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// In-memory store for fast proximity checks
// Shape: { [socketId]: { userId, username, x, y, color, roomId, connectedTo } }
const users = {};

const AVATAR_COLORS = [
  '#7F77DD', '#1D9E75', '#D85A30',
  '#378ADD', '#D4537E', '#BA7517',
  '#5DCAA5', '#F0997B', '#85B7EB',
];
let colorIndex = 0;

// ─────────────────────────────────────────────
// REST endpoint: health check
// ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', users: Object.keys(users).length }));

// ─────────────────────────────────────────────
// Socket.IO events
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // ── 1. User joins the cosmos ──
  socket.on('user:join', ({ username }) => {
    const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
    colorIndex++;

    users[socket.id] = {
      userId: socket.id,
      username,
      x: 200 + Math.random() * 800,
      y: 150 + Math.random() * 500,
      color,
      roomId: null,
      connectedTo: null,
    };

    // Send all current users to the new joiner
    socket.emit('users:init', users);

    // Tell everyone else about the new user
    socket.broadcast.emit('user:joined', users[socket.id]);

    console.log(`👤 ${username} joined`);
  });

  // ── 2. User moves ──
  socket.on('user:move', ({ x, y }) => {
    if (!users[socket.id]) return;

    users[socket.id].x = x;
    users[socket.id].y = y;

    // Broadcast new position to all other users
    socket.broadcast.emit('user:moved', {
      userId: socket.id,
      x,
      y,
    });

    // Run proximity detection
    const { toConnect, toDisconnect } = checkProximity(socket.id, users);

    // Handle new connections
    toConnect.forEach(({ otherId, roomId, otherUser }) => {
      const myUser = users[socket.id];

      // Only connect if neither is already connected to someone else
      if (myUser.connectedTo && myUser.connectedTo !== otherId) return;
      if (otherUser.connectedTo && otherUser.connectedTo !== socket.id) return;

      if (myUser.connectedTo !== otherId) {
        users[socket.id].connectedTo = otherId;
        users[socket.id].roomId = roomId;
        users[otherId].connectedTo = socket.id;
        users[otherId].roomId = roomId;

        // Both users join the socket room
        socket.join(roomId);
        const otherSocket = io.sockets.sockets.get(otherId);
        if (otherSocket) otherSocket.join(roomId);

        // Notify both users
        io.to(socket.id).emit('proximity:connect', {
          roomId,
          withUser: otherUser,
        });
        io.to(otherId).emit('proximity:connect', {
          roomId,
          withUser: myUser,
        });

        console.log(`🔗 ${myUser.username} ↔ ${otherUser.username} connected`);
      }
    });

    // Handle disconnections
    toDisconnect.forEach(({ otherId, roomId }) => {
      const myUser = users[socket.id];
      const otherUser = users[otherId];

      users[socket.id].connectedTo = null;
      users[socket.id].roomId = null;
      if (otherUser) {
        users[otherId].connectedTo = null;
        users[otherId].roomId = null;
      }

      socket.leave(roomId);
      const otherSocket = io.sockets.sockets.get(otherId);
      if (otherSocket) otherSocket.leave(roomId);

      io.to(socket.id).emit('proximity:disconnect', { roomId });
      io.to(otherId).emit('proximity:disconnect', { roomId });

      console.log(`💔 ${myUser?.username} ↔ ${otherUser?.username} disconnected`);
    });
  });

  // ── 3. Chat message ──
  socket.on('chat:message', ({ roomId, message }) => {
    const user = users[socket.id];
    if (!user) return;
    if (user.roomId !== roomId) return;

    const payload = {
      from: user.username,
      userId: socket.id,
      message,
      timestamp: Date.now(),
    };

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit('chat:message', payload);
  });

  // ── 4. Typing indicator ──
  socket.on('chat:typing', ({ roomId, isTyping }) => {
    const user = users[socket.id];
    if (!user) return;
    socket.to(roomId).emit('chat:typing', {
      username: user.username,
      isTyping,
    });
  });

  // ── 5. User disconnects ──
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;

    // If connected to someone, disconnect them
    if (user.connectedTo) {
      const otherId = user.connectedTo;
      const roomId = user.roomId;
      if (users[otherId]) {
        users[otherId].connectedTo = null;
        users[otherId].roomId = null;
        io.to(otherId).emit('proximity:disconnect', { roomId });
      }
    }

    socket.broadcast.emit('user:left', { userId: socket.id });
    delete users[socket.id];
    console.log(`❌ ${user.username} left`);
  });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});