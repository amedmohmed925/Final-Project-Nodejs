require('dotenv').config(); // تحميل المتغيرات البيئية

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const swaggerDocs = require("./swagger/swagger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/usersRoutes');
const courseRoutes = require('./routes/courseRoutes');
const questionRoutes = require('./routes/questionRoutes');
const feedbacksRoutes = require("./routes/feedbacksRoutes");
const answersRoutes = require("./routes/answersRoutes");
const forumRoutes = require("./routes/forumRoutes");
const groupRoutes = require("./routes/groupRoutes");
const quizRoutes = require("./routes/quizRoutes");
const courseProgressRoutes = require("./routes/courseProgressRoutes");
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhook"); 

const app = express();
app.use(express.json());
app.use(cors());

console.log('Env Check:', {
    port: process.env.PORT,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '[hidden]' : undefined,
});

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
app.use('/cart', cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhook", webhookRoutes); 

swaggerDocs(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
