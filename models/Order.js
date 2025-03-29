const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amountCents: { type: Number, required: true },
    merchantOrderId: { type: Number, required: true, unique: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
