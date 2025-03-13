const mongoose = require('mongoose');
const Quiz = require('./Quiz'); // استيراد سكيما الكويز
const Resource = require('./Resource'); // استيراد سكيما الموارد

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  quiz: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // عنوان القسم مثل "HTML Heading"
  lessons: [lessonSchema], // قائمة الحلقات داخل القسم
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String },
  sections: [sectionSchema], // الأقسام تحل محل الحلقات المباشرة
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  tags: [{ type: String }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true, min: 0 },
  level: { type: String, enum: ['Beginner', 'Professional'], required: true },
  category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);