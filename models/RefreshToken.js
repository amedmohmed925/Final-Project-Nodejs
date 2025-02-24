const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, expires: "7d" }
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
