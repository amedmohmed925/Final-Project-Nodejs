const Forum = require("../models/Forum");
const mongoose = require("mongoose");


const getAllForums = async (req, res) => {
  try {
    const forums = await Forum.find().populate("userId", "username"); 
    res.status(200).json(forums);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch forums", error: error.message });
  }
};


const getForumById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const forum = await Forum.findById(id).populate("userId", "username");

    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    res.status(200).json(forum);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch forum", error: error.message });
  }
};


const createForum = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newForum = new Forum({ userId, title, content });
    await newForum.save();

    res.status(201).json({ message: "Forum created successfully", forum: newForum });
  } catch (error) {
    res.status(500).json({ message: "Failed to create forum", error: error.message });
  }
};


const updateForum = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const updatedForum = await Forum.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedForum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    res.status(200).json({ message: "Forum updated successfully", forum: updatedForum });
  } catch (error) {
    res.status(500).json({ message: "Failed to update forum", error: error.message });
  }
};


const deleteForum = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const deletedForum = await Forum.findByIdAndDelete(id);

    if (!deletedForum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    res.status(200).json({ message: "Forum deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete forum", error: error.message });
  }
};

module.exports = {
  getAllForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
};