const Group = require('../models/Group');


exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ courseId: req.params.id });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};