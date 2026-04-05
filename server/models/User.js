const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  x: { type: Number, default: 400 },
  y: { type: Number, default: 300 },
  color: { type: String, default: '#7F77DD' },
  roomId: { type: String, default: null },
  connectedTo: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);