const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", courseSchema);
