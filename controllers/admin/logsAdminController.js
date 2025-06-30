// controllers/admin/logsAdminController.js
const Log = require('../../models/Log');

exports.listLogs = async (req, res) => {
  try {
    const { search, userId, action, limit = 50 } = req.query;
    let filter = {};
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (search) filter.details = { $regex: search, $options: 'i' };
        const totalCount = await Log.countDocuments(filter); // احسب العدد الكلي

    const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({logs, totalCount});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Log.findById(id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Log.findByIdAndDelete(id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ message: 'All logs cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
