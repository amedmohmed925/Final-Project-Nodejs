const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;


    const progress = await CourseProgress.findOne({ userId, courseId }).populate({
      path: "courseId",
      select: "title sections",
      populate: {
        path: "sections.lessons",
        select: "title content thumbnailUrl quiz duration -videoUrl", 
      },
    });

    res.status(200).json({
      progress: progress || null,
      message: progress ? "Progress found" : "No progress yet",
    });
  } catch (error) {
    console.error("Get Progress Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve progress" });
  }
};
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

// جلب أول درس غير مكتمل للطالب في كورس معين (يبحث في كل دروس الكورس)
const getFirstUnwatchedLesson = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });
    const course = await Course.findById(courseId).lean();
    if (!course || !course.sections || course.sections.length === 0) {
      return res.json({ lesson: null });
    }
    const progress = await CourseProgress.findOne({ userId: req.user.id, courseId });
    // بناء خريطة للدروس المكتملة
    const completedMap = {};
    if (progress && progress.sections) {
      for (const section of progress.sections) {
        if (section.lessons) {
          for (const lesson of section.lessons) {
            if (lesson.completed) {
              completedMap[`${section.sectionIndex}_${lesson.lessonIndex}`] = true;
            }
          }
        }
      }
    }
    // ابحث عن أول درس غير مكتمل فعليًا
    for (let s = 0; s < course.sections.length; s++) {
      const section = course.sections[s];
      if (!section.lessons) continue;
      for (let l = 0; l < section.lessons.length; l++) {
        const lessonObj = section.lessons[l];
        const key = `${s}_${l}`;
        if (!completedMap[key]) {
          return res.json({ lesson: {
            sectionIndex: s,
            lessonIndex: l,
            title: lessonObj && lessonObj.title ? lessonObj.title : '',
            completed: false
          }});
        }
      }
    }
    // إذا أكمل كل الدروس
    return res.json({ lesson: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProgress, updateProgress, getAllProgress, getFirstUnwatchedLesson };