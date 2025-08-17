// controllers/liveSessionController.js
const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Joi = require('joi');
const { scheduleLiveNotifications } = require('../jobs/liveSessionScheduler');
const { sendUsersNotification } = require('../utils/notify');

// Helper to build a join link for the live session (frontend route assumed as /live/:id)
function buildLiveSessionLink(session) {
  const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const id = session?._id || session;
  return `${base}/live/${id}`;
}

const createSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  courseId: Joi.string().required(),
  scheduledAt: Joi.date().iso().required(),
  durationMinutes: Joi.number().integer().min(15).max(480).default(60)
});

exports.create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // verify teacher owns course (teachers only; no admin bypass for creation)
    const course = await Course.findById(value.courseId).select('teacherId title students');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (String(course.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not course owner' });
    }

    const roomCode = `live_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const session = await LiveSession.create({
      title: value.title,
      description: value.description,
      courseId: value.courseId,
      teacherId: req.user.id,
      scheduledAt: value.scheduledAt,
      durationMinutes: value.durationMinutes,
      roomCode
    });

    // immediate notify students about schedule (with join link)
    const recipients = course.students || [];
    if (recipients.length) {
      const link = buildLiveSessionLink(session);
      const message = `تم تحديد جلسة مباشرة للكورس "${course.title}" بتاريخ ${new Date(value.scheduledAt).toLocaleString()}\nرابط الجلسة: ${link}`;
      await sendUsersNotification({
        title: 'موعد جلسة مباشرة',
        message,
        recipients,
        sender: req.user.id
      });
    }

    // schedule reminders and start notification
    await scheduleLiveNotifications(session);

    res.status(201).json(session);
  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    // owner check
    if (String(session.teacherId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const payload = {};
    ['title','description','scheduledAt','durationMinutes','status','recordingUrl'].forEach(k=>{
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    });

    Object.assign(session, payload);
    await session.save();

    // reschedule if time changed
    if (payload.scheduledAt) {
      const { scheduleLiveNotifications } = require('../jobs/liveSessionScheduler');
      await scheduleLiveNotifications(session);
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id).populate('courseId','title students');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (String(session.teacherId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    session.status = 'canceled';
    await session.save();

    // notify students cancellation
    const recipients = session.courseId.students || [];
    if (recipients.length) {
      const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
      const link = `${base}/live/${session._id}`;
      await sendUsersNotification({
        title: 'تم إلغاء الجلسة المباشرة',
        message: `تم إلغاء الجلسة المباشرة للكورس "${session.courseId.title}"\nرابط الجلسة (للمراجعة): ${link}`,
        recipients,
        sender: req.user.id
      });
    }

    res.json({ message: 'Canceled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { courseId, status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);

    // Role-based scoping
    if (req.user.role === 'admin') {
      if (courseId) filter.courseId = courseId;
    } else if (req.user.role === 'teacher') {
      // teacher: only sessions where he is the owner
      const myCourses = await Course.find({ teacherId: req.user.id }).select('_id');
      const ids = myCourses.map(c => c._id);
      filter.courseId = courseId ? courseId : { $in: ids };
    } else {
      // student: only sessions for courses he is enrolled in
      const asStudent = await Course.find({ students: req.user.id }).select('_id');
      const ids = asStudent.map(c => c._id);
      filter.courseId = courseId ? courseId : { $in: ids };
    }

    // Populate courseId with title and featuredImage
    const sessions = await LiveSession.find(filter)
      .sort({ scheduledAt: -1 })
      .populate('courseId', 'title featuredImage');

    // Format response: replace courseId with course object (id, title, featuredImage)
    const result = sessions.map(session => {
      const s = session.toObject();
      if (s.courseId && typeof s.courseId === 'object') {
        s.course = {
          _id: s.courseId._id,
          title: s.courseId.title,
          featuredImage: s.courseId.featuredImage || null
        };
        delete s.courseId;
      }
      return s;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'admin') {
      const course = await Course.findById(session.courseId).select('teacherId students');
      const isTeacher = String(course.teacherId) === String(req.user.id) || String(session.teacherId) === String(req.user.id);
      
      // Check if student via Course.students array
      const isStudentViaStudentsArray = (course.students || []).some(id => String(id) === String(req.user.id));
      
      // Check if student via User.purchasedCourses
      const User = require('../models/User');
      const currentUser = await User.findById(req.user.id).select('purchasedCourses');
      const isStudentViaPurchasedCourses = (currentUser?.purchasedCourses || []).some(id => String(id) === String(session.courseId));
      
      const isStudent = isStudentViaStudentsArray || isStudentViaPurchasedCourses;
      
      if (!isTeacher && !isStudent) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.start = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('courseId','title students');
    if (!session) return res.status(404).json({ message: 'Not found' });
    if (String(session.teacherId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    session.status = 'live';
    await session.save();

    // notify start
    const recipients = session.courseId.students || [];
    if (recipients.length) {
      const link = buildLiveSessionLink(session);
      await sendUsersNotification({
        title: 'بدأت الجلسة المباشرة',
        message: `بدأت الآن جلسة مباشرة للكورس "${session.courseId.title}"\nرابط الجلسة: ${link}`,
        recipients,
        sender: req.user.id
      });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.end = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('courseId','title students');
    if (!session) return res.status(404).json({ message: 'Not found' });
    if (String(session.teacherId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    session.status = 'ended';
    await session.save();

    // notify end
    const recipients = session.courseId.students || [];
    if (recipients.length) {
      await sendUsersNotification({
        title: 'انتهت الجلسة المباشرة',
        message: `انتهت الجلسة المباشرة للكورس "${session.courseId.title}"`,
        recipients,
        sender: req.user.id
      });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIceServers = async (req, res) => {
  try {
    const raw = process.env.WEBRTC_ICE_SERVERS_JSON;
    let iceServers;
    try {
      iceServers = raw ? JSON.parse(raw) : [{ urls: 'stun:stun.l.google.com:19302' }];
    } catch (e) {
      iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    }
    return res.json({ iceServers });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
