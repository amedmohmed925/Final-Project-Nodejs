const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// تسجيل أو تسجيل دخول مستخدم عبر جوجل
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profileImage, role } = req.body;
    if (!googleId || !email || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'Missing required Google user data' });
    }
    let user = await User.findOne({ email });
    if (user) {
      // إذا كان المستخدم موجود مسبقًا
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // إنشاء مستخدم جديد مع كلمة مرور عشوائية وdob افتراضي
      const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
      user = new User({
        username: email.split('@')[0] + '_' + googleId.slice(-4),
        email,
        firstName,
        lastName,
        role,
        isVerified: true,
        googleId,
        profileImage: profileImage || null,
        password: randomPassword,
        dob: new Date('2000-01-01') // تاريخ افتراضي
      });
      await user.save();
    }
    // إنشاء توكنات
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.ACCESS_SECRET,
      { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Google login successful',
      accessToken,
      refreshToken,
      user: user.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Google auth error', error: error.message });
  }
};
