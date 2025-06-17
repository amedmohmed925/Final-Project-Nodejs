// controllers/admin/complaintsAdminController.js
const Complaint = require('../../models/Complaint');
const Joi = require('joi');

const statusSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'closed').required()
});

exports.listComplaints = async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = {};
    if (search) filter.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    if (status) filter.status = status;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = statusSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const complaint = await Complaint.findByIdAndUpdate(id, { status: value.status }, { new: true });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
