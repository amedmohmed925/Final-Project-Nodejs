const express = require("express");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require('./routes/courseRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/usersRoutes')
const feedbacksRoutes = require("./routes/feedbacksRoutes");
const answersRoutes = require("./routes/answersRoutes");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerDocs = require("./swagger/auth");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();
connectDB();


app.use("/auth", authRoutes);
app.use('/users',userRoutes)
app.use('/courses', courseRoutes);
app.use('/questions', questionRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/answers", answersRoutes);


swaggerDocs(app);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

module.exports = app;
