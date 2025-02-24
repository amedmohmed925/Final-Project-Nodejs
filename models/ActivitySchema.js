const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["login", "course_enrollment", "course_completed", "quiz_completed"], required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Activity", activitySchema);