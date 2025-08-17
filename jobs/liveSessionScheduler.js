// jobs/liveSessionScheduler.js
const { enqueueLiveJobs } = require('./liveSessionQueue');
const { sendUsersNotification } = require('../utils/notify');
const Course = require('../models/Course');

const scheduledTimers = new Map();

function schedule(date, id, fn) {
  const delay = Math.max(0, date.getTime() - Date.now());
  if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));
  const t = setTimeout(async () => {
    try { await fn(); } catch (e) { console.error('Scheduled job error', e); }
    scheduledTimers.delete(id);
  }, delay);
  scheduledTimers.set(id, t);
}

async function scheduleLiveNotifications(session) {
  // Try queue first
  const queued = await enqueueLiveJobs(session).catch(() => false);
  if (queued) return;

  // Fallback to in-process
  const fireAnnouncement = async () => {
    const course = await Course.findById(session.courseId).select('title students');
    const recipients = course?.students || [];
    if (recipients.length) {
      const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
      const link = `${base}/live/${session._id}`;
      await sendUsersNotification({
        title: 'تذكير جلسة مباشرة',
        message: `تذكير: ستبدأ جلسة مباشرة للكورس "${course.title}" في ${new Date(session.scheduledAt).toLocaleString()}\nرابط الجلسة: ${link}`,
        recipients,
        sender: session.teacherId
      });
    }
  };

  const fireStart = async () => {
    const course = await Course.findById(session.courseId).select('title students');
    const recipients = course?.students || [];
    if (recipients.length) {
      const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
      const link = `${base}/live/${session._id}`;
      await sendUsersNotification({
        title: 'بدأت الجلسة المباشرة',
        message: `بدأت الآن جلسة مباشرة للكورس "${course.title}"\nرابط الجلسة: ${link}`,
        recipients,
        sender: session.teacherId
      });
    }
  };

  const scheduledAt = new Date(session.scheduledAt);
  const remindAt = new Date(scheduledAt.getTime() - 10 * 60 * 1000);

  schedule(remindAt, `live_reminder_${session._id}`, fireAnnouncement);
  schedule(scheduledAt, `live_start_${session._id}`, fireStart);
}

module.exports = { scheduleLiveNotifications };
