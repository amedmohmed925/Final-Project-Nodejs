// controllers/admin/paymentAdminController.js
const Payment = require('../../models/Payment');

// جلب جميع عمليات الدفع مع فلاتر بحث
exports.listPayments = async (req, res) => {
  try {
    const { userId, status, provider, orderId, minAmount, maxAmount, from, to, username, email, name, limit = 50 } = req.query;
    let filter = {};
    if (userId) filter.user = userId;
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (orderId) filter.orderId = orderId;
    if (minAmount) filter.amount = { ...filter.amount, $gte: Number(minAmount) };
    if (maxAmount) filter.amount = { ...filter.amount, $lte: Number(maxAmount) };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // فلترة بالاسم أو الإيميل أو اسم المستخدم
    let userFilter = {};
    if (username) userFilter.username = { $regex: username, $options: 'i' };
    if (email) userFilter.email = { $regex: email, $options: 'i' };
    if (name) userFilter.$or = [
      { firstName: { $regex: name, $options: 'i' } },
      { lastName: { $regex: name, $options: 'i' } }
    ];

    let userIds = [];
    if (Object.keys(userFilter).length > 0) {
      const User = require('../../models/User');
      const users = await User.find(userFilter).select('_id');
      userIds = users.map(u => u._id);
      if (userIds.length === 0) {
        // لا يوجد مستخدمين مطابقين، أرجع نتائج فارغة
        return res.json({ payments: [], totalCount: 0 });
      }
      filter.user = { $in: userIds };
    }

    const totalCount = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ payments, totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب عملية دفع واحدة بالتفصيل
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف عملية دفع واحدة
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف جميع عمليات الدفع
exports.clearPayments = async (req, res) => {
  try {
    await Payment.deleteMany({});
    res.json({ message: 'All payments cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
