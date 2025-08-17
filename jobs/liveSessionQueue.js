// jobs/liveSessionQueue.js
// Queue processors for live session reminders/start notifications (optional if REDIS_URL present)
const { createQueue } = require('../config/queue');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

const reminderQueue = createQueue('liveSession:reminder');
const startQueue = createQueue('liveSession:start');

async function enqueueLiveJobs(session) {
  if (!reminderQueue || !startQueue) return false;
  const scheduledAt = new Date(session.scheduledAt);
  const remindAt = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
  await reminderQueue.add({ sessionId: String(session._id) }, { delay: Math.max(0, remindAt - Date.now()) });
  await startQueue.add({ sessionId: String(session._id) }, { delay: Math.max(0, scheduledAt - Date.now()) });
  return true;
}

function startProcessors() {
  if (reminderQueue) {
    reminderQueue.process(async (job) => {
      const sessionId = job.data.sessionId;
      const session = await require('../models/LiveSession').findById(sessionId);
      if (!session) return;
      const course = await Course.findById(session.courseId).select('title students');
      const recipients = course?.students || [];
      if (recipients.length) {
        const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        const link = `${base}/live/${session._id}`;
        await Notification.create({
          title: 'تذكير جلسة مباشرة',
          message: `تذكير: ستبدأ جلسة مباشرة للكورس "${course.title}" في ${new Date(session.scheduledAt).toLocaleString()}\nرابط الجلسة: ${link}`,
          recipientType: 'students',
          recipients,
          sender: session.teacherId
        });
      }
    });
  }
  if (startQueue) {
    startQueue.process(async (job) => {
      const sessionId = job.data.sessionId;
      const session = await require('../models/LiveSession').findById(sessionId);
      if (!session) return;
      const course = await Course.findById(session.courseId).select('title students');
      const recipients = course?.students || [];
      if (recipients.length) {
        const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        const link = `${base}/live/${session._id}`;
        await Notification.create({
          title: 'بدأت الجلسة المباشرة',
          message: `بدأت الآن جلسة مباشرة للكورس "${course.title}"\nرابط الجلسة: ${link}`,
          recipientType: 'students',
          recipients,
          sender: session.teacherId
        });
      }
    });
  }
}

module.exports = { enqueueLiveJobs, startProcessors };
