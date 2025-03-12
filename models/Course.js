const mongoose = require('mongoose');
const Quiz = require('./Quiz'); // استيراد سكيما الكويز
const Resource = require('./Resource'); // استيراد سكيما الموارد


const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' }, // حقل جديد للصورة المصغرة
  quiz: { type: String, default: '' }, // عنوان الكويز لكل درس
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String },
  lessons: [lessonSchema],
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  tags: [{ type: String }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true, min: 0 },
  level: { type: String, enum: ['Beginner', 'Professional'], required: true },
  category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);