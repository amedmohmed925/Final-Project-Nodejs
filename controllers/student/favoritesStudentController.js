// controllers/student/favoritesStudentController.js
const Favorite = require('../../models/Favorite');
const Course = require('../../models/Course');

exports.listFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ user: userId }).populate('course');
    res.json(favorites.map(f => f.course));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const exists = await Favorite.findOne({ user: userId, course: courseId });
    if (exists) return res.status(409).json({ error: 'Already in favorites' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const favorite = new Favorite({ user: userId, course: courseId });
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
    const favorite = await Favorite.findOneAndDelete({ user: userId, course: courseId });
    if (!favorite) return res.status(404).json({ error: 'Not in favorites' });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
