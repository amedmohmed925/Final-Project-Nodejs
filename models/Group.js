const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);