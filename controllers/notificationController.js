// controllers/notificationController.js
const Notification = require("../models/Notification");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

const createNotification = async (req, res) => {
  const { title, message, recipientType } = req.body;
  const senderId = req.user.id;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can send notifications" });
    }

    let recipients = [];
    if (recipientType === "all") {
      recipients = await User.find().select("_id");
    } else if (["teachers", "students", "advertisers"].includes(recipientType)) {
      recipients = await User.find({ role: recipientType }).select("_id");
    } else {
      return res.status(400).json({ message: "Invalid recipient type" });
    }

    const notification = new Notification({
      title,
      message,
      recipientType,
      recipients: recipients.map((user) => user._id),
      sender: senderId,
    });
    await notification.save();

    const emailPromises = recipients.map(async (userId) => {
      try {
        const user = await User.findById(userId);
        if (!user || !user.email) return;
        const emailBody = `
          <h2>${title}</h2>
          <p>${message}</p>
          <p>From: Admin</p>
          <small>Sent at: ${new Date(notification.createdAt).toLocaleString()}</small>
        `;
        await mailSender(user.email, title, emailBody);
      } catch (emailError) {
        console.error(`Failed to send email to user ${userId}:`, emailError);
      }
    });

    await Promise.all(emailPromises);
    notification.emailSent = true;
    await notification.save();

    res.status(201).json({ message: "Notification sent successfully", notification });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Failed to send notification", error: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await Notification.find({ recipients: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findOne({ _id: notificationId, recipients: userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findOne({ _id: notificationId, recipients: userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    await Notification.deleteOne({ _id: notificationId, recipients: userId });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

module.exports = { createNotification, getUserNotifications, markNotificationAsRead, deleteNotification };