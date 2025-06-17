// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  orderId: { type: String, required: true },
  paymentKey: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // اختياري إذا كان الدفع لكورس محدد
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  provider: { type: String, default: 'paymob' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
