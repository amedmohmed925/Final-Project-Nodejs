const axios = require("axios");
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

const addStudentToCourse = async (userId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) return;
  if (!course.students) course.students = [];
  // لا تضف الطالب إذا كان موجود بالفعل
  if (!course.students.some(id => id.toString() === userId.toString())) {
    course.students.push(userId);
    await course.save();
  }
};

const addCourseToUser = async (userId, courseId) => {
  const user = await User.findById(userId);
  if (!user) return;
  if (!user.purchasedCourses) user.purchasedCourses = [];
  // لا تضف الكورس إذا كان موجود بالفعل
  if (!user.purchasedCourses.some(id => id.toString() === courseId.toString())) {
    user.purchasedCourses.push(courseId);
    await user.save();
  }
};

const createPayment = async (req, res) => {
  console.log("req.user:", req.user);
  console.log("req.body:", req.body);
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const authResponse = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: PAYMOB_API_KEY,
    });
    const token = authResponse.data.token;
    console.log("Auth Token:", token);

    const orderPayload = {
      auth_token: token,
      delivery_needed: false,
      amount_cents: Math.round(req.body.amount * 100),
      currency: "EGP",
    };
    console.log("Order Payload:", orderPayload);
    const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders", orderPayload);
    const orderId = orderResponse.data.id;
    console.log("Order ID:", orderId);

    const paymentKeyPayload = {
      auth_token: token,
      amount_cents: Math.round(req.body.amount * 100),
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        email: req.body.email || req.user.email || "test@example.com",
        first_name: req.user.firstName || "Test",
        last_name: req.user.lastName || "User",
        phone_number: req.body.phoneNumber || "+201234567890",
        street: req.body.street || "Test Street",
        building: req.body.building || "NA", // أضيفي قيمة افتراضية
        floor: req.body.floor || "NA",       // أضيفي قيمة افتراضية
        apartment: req.body.apartment || "NA", // أضيفي قيمة افتراضية
        city: req.body.city || "Cairo",
        country: req.body.country || "EG",
        state: req.body.state || "Cairo",
        postal_code: req.body.postalCode || "12345",
      },
      currency: "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
    };
    console.log("Payment Key Payload:", paymentKeyPayload);
    const paymentKeyResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", paymentKeyPayload);
    const paymentKey = paymentKeyResponse.data.token;
    console.log("Payment Key:", paymentKey);

    // حفظ عملية الدفع في قاعدة البيانات
    await Payment.create({
      user: req.user.id,
      amount: req.body.amount,
      orderId: orderId,
      paymentKey: paymentKey,
      course: req.body.courseId, // إذا كان الدفع لكورس معين
      status: 'pending',
      provider: 'paymob'
    });

    // إضافة الطالب إلى الكورس بعد الدفع
    if (req.body.courseId) {
      await addStudentToCourse(req.user.id, req.body.courseId);
      await addCourseToUser(req.user.id, req.body.courseId);
    }

    res.json({ paymentKey, orderId });
  } catch (error) {
    console.error("Payment Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Failed to create payment",
      details: error.response?.data || error.message,
    });
  }
};

// Webhook لاستقبال إشعار الدفع من Paymob
const handlePaymobWebhook = async (req, res) => {
  try {
    const { obj } = req.body;
    // تحقق من وجود بيانات الطلب
    if (!obj || !obj.order || !obj.order.id) {
      return res.status(400).json({ message: 'Invalid webhook data' });
    }
    // ابحث عن عملية الدفع في قاعدة البيانات
    const payment = await Payment.findOne({ orderId: obj.order.id.toString() });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    // تحقق من حالة الدفع
    if (obj.success && obj.pending === false && obj.is_auth === true && obj.is_capture === true) {
      // اعتبر الدفع ناجحًا
      payment.status = 'completed';
      await payment.save();
      // أضف الطالب للكورس إذا لم يكن مضافًا
      if (payment.user && payment.course) {
        await addStudentToCourse(payment.user, payment.course);
        await addCourseToUser(payment.user, payment.course);
      }
      return res.status(200).json({ message: 'Payment completed and student added to course.' });
    } else {
      payment.status = 'failed';
      await payment.save();
      return res.status(200).json({ message: 'Payment failed or not completed.' });
    }
  } catch (error) {
    console.error('Paymob Webhook Error:', error.message);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

module.exports = { createPayment, handlePaymobWebhook };