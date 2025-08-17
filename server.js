require('dotenv').config();

const express = require("express");
const path = require('path');
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
const liveSessionsStudentRoutes = require('./routes/student/liveSessionsStudentRoutes');
const complaintsRoutes = require('./routes/complaintsRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const examRoutes = require('./routes/examRoutes');
const liveSessionRoutes = require('./routes/liveSessionRoutes');
const { setIO } = require('./utils/socket');
const LiveSession = require('./models/LiveSession');
const Course = require('./models/Course');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:  process.env.FRONTEND_URL || "*",
      credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

app.use(express.json());
app.use(cors());



const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGO_URI;
connectDB(dbUri);

app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/auth', googleAuthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use("/api/v1/feedbacks", feedbacksRoutes);
app.use("/api/v1/answers", answersRoutes);
app.use("/api/v1/forums", forumRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/course-progress", courseProgressRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/community", communityRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use('/api/v1/admin/pages', pagesAdminRoutes);
app.use('/api/v1/admin/users', require('./routes/admin/usersAdminRoutes'));
app.use('/api/v1/admin/complaints', complaintsAdminRoutes);
app.use('/api/v1/admin/logs', logsAdminRoutes);
app.use('/api/v1/admin/coupons', couponsAdminRoutes);
app.use('/api/v1/admin/stats', statsAdminRoutes);
app.use('/api/v1/teacher/students', studentsTeacherRoutes);
app.use('/api/v1/teacher/resources', resourcesTeacherRoutes);
app.use('/api/v1/teacher/progress', progressTeacherRoutes);
app.use('/api/v1/teacher/feedbacks', feedbackTeacherRoutes);
app.use('/api/v1/teacher/course-stats', courseStatsTeacherRoutes);
app.use('/api/v1/student/courses', coursesStudentRoutes);
app.use('/api/v1/student/favorites', favoritesStudentRoutes);
app.use('/api/v1/student/certificates', certificatesStudentRoutes);
app.use('/api/certificates', express.static(path.join(__dirname, 'public/certificates')));
app.use('/api/v1/student/progress', progressStudentRoutes);
app.use('/api/v1/student/live-sessions', liveSessionsStudentRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/admin/payments', require('./routes/admin/paymentsAdminRoutes'));
app.use('/api/v1/contact', require('./routes/contactRoutes'));
app.use('/api/v1/live-sessions', liveSessionRoutes);
app.use('/api/v1/debug', require('./routes/debugRoutes'));
swaggerDocs(app);

app.get('/test', (req, res) => {
  res.send('Test endpoint is working!');
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  const user = await User.findById(socket.handshake.auth.userId).select("username profileImage role");
  if (!user) return next(new Error("User not found"));
  socket.user = user;
  socket.userId = socket.handshake.auth.userId;
  socket.userRole = user.role;
  next();
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const chatbotRoom = `chatbot_${socket.userId}`;
  socket.join(chatbotRoom);
  socket.join("liveChat");

  // join user personal room for notifications
  if (socket.userId) {
    socket.join(`user_${socket.userId}`);
  }

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

  // Simple WebRTC signaling for live sessions (room-based)
  socket.on('live:join', async ({ sessionId }) => {
    try {
      if (!sessionId) return;
      const session = await LiveSession.findById(sessionId).select('courseId teacherId status scheduledAt');
      if (!session) return socket.emit('live:error', { message: 'Session not found' });
      // Admins can join any session
      if (socket.userRole === 'admin') {
        socket.join(`live_${sessionId}`);
        socket.to(`live_${sessionId}`).emit('live:peer-joined', { userId: socket.userId });
        return;
      }
      const course = await Course.findById(session.courseId).select('teacherId students');
      const isTeacher = String(course.teacherId) === String(socket.userId) || String(session.teacherId) === String(socket.userId);
      
      // Check if student via Course.students array
      const isStudentViaStudentsArray = (course.students || []).some(id => String(id) === String(socket.userId));
      
      // Check if student via User.purchasedCourses
      const currentUser = await User.findById(socket.userId).select('purchasedCourses');
      const isStudentViaPurchasedCourses = (currentUser?.purchasedCourses || []).some(id => String(id) === String(session.courseId));
      
      const isStudent = isStudentViaStudentsArray || isStudentViaPurchasedCourses;
      
      if (!isTeacher && !isStudent) {
        return socket.emit('live:error', { message: 'Not allowed' });
      }
      const room = `live_${sessionId}`;
      socket.join(room);
      socket.to(room).emit('live:peer-joined', { userId: socket.userId });
    } catch (e) {
      socket.emit('live:error', { message: 'Join failed' });
    }
  });
  socket.on('live:leave', ({ sessionId }) => {
    if (!sessionId) return;
    const room = `live_${sessionId}`;
    socket.leave(room);
    socket.to(room).emit('live:peer-left', { userId: socket.userId });
  });
  socket.on('live:offer', ({ sessionId, sdp, to }) => {
    if (!sessionId || !sdp) return;
    socket.to(`live_${sessionId}`).emit('live:offer', { from: socket.userId, sdp, to });
  });
  socket.on('live:answer', ({ sessionId, sdp, to }) => {
    if (!sessionId || !sdp) return;
    socket.to(`live_${sessionId}`).emit('live:answer', { from: socket.userId, sdp, to });
  });
  socket.on('live:ice', ({ sessionId, candidate, to }) => {
    if (!sessionId || !candidate) return;
    socket.to(`live_${sessionId}`).emit('live:ice', { from: socket.userId, candidate, to });
  });

  // Screen sharing events
  socket.on('live:screen-share-start', ({ sessionId }) => {
    if (!sessionId) return;
    socket.to(`live_${sessionId}`).emit('live:screen-share-started', { userId: socket.userId });
  });
  
  socket.on('live:screen-share-stop', ({ sessionId }) => {
    if (!sessionId) return;
    socket.to(`live_${sessionId}`).emit('live:screen-share-stopped', { userId: socket.userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

setIO(io);

// Start server with simple port fallback to avoid EADDRINUSE in dev
let currentPort = Number(process.env.PORT) || 8080;
function startServer(port) {
  server.listen(port, () => console.log(`Server running on port ${port}`));
}
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${currentPort} in use, trying ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(() => startServer(currentPort), 250);
  } else {
    console.error('Server error:', err);
  }
});
startServer(currentPort);

module.exports = app;