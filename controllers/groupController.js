const Group = require("../models/groupModel");
const mongoose = require("mongoose");


exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("createdBy", "username").populate("courseId", "name");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await Group.findById(id).populate("createdBy", "username").populate("courseId", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createGroup = async (req, res) => {
  try {
    const { createdBy, name, courseId } = req.body;

    if (!createdBy || !name || !courseId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGroup = new Group({ createdBy, name, courseId });
    await newGroup.save();

    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { name },
      { new: true } 
    ).populate("createdBy", "username").populate("courseId", "name");

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group updated successfully", group: updatedGroup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};