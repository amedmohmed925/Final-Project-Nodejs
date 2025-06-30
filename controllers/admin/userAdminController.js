
const User = require('../../models/User');
const Log = require('../../models/Log');

// جلب جميع المعلمين
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teachers', error: err.message });
  }
};

// جلب جميع الطلاب
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};
// controllers/admin/userAdminController.js
// إدارة المستخدمين للأدمن

// تفعيل حساب مستخدم
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Log.create({ userId: req.user.id, action: 'activateUser', details: `Activated user ${user._id}` });
    res.json({ message: 'User activated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error activating user', error: err.message });
  }
};

// تعطيل حساب مستخدم
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Log.create({ userId: req.user.id, action: 'deactivateUser', details: `Deactivated user ${user._id}` });
    res.json({ message: 'User deactivated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error deactivating user', error: err.message });
  }
};

// تغيير دور مستخدم
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin','teacher','student','advertiser'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Log.create({ userId: req.user.id, action: 'changeUserRole', details: `Changed role for user ${user._id} to ${role}` });
    res.json({ message: 'User role updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error changing user role', error: err.message });
  }
};

// حذف مستخدم
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Log.create({ userId: req.user.id, action: 'deleteUser', details: `Deleted user ${req.params.id}` });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// بحث متقدم عن المستخدمين
exports.advancedUserSearch = async (req, res) => {
  try {
    const { role, isVerified, username, email } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (username) filter.username = { $regex: username, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error searching users', error: err.message });
  }
};
