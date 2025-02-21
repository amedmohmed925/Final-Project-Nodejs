const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerDocs = require("./config/swagger");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();
connectDB();
app.use("/auth", authRoutes);

swaggerDocs(app);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

module.exports = app;
