const Resource = require('../models/Resource');


exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ courseId: req.params.id });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};