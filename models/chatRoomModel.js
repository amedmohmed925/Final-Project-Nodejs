const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);