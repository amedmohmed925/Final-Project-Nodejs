//server
const express = require("express");
const feedbacksRoutes = require("./routes/feedbacksRoutes");
const answersRoutes = require("./routes/answersRoutes");
const { connectdb } = require("./config/connDB")
require("dotenv").config();

const app = express();
app.use(express.json());


connectdb().then(() => {
  console.log('connectdb.....')
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch((err) => {
  console.log('error.....', err)
})


app.use("/feedbacks", feedbacksRoutes);
app.use("/answers", answersRoutes);

