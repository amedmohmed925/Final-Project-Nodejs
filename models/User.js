const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  role: {
    type: String,
    enum: ["teacher", "student", "admin", "advertiser"],
    required: true,
  },
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: null },
  certificates: [{ type: String }],
  graduationYear: {
    type: Number,
    required: function () {
      return this.role === "teacher";
    },
  },
  university: {
    type: String,
    required: function () {
      return this.role === "teacher";
    },
  },
  major: {
    type: String,
    required: function () {
      return this.role === "teacher";
    },
  },
  bio: { type: String },
  googleId: { type: String, default: null },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
  },
}, { timestamps: true });

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);