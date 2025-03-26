const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    console.log("User in getProgress:", req.user); // تسجيل إضافي
    const progress = await CourseProgress.findOne({ userId, courseId }).populate("courseId", "title sections");
    if (!progress) {
      return res.status(200).json({ message: "No progress yet", progress: null });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error("Get Progress Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve progress" });
  }
};

// تحديث تقدم الدورة
const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { sectionIndex, lessonIndex, completed } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // إذا لم يكن هناك تقدم بعد، أنشئ سجلًا جديدًا
    if (!progress) {
      progress = new CourseProgress({ userId, courseId, sections: [] });
    }

    // التحقق من صحة المؤشرات
    if (sectionIndex >= course.sections.length) {
      return res.status(400).json({ message: "Invalid section index" });
    }
    if (lessonIndex >= course.sections[sectionIndex].lessons.length) {
      return res.status(400).json({ message: "Invalid lesson index" });
    }

    // تحديث أو إضافة تقدم القسم
    let sectionProgress = progress.sections.find((s) => s.sectionIndex === sectionIndex);
    if (!sectionProgress) {
      sectionProgress = { sectionIndex, lessons: [] };
      progress.sections.push(sectionProgress);
    }

    // تحديث أو إضافة تقدم الدرس
    let lessonProgress = sectionProgress.lessons.find((l) => l.lessonIndex === lessonIndex);
    if (!lessonProgress) {
      lessonProgress = { lessonIndex, completed, completedAt: completed ? new Date() : null };
      sectionProgress.lessons.push(lessonProgress);
    } else {
      lessonProgress.completed = completed;
      lessonProgress.completedAt = completed ? new Date() : null;
    }

    // حساب نسبة الإكمال
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const completedLessons = progress.sections.reduce(
      (sum, section) => sum + section.lessons.filter((l) => l.completed).length,
      0
    );
    progress.completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    progress.lastUpdated = new Date();
    await progress.save();

    res.status(200).json({ message: "Progress updated", progress });
  } catch (error) {
    console.error("Update Progress Error:", error.message);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

// الحصول على تقدم جميع الدورات للمستخدم
const getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await CourseProgress.find({ userId }).populate("courseId", "title featuredImage");

    res.status(200).json(progress);
  } catch (error) {
    console.error("Get All Progress Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve all progress" });
  }
};

module.exports = { getProgress, updateProgress, getAllProgress };