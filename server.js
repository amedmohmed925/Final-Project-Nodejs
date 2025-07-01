require('dotenv').config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require("./routes/paymentRoutes"); 
const communityRoutes = require("./routes/communityRoutes"); 
const categoryRoutes = require("./routes/categoryRoutes"); 
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerDocs = require("./swagger/swagger");
const User = require("./models/User");
const { getChatbotResponse } = require('./controllers/chatbotController'); // استيراد منطق الـ Chatbot
const pagesAdminRoutes = require('./routes/admin/pagesAdminRoutes');
const complaintsAdminRoutes = require('./routes/admin/complaintsAdminRoutes');
const logsAdminRoutes = require('./routes/admin/logsAdminRoutes');
const couponsAdminRoutes = require('./routes/admin/couponsAdminRoutes');
const statsAdminRoutes = require('./routes/admin/statsAdminRoutes');
const studentsTeacherRoutes = require('./routes/teacher/studentsTeacherRoutes');
const resourcesTeacherRoutes = require('./routes/teacher/resourcesTeacherRoutes');
const progressTeacherRoutes = require('./routes/teacher/progressTeacherRoutes');
const feedbackTeacherRoutes = require('./routes/teacher/feedbackTeacherRoutes');
const courseStatsTeacherRoutes = require('./routes/teacher/courseStatsTeacherRoutes');
const coursesStudentRoutes = require('./routes/student/coursesStudentRoutes');
const favoritesStudentRoutes = require('./routes/student/favoritesStudentRoutes');
const certificatesStudentRoutes = require('./routes/student/certificatesStudentRoutes');
const progressStudentRoutes = require('./routes/student/progressStudentRoutes');
const complaintsRoutes = require('./routes/complaintsRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const examRoutes = require('./routes/examRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

app.use("/v1/auth", authRoutes);
app.use('/v1/auth', googleAuthRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/courses', courseRoutes);
app.use('/v1/questions', questionRoutes);
app.use("/v1/feedbacks", feedbacksRoutes);
app.use("/v1/answers", answersRoutes);
app.use("/v1/forums", forumRoutes);
app.use("/v1/groups", groupRoutes);
app.use("/v1/quizzes", quizRoutes);
app.use("/v1/course-progress", courseProgressRoutes);
app.use('/v1/cart', cartRoutes);
app.use("/v1/coupons", couponRoutes);
app.use("/v1/payment", paymentRoutes);
app.use("/v1/community", communityRoutes);
app.use('/v1/categories', categoryRoutes);
app.use("/v1/notifications", notificationRoutes);
app.use('/v1/admin/pages', pagesAdminRoutes);
app.use('/v1/admin/users', require('./routes/admin/usersAdminRoutes'));
app.use('/v1/admin/complaints', complaintsAdminRoutes);
app.use('/v1/admin/logs', logsAdminRoutes);
app.use('/v1/admin/coupons', couponsAdminRoutes);
app.use('/v1/admin/stats', statsAdminRoutes);
app.use('/v1/teacher/students', studentsTeacherRoutes);
app.use('/v1/teacher/resources', resourcesTeacherRoutes);
app.use('/v1/teacher/progress', progressTeacherRoutes);
app.use('/v1/teacher/feedbacks', feedbackTeacherRoutes);
app.use('/v1/teacher/course-stats', courseStatsTeacherRoutes);
app.use('/v1/student/courses', coursesStudentRoutes);
app.use('/v1/student/favorites', favoritesStudentRoutes);
app.use('/v1/student/certificates', certificatesStudentRoutes);
app.use('/v1/student/progress', progressStudentRoutes);
app.use('/v1/complaints', complaintsRoutes);
app.use('/v1/exams', examRoutes);
app.use('/v1/admin/payments', require('./routes/admin/paymentsAdminRoutes'));
app.use('/v1/contact', require('./routes/contactRoutes'));
swaggerDocs(app);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  const user = await User.findById(socket.handshake.auth.userId).select("username profileImage");
  if (!user) return next(new Error("User not found"));
  socket.user = user;
  socket.userId = socket.handshake.auth.userId;
  next();
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const chatbotRoom = `chatbot_${socket.userId}`;
  socket.join(chatbotRoom);
  socket.join("liveChat");

  socket.on("joinRoom", async ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.emit("joinedRoom", { roomId });
  });

  let lastMessageTime = 0;
  socket.on("sendMessage", async ({ roomId, userId, content, username, profileImage }) => {
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      socket.emit("error", { message: "Slow down! Too many messages." });
      return;
    }
    lastMessageTime = now;

    const message = { userId, content, timestamp: new Date(), username, profileImage };
    io.to(roomId).emit("newMessage", { roomId, message });

    const ChatRoom = require("./models/chatRoomModel");
    const Group = require("./models/groupModel");
    if (roomId.startsWith("chatroom_")) {
      await ChatRoom.findByIdAndUpdate(roomId.replace("chatroom_", ""), {
        $push: { messages: message },
      });
    } else if (roomId.startsWith("group_")) {
      await Group.findByIdAndUpdate(roomId.replace("group_", ""), {
        $push: { chatMessages: message },
      });
    }
  });

  socket.on("chatbotMessage", async ({ content }) => {
    const botResponse = await getChatbotResponse(content);
    const botMessage = {
      userId: "chatbot",
      content: botResponse,
      timestamp: new Date(),
      username: "Chatbot",
      profileImage: "https://cdn.technologyadvice.com/wp-content/uploads/2018/02/friendly-chatbot.jpg"
    };
    io.to(chatbotRoom).emit("newMessage", { roomId: chatbotRoom, message: botMessage });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

module.exports = { app, io };