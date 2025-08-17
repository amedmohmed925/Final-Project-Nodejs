// utils/notify.js
const Notification = require('../models/Notification');
const { getIO } = require('./socket');

async function sendUsersNotification({ title, message, recipients, sender }) {
  if (!recipients || recipients.length === 0) return null;
  const notif = await Notification.create({
    title,
    message,
    recipientType: 'students',
    recipients,
    sender
  });
  const io = getIO();
  if (io) {
    recipients.forEach((uid) => io.to(`user_${uid}`).emit('notification', {
      _id: notif._id,
      title,
      message,
      createdAt: notif.createdAt
    }));
  }
  return notif;
}

module.exports = { sendUsersNotification };
