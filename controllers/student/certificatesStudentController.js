const path = require('path');

const Certificate = require('../../models/Certificate');
const generateCertificatePdf = require('../../utils/generateCertificatePdf');

exports.createCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }
    // تحقق أن الطالب أنهى الكورس (completionPercentage = 100%)
    const CourseProgress = require('../../models/CourseProgress');
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress || progress.completionPercentage < 100) {
      return res.status(403).json({ error: 'You must complete the course to get a certificate' });
    }

    // تحقق هل يوجد امتحان نهائي للكورس
    const Exam = require('../../models/Exam');
    const exam = await Exam.findOne({ courseId });
    if (exam) {
      // يوجد امتحان: تحقق أن الطالب نجح في الامتحان
      const Submission = require('../../models/Submission');
      const submission = await Submission.findOne({ userId, examId: exam._id });
      if (!submission) {
        return res.status(403).json({ error: 'You must pass the final exam to get a certificate' });
      }
      // احسب درجة النجاح (60%)
      const passingScore = Math.ceil((exam.questions.length || 1) * 0.6);
      if (submission.score < passingScore) {
        return res.status(403).json({ error: 'You must pass the final exam to get a certificate' });
      }
    }

    // تحقق أن الطالب لم يحصل على شهادة لنفس الكورس من قبل
    const exists = await Certificate.findOne({ userId, courseId });
    if (exists) {
      return res.status(409).json({ error: 'Certificate already exists for this course' });
    }
    // جلب اسم المستخدم واسم الكورس
    const User = require('../../models/User');
    const Course = require('../../models/Course');
    const user = await User.findById(userId).select('firstName lastName');
    const course = await Course.findById(courseId).select('title');
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';
    const courseTitle = course ? course.title : '';

    // تأكد من وجود مجلد الشهادات
    const fs = require('fs');
    const certDir = path.join(__dirname, '../../public/certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }
    // توليد ملف الشهادة PDF
    const certFileName = `certificate_${userId}_${courseId}_${Date.now()}.pdf`;
    const certPath = path.join(certDir, certFileName);
    await generateCertificatePdf({
      studentName: fullName,
      courseTitle: courseTitle,
      outputPath: certPath,
    });
    const fileUrl = `/certificates/${certFileName}`;

    const certificate = await Certificate.create({
      userId,
      courseId,
      fileUrl,
      issuedAt: new Date(),
    });

    // إرجاع بيانات الشهادة مع اسم المستخدم واسم الكورس
    res.status(201).json({
      ...certificate.toObject(),
      userFullName: fullName,
      courseTitle: courseTitle
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/student/certificatesStudentController.js

exports.listCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await Certificate.find({ userId });
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
