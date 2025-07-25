// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      title: String,
      price: { type: Number, required: true },
      courseImage: String,
      isPurchased: { type: Boolean, default: false },
    },
  ],
  total: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  finalTotal: { type: Number, default: 0 },
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);