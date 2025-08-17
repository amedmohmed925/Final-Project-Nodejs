// models/LiveSession.js
const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: { type: String, enum: ['scheduled', 'live', 'ended', 'canceled'], default: 'scheduled' },
    roomCode: { type: String, unique: true },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);


liveSessionSchema.index({ courseId: 1, scheduledAt: -1 });
liveSessionSchema.index({ teacherId: 1, scheduledAt: -1 });
liveSessionSchema.index({ status: 1, scheduledAt: -1 });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
