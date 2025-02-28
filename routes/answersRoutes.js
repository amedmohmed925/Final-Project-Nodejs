//answers routes
const express = require("express");
const router = express.Router();
const {getAllAnswers, getAnswerById, addAnswer, updateAnswer, deleteAnswer} = require("../controllers/answersController");

router.get("/", getAllAnswers);
router.get("/:_id",getAnswerById);
router.post("/add", addAnswer);
router.put("/update", updateAnswer);
router.delete("/delete", deleteAnswer);

module.exports = router;
