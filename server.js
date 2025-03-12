require('dotenv').config(); // حط ده في أول حاجة

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require('./routes/courseRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/usersRoutes');
const feedbacksRoutes = require("./routes/feedbacksRoutes");
const answersRoutes = require("./routes/answersRoutes");
const forumRoutes = require("./routes/forumRoutes");
const groupRoutes = require("./routes/groupRoutes");
const quizRoutes = require("./routes/quizRoutes");
const courseProgressRoutes = require("./routes/courseProgressRoutes");

const connectDB = require("./config/db");
const cors = require("cors");
const swaggerDocs = require("./swagger/swagger");

const app = express();
app.use(express.json());
app.use(cors());

// تحقق من المتغيرات بعد التحميل
console.log('Env Check:', {
    port: process.env.PORT,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '[hidden]' : undefined,
});

// استخدام URI مختلف بناءً على البيئة
const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGO_URI;
connectDB(dbUri);

app.use("/auth", authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/questions', questionRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/answers", answersRoutes);
app.use("/forums", forumRoutes);
app.use("/groups", groupRoutes);
app.use("/quizzes", quizRoutes);
app.use("/course-progress", courseProgressRoutes);

swaggerDocs(app);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

module.exports = app;