// controllers/student/certificatesStudentController.js
const Certificate = require('../../models/Certificate');

exports.listCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await Certificate.find({ user: userId });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const certificate = await Certificate.findOne({ _id: id, user: userId });
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
