const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');

// إنشاء امتحان جديد (للمعلم)
exports.createExam = async (req, res) => {
  try {
    const { courseId, title, duration, questions } = req.body;
    // تحقق أن المستخدم معلم وله الكورس
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your course' });
    // تحقق أن هناك أسئلة
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Exam must contain at least one question.' });
    }
    // أنشئ الامتحان بدون أسئلة أولاً
    const exam = await Exam.create({
      courseId,
      title,
      duration,
      createdBy: req.user.id,
      questions: []
    });
    // أضف الأسئلة
    for (const q of questions) {
      const { type, text, options, correctAnswer } = q;
      // أعد استخدام نفس التحقق من دالة addQuestion
      if (type === 'multiple_choice') {
        if (!options || options.length !== 4) {
          return res.status(400).json({ message: 'Each multiple choice question must have 4 options.' });
        }
        if (options.some(opt => !opt || !opt.trim())) {
          return res.status(400).json({ message: 'All options must be non-empty.' });
        }
        const uniqueOptions = new Set(options.map(opt => opt.trim()));
        if (uniqueOptions.size !== 4) {
          return res.status(400).json({ message: 'Options must be unique.' });
        }
        const normalizedOptions = options.map(opt => opt.trim().toLowerCase());
        if (!normalizedOptions.includes(correctAnswer.trim().toLowerCase())) {
          return res.status(400).json({ message: 'Correct answer must exactly match one of the options.' });
        }
      }
      if (type === 'true_false') {
        if (correctAnswer !== 'true' && correctAnswer !== 'false' && correctAnswer !== true && correctAnswer !== false) {
          return res.status(400).json({ message: 'Correct answer for true/false must be true or false.' });
        }
      }
      const question = await Question.create({
        examId: exam._id,
        type,
        text,
        options: type === 'multiple_choice' ? options : [],
        correctAnswer: type === 'true_false' ? String(correctAnswer) : correctAnswer.trim()
      });
      exam.questions.push(question._id);
    }
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إضافة سؤال للامتحان (للمعلم)
exports.addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const { type, text, options, correctAnswer } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    // تحقق أن المعلم هو صاحب الامتحان
    if (exam.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not your exam' });
    if (type === 'multiple_choice') {
      if (!options || options.length !== 4) {
        return res.status(400).json({ message: 'Multiple choice questions require 4 options.' });
      }
      // تحقق أن الخيارات ليست فارغة
      if (options.some(opt => !opt || !opt.trim())) {
        return res.status(400).json({ message: 'All options must be non-empty.' });
      }
      // تحقق أن الخيارات غير مكررة
      const uniqueOptions = new Set(options.map(opt => opt.trim()));
      if (uniqueOptions.size !== 4) {
        return res.status(400).json({ message: 'Options must be unique.' });
      }
      // تحقق أن correctAnswer هو نص أحد الخيارات (بدون حساسية حروف/مسافات)
      const normalizedOptions = options.map(opt => opt.trim().toLowerCase());
      if (!normalizedOptions.includes(correctAnswer.trim().toLowerCase())) {
        return res.status(400).json({ message: 'Correct answer must exactly match one of the options.' });
      }
    }
    if (type === 'true_false') {
      if (correctAnswer !== 'true' && correctAnswer !== 'false' && correctAnswer !== true && correctAnswer !== false) {
        return res.status(400).json({ message: 'Correct answer for true/false must be true or false.' });
      }
    }
    const question = await Question.create({
      examId,
      type,
      text,
      options: type === 'multiple_choice' ? options : [],
      correctAnswer: type === 'true_false' ? String(correctAnswer) : correctAnswer.trim()
    });
    exam.questions.push(question._id);
    await exam.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب الامتحانات المتاحة للطالب في كورس (بعد إنهاء الكورس)
exports.getAvailableExamsForStudent = async (req, res) => {
  try {
    const { courseId } = req.query;
    // تحقق من تقدم الطالب في الكورس
    const progress = await CourseProgress.findOne({ userId: req.user.id, courseId });
    if (!progress || progress.completionPercentage < 100) {
      return res.status(403).json({ message: 'You must complete the course to access the exam.' });
    }
    const exams = await Exam.find({ courseId }).select('-questions');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب أسئلة الامتحان (بدون الإجابات الصحيحة)
exports.getExamQuestionsForStudent = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    // إخفاء correctAnswer
    const questions = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      text: q.text,
      options: q.options
    }));
    res.json({ examId, title: exam.title, duration: exam.duration, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// حل الامتحان وتخزين الدرجة (للطلاب)
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // [{questionId, answer}]
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    // تحقق من تقدم الطالب في الكورس
    const progress = await CourseProgress.findOne({ userId: req.user.id, courseId: exam.courseId });
    if (!progress || progress.completionPercentage < 100) {
      return res.status(403).json({ message: 'You must complete the course to submit the exam.' });
    }
    // تحقق أن الطالب لم يرسل من قبل
    const prev = await Submission.findOne({ userId: req.user.id, examId });
    if (prev) return res.status(400).json({ message: 'You have already submitted this exam' });
    // حساب الدرجة
    let score = 0;
    exam.questions.forEach(q => {
      const ans = answers.find(a => a.questionId == q._id.toString());
      if (!ans) return;
      if (q.type === 'true_false' && ans.answer === q.correctAnswer) score++;
      if (q.type === 'multiple_choice' && ans.answer === q.correctAnswer) score++;
    });
    const submission = await Submission.create({
      userId: req.user.id,
      examId,
      answers,
      score
    });
    res.status(201).json({ score, total: exam.questions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب نتائج الطلاب في امتحان (للمعلم)
exports.getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    // تحقق أن المعلم هو صاحب الامتحان
    if (exam.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not your exam' });
    const results = await Submission.find({ examId }).populate('userId', 'firstName lastName email');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

