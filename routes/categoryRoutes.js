const express = require('express');
const router = express.Router();
const { addCategory, getCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const {authenticateToken} = require('../middleware/authMiddleware');

router.post('/',authenticateToken, addCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id',authenticateToken, updateCategory);
router.delete('/:id',authenticateToken, deleteCategory);

module.exports = router;