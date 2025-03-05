const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Question routes
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.post('/', questionController.addQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;