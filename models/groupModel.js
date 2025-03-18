const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pendingInvites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // دعوات معلقة
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  isPrivate: { type: Boolean, default: false },
  chatMessages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);