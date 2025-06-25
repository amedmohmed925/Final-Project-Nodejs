const cloudinary = require('../cloudinaryConfig'); 
const User = require("../models/User");const Forum = require("../models/Forum");
const Notification = require("../models/Notification");
const Activity = require("../models/activityStatsModel"); 
const Course = require('../models/Course');
const bcrypt = require("bcrypt");



let updateProfileImage = async (req, res) => {
  let { id } = req.params;

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_images",
      transformation: [
        { width: 200, height: 200, crop: "fill" }
      ]
    });


    user.profileImage = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile image",
      error
    });
  }
};



let getAllUsers = async (req, res) => {
  try {
    let allUsers = await User.find();
    res.status(200).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error,
    });
  }
};

let getUserById = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user", error });
  }
};

let getCoursesByUser = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let courses = await Course.find({
      $or: [{ instructorId: id }, { students: id }]
    });

    res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user courses", error });
  }
};

const getStudentsCount = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: "student" });
    res.status(200).json(studentsCount); // Return only the number
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students count",
      error,
    });
  }
};

// Get Teachers Count Only
const getTeachersCount = async (req, res) => {
  try {
    const teachersCount = await User.countDocuments({ role: "teacher" });
    res.status(200).json(teachersCount); // Return only the number
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teachers count",
      error,
    });
  }
};

let getUserFeedbacks = async (req, res) => {
  // let { id } = req.params;

  // try {
  //   let user = await User.findById(id);

  //   if (!user) {
  //     return res
  //       .status(404)
  //       .json({ success: false, message: "User not found" });
  //   }

  //   res.status(200).json({
  //     success: true,
  //     feedbacks: user.feedbacks || [],
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: "Error fetching user feedbacks",
  //     error,
  //   });
  // }
};

let getUserForums = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let forums = await Forum.find({ userId: id });

    res.status(200).json({
      success: true,
      forums: forums || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user forums", error });
  }
};

let getUserNotifications = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let notifications = await Notification.find({ userId: id });

    res.status(200).json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user notifications",
      error,
    });
  }
};

let getUserActivities = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let activities = await Activity.find({ userId: id });

    res.status(200).json({
      success: true,
      activities: activities || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user activities",
      error,
    });
  }
};

let editUserInfo = async (req, res) => {
  let { id } = req.params;
  let { firstName, lastName, email, dob, password, newPassword } = req.body;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (dob) user.dob = dob;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user information",
      error,
    });
  }
};

let deleteUser = async (req, res) => {
  let { id } = req.params;
  let { password } = req.body;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }


    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admins cannot delete their own accounts" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting user", error });
  }
};
// دالة جديدة لجلب جميع المعلمين
let getAllTeachers = async (req, res) => {
  try {
    // جلب جميع المستخدمين الذين دورهم "teacher"
    let teachers = await User.find({ role: "teacher" }).select("firstName lastName email _id");

    if (!teachers || teachers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No teachers found" });
    }

    res.status(200).json({
      success: true,
      teachers: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error,
    });
  }
};

let getPurchasedCourses = async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findById(id).populate({
      path: 'purchasedCourses',
      model: 'Course',
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, courses: user.purchasedCourses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching purchased courses', error });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getCoursesByUser,
  getUserFeedbacks,
  getUserForums,
  getUserNotifications,
  getUserActivities,
  editUserInfo,
  deleteUser,
  getAllTeachers,
  updateProfileImage,
  getStudentsCount,
  getTeachersCount,
  getPurchasedCourses
};