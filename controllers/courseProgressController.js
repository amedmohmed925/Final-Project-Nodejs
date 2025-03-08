const CourseProgress = require("../models/CourseProgress");
const mongoose = require("mongoose");


exports.getAllCourseProgresses = async (req, res) => {
  try {
    const progresses = await CourseProgress.find()
      .populate("userId", "username")
      .populate("courseId", "title")
      .populate("lessonId", "title");
    res.status(200).json(progresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId, lessonId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const progress = await CourseProgress.findOne({
      courseId,
      lessonId,
      userId,
    })
      .populate("userId", "username")
      .populate("courseId", "title")
      .populate("lessonId", "title");

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createCourseProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonId, completed, progressPercentage, lastAccessedAt } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ message: "userId, courseId, and lessonId are required" });
    }

    const newProgress = new CourseProgress({
      userId,
      courseId,
      lessonId,
      completed,
      progressPercentage,
      lastAccessedAt,
    });
    await newProgress.save();

    res.status(201).json({ message: "Course progress created successfully", progress: newProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId, lessonId, userId } = req.params;
    const { completed, progressPercentage, lastAccessedAt } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const updatedProgress = await CourseProgress.findOneAndUpdate(
      { courseId, lessonId, userId },
      { completed, progressPercentage, lastAccessedAt },
      { new: true } // لإرجاع النسخة المحدثة
    )
      .populate("userId", "username")
      .populate("courseId", "title")
      .populate("lessonId", "title");

    if (!updatedProgress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.status(200).json({ message: "Course progress updated successfully", progress: updatedProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const deletedProgress = await CourseProgress.deleteMany({ courseId });

    if (!deletedProgress.deletedCount) {
      return res.status(404).json({ message: "No progress found for this course" });
    }

    res.status(200).json({ message: "Course progress deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};