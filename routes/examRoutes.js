const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken, isTeacher, isStudent } = require('../middleware/authMiddleware');

// ====== Teacher Routes ======
// إنشاء امتحان جديد
router.post('/teacher', authenticateToken, isTeacher, examController.createExam);
// إضافة سؤال للامتحان
router.post('/teacher/:examId/questions', authenticateToken, isTeacher, examController.addQuestion);
// جلب نتائج الطلاب في امتحان
router.get('/teacher/:examId/results', authenticateToken, isTeacher, examController.getExamResults);

// ====== Student Routes ======
// جلب الامتحانات المتاحة للطالب في كورس
router.get('/student', authenticateToken, isStudent, examController.getAvailableExamsForStudent);
// جلب أسئلة الامتحان للطالب
router.get('/student/:examId/questions', authenticateToken, isStudent, examController.getExamQuestionsForStudent);
// حل الامتحان
router.post('/student/:examId/submit', authenticateToken, isStudent, examController.submitExam);

module.exports = router;
