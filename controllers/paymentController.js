require("dotenv").config();
const axios = require("axios");
const Course = require("../models/Course");
const User = require("../models/User");
const Order = require("../models/Order");

// ✅ الحصول على Auth Token من Paymob
async function getAuthToken() {
    try {
        if (!process.env.PAYMOB_API_KEY) {
            throw new Error("Missing PAYMOB_API_KEY in .env");
        }
        
        const response = await axios.post("https://accept.paymob.com/api/auth/tokens", {
            api_key: process.env.PAYMOB_API_KEY
        });

        if (!response.data || !response.data.token) {
            throw new Error("Failed to retrieve auth token");
        }
        
        return response.data.token;
    } catch (error) {
        console.error("Auth token error:", error.message);
        throw error;
    }
}

// ✅ إنشاء طلب دفع (Order)
async function createOrder(authToken, amountCents, currency) {
    try {
        const response = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
            auth_token: authToken,
            delivery_needed: false,
            amount_cents: amountCents.toString(),
            currency: currency,
            merchant_order_id: Math.floor(Math.random() * 1000000),
            items: []
        });

        if (!response.data || !response.data.id) {
            throw new Error("Failed to create order");
        }

        return { orderId: response.data.id, merchantOrderId: response.data.merchant_order_id };
    } catch (error) {
        console.error("Order creation error:", error.message);
        throw error;
    }
}

// ✅ الحصول على Payment Key
async function getPaymentKey(authToken, orderId, amountCents, user, currency) {
    try {
        if (!process.env.PAYMOB_INTEGRATION_ID) {
            throw new Error("Missing PAYMOB_INTEGRATION_ID in .env");
        }

        const response = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
            auth_token: authToken,
            amount_cents: amountCents.toString(),
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                first_name: user.firstName || "User",
                last_name: user.lastName || "Unknown",
                email: user.email || "test@example.com",
                phone_number: user.phone || "01000000000",
                city: user.city || "Cairo",
                country: user.country || "EG",
                street: user.street || "Unknown Street",
            },
            currency: currency,
            integration_id: process.env.PAYMOB_INTEGRATION_ID
        });

        if (!response.data || !response.data.token) {
            throw new Error("Failed to retrieve payment key");
        }

        return response.data.token;
    } catch (error) {
        console.error("Payment key error:", error.message);
        throw error;
    }
}

// ✅ تنفيذ عملية الدفع
const processPayment = async (req, res) => {
    try {
        const { courseId, userId, currency = "EGP" } = req.body;

        // 🔹 التحقق من صحة بيانات الكورس
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // 🔹 التحقق من صحة بيانات المستخدم
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const amountCents = course.price * 100;

        // 🔹 تنفيذ خطوات الدفع
        const authToken = await getAuthToken();
        const { orderId, merchantOrderId } = await createOrder(authToken, amountCents, currency);
        const paymentKey = await getPaymentKey(authToken, orderId, amountCents, user, currency);

        // 🔹 حفظ الطلب في قاعدة البيانات
        const order = new Order({
            userId,
            courseId,
            amountCents,
            merchantOrderId,
            status: "pending"
        });
        await order.save();

        res.json({ payment_key: paymentKey, order_id: orderId });
    } catch (error) {
        console.error("Payment process error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports =  processPayment ;
