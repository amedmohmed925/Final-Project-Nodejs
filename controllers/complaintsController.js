const Complaint = require('../models/Complaint');

// إضافة شكوى جديدة (طالب أو معلم)
exports.createComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'العنوان والنص مطلوبان' });
    }
    const complaint = new Complaint({
      subject,
      message,
      userId: req.user.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await complaint.save();
    res.status(201).json({ message: 'تم إرسال الشكوى بنجاح', complaint });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال الشكوى', error: err.message });
  }
};
