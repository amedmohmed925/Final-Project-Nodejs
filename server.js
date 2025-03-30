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
app.use("/coupons", couponRoutes);
app.use("/payment", paymentRoutes);
app.use("/community", communityRoutes);
app.use('/categories', categoryRoutes);
app.use("/notifications", notificationRoutes);
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