const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, enum: ["teacher", "student", "admin", "advertiser"], required: true },
    isVerified: { type: Boolean, default: false },
    profileImage: { 
        type: String, 
        default: null 
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);