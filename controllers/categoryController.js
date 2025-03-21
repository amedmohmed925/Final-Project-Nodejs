const Category = require('../models/Category');

// إضافة كاتيجوري جديدة
const addCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'الكاتيجوري موجودة بالفعل' });
    }

    const newCategory = new Category({ name, description });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب جميع الكاتيجوريز
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب كاتيجوري معينة باستخدام الـ ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'الكاتيجوري غير موجودة' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تحديث كاتيجوري
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'الكاتيجوري غير موجودة' });
    }

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// حذف كاتيجوري
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'الكاتيجوري غير موجودة' });
    }

    await Category.deleteOne({ _id: id });
    res.status(200).json({ message: 'تم حذف الكاتيجوري بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};