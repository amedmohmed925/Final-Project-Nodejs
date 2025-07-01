const Certificate = require('../../models/Certificate');
// إنشاء شهادة جديدة للطالب بعد إنهاء الكورس
exports.createCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, fileUrl } = req.body;
    if (!courseId || !fileUrl) {
      return res.status(400).json({ error: 'courseId and fileUrl are required' });
    }
    // تحقق إذا كان الطالب أنهى الكورس (يمكنك إضافة منطق تحقق هنا)
    // مثال: تحقق أن الطالب لم يحصل على شهادة لنفس الكورس من قبل
    const exists = await Certificate.findOne({ userId, courseId });
    if (exists) {
      return res.status(409).json({ error: 'Certificate already exists for this course' });
    }
    const certificate = await Certificate.create({
      userId,
      courseId,
      fileUrl,
      issuedAt: new Date(),
    });
    res.status(201).json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/student/certificatesStudentController.js

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
