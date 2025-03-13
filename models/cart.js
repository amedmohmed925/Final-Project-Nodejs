const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
            title: String,
            price: { type: Number, required: true },
            courseImage: String,
            isPurchased: { type: Boolean, default: false }
        }
    ],
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // نسبة الخصم
    finalTotal: { type: Number, default: 0 } // المجموع بعد الخصم
});


module.exports = mongoose.model("Cart", cartSchema);
