const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
});

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'pdf'], required: true },
  url: { type: String, required: true },
});

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// models/Course.js

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String }, // رابط الصورة من Cloudinary
  lessons: [
    {
      title: { type: String },
      videoUrl: { type: String }, // رابط الفيديو من Cloudinary
    },
  ],
  quizzes: [{ type: String }],
  resources: [{ type: String }],
  tags: [{ type: String }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});


module.exports = mongoose.model("Course", courseSchema);
