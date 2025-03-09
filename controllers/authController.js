const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require('../models/OTP');
const mailSender = require("../utils/mailSender");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
    try {
      console.log("Request Body:", req.body);

      const { username, password, confirm_password, firstName, lastName, email, dob, role } = req.body;

      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const existingEmail = await User.findOne({ email });
      console.log("Existing Email:", existingEmail);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const existingUser = await User.findOne({ username });
      console.log("Existing User:", existingUser);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        dob,
        role,
        isVerified: false,
      });

      await newUser.save();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.create({ email, otp });

      res.status(201).json({ message: "User registered successfully. Please check your email for OTP." });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: "Account not verified. Please verify your email.",
        user: { email: user.email } 
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.json({ 
      message: "Login successful", 
      accessToken, 
      refreshToken,
      user: user.toObject()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Received OTP request:", { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP." });
    }


    const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 }).limit(1);
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }


    const now = new Date();
    const otpExpiryTime = new Date(otpRecord.createdAt.getTime() + 60 * 60 * 1000); // 1 ساعة
    if (now > otpExpiryTime) {
      return res.status(400).json({ message: "OTP has expired." });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isVerified = true;
    await user.save();


    await OTP.deleteMany({ email });

    res.status(200).json({ message: "Account verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide your email." });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    const recentOTP = await OTP.findOne({ email, createdAt: { $gt: new Date(Date.now() - 60 * 1000) } }); // خلال آخر دقيقة
    if (recentOTP) {
      return res.status(400).json({ message: "Please wait before requesting a new OTP." });
    }


    await OTP.deleteMany({ email });


    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    await OTP.create({ email, otp });


    await mailSender(
      email,
      "Resend OTP",
      `<h1>Resend OTP</h1><p>Your new OTP code is: ${otp}</p>`
    );

    res.status(200).json({ message: "OTP resent successfully. Please check your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) return res.status(403).json({ message: "Forbidden" });

    jwt.verify(token, process.env.REFRESH_SECRET, async (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    await RefreshToken.deleteOne({ token });

    res.json({ message: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide your email." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // توليد توكن مؤقت لإعادة تعيين الباسورد (ينتهي بعد ساعة)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.RESET_SECRET || "reset-secret-key", // ضيف الـ RESET_SECRET في الـ .env
      { expiresIn: "1h" }
    );

    // رابط إعادة تعيين الباسورد
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    // إرسال الإيميل مع الرابط
    await mailSender(
      email,
      "Reset Your Password",
      `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #ebca26; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `
    );

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    next(error);
  }
};  

exports.resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, token, and new password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // التحقق من التوكن
    jwt.verify(token, process.env.RESET_SECRET || "reset-secret-key", async (err, decoded) => {
      if (err || decoded.email !== email) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully.' });
    });
  } catch (error) {
    next(error);
  }
};