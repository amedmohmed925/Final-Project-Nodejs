// controllers/student/favoritesStudentController.js
const Favorite = require('../../models/Favorite');
const Course = require('../../models/Course');

exports.listFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId }).populate({
      path: 'courseId',
      // استثنِ فقط روابط الفيديوهات من الدروس وأيضًا students
      select: '-lessons.videoUrl -lessons.videos -videos -videoUrl -students',
    });
    // إزالة students يدويًا من الريسبونس (لضمان عدم ظهورها حتى لو populated)
    // احسب averageRating لكل كورس
    const Feedback = require('../../models/Feedback');
    const result = await Promise.all(favorites.map(async f => {
      if (!f.courseId) return f.courseId;
      const course = f.courseId.toObject ? f.courseId.toObject() : f.courseId;
      delete course.students;
      // إزالة videoUrl من كل درس داخل كل سيكشن
      if (Array.isArray(course.sections)) {
        course.sections.forEach(section => {
          if (Array.isArray(section.lessons)) {
            section.lessons.forEach(lesson => {
              delete lesson.videoUrl;
              delete lesson.videos;
            });
          }
        });
      }
      // حساب averageRating
      const feedbacks = await Feedback.find({ courseId: course._id });
      const averageRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
        : 0;
      course.averageRating = Number(averageRating.toFixed(1));
      return course;
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const exists = await Favorite.findOne({ userId, courseId });
    if (exists) return res.status(409).json({ error: 'Already in favorites' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const favorite = new Favorite({ userId, courseId });
    await favorite.save();
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const favorite = await Favorite.findOneAndDelete({ userId, courseId });
    if (!favorite) return res.status(404).json({ error: 'Not in favorites' });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
