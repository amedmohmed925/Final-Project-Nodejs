const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dotenv = require('dotenv');
const connectDB = require('./config/db');
require("dotenv").config();


const app = express();
app.use(express.json());

dotenv.config();
connectDB();
app.use("/auth", authRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
