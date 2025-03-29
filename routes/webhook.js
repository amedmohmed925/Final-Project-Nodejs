const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

/**
 * @swagger
 * /api/webhook/paymob/webhook:
 *   post:
 *     summary: Handle Paymob webhook notifications
 *     description: Receives payment status updates from Paymob and updates the order status accordingly.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               obj:
 *                 type: object
 *                 properties:
 *                   order:
 *                     type: object
 *                     properties:
 *                       merchant_order_id:
 *                         type: integer
 *                   success:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid webhook data
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/paymob/webhook", async (req, res) => {
    try {
        const { obj } = req.body;
        if (!obj || !obj.order || !obj.order.merchant_order_id) {
            return res.status(400).json({ error: "Invalid webhook data" });
        }

        // 🔹 البحث عن الطلب في قاعدة البيانات
        const order = await Order.findOne({ merchantOrderId: obj.order.merchant_order_id });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // 🔹 تحديث حالة الطلب بناءً على رد Paymob
        order.status = obj.success ? "paid" : "failed";
        await order.save();

        res.json({ message: "Order status updated" });
    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
