// models/Course.js
const mongoose = require('mongoose');
const Quiz = require('./Quiz'); // Assuming this exists
const Resource = require('./Resource'); // Assuming this exists

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  quiz: { type: String, default: '' },
  duration: { type: Number, default: 0 },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String },
  sections: [sectionSchema],
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  tags: [{ type: String }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true, min: 0 },
  level: { type: String, enum: ['Beginner', 'Professional'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  whatYouWillLearn: [{ type: String }], 
  requirements: [{ type: String }], 
  targetAudience: [{ type: String }],
  views: { type: Number, default: 0 }, // حقل جديد لعدد المشاهدات
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: false }, // حالة الموافقة من الأدمن
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);