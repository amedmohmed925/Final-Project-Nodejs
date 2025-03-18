const mongoose = require("mongoose");

const activityStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  likesGiven: { type: Number, default: 0 },
  groupsJoined: { type: Number, default: 0 },
  chatMessages: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("ActivityStats", activityStatsSchema);