// controllers/admin/statsAdminController.js
const User = require('../../models/User');
const Course = require('../../models/Course');
const Complaint = require('../../models/Complaint');
const Coupon = require('../../models/Coupon');
const Payment = require('../../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalStudents,
      totalCourses,
      totalComplaints,
      openComplaints,
      totalCoupons,
      activeCoupons,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);
    res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        teachers: totalTeachers,
        students: totalStudents
      },
      courses: totalCourses,
      complaints: {
        total: totalComplaints,
        open: openComplaints
      },
      coupons: {
        total: totalCoupons,
        active: activeCoupons
      },
      revenue: totalRevenue[0] ? totalRevenue[0].total : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
