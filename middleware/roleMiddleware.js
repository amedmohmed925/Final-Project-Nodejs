// middleware/roleMiddleware.js
// Middleware للتحقق من صلاحيات الدور

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only' });
}

function isTeacher(req, res, next) {
  if (req.user && req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ message: 'Teachers only' });
}

function isStudent(req, res, next) {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Students only' });
}

module.exports = { isAdmin, isTeacher, isStudent };
