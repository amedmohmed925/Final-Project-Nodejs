// controllers/student/liveSessionsStudentController.js
const LiveSession = require('../../models/LiveSession');
const Course = require('../../models/Course');

// GET /api/v1/student/live-sessions
// Returns all live sessions for courses the student is enrolled in, including course name
exports.myLiveSessions = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    
    // Debug logging
    console.log('=== Student Live Sessions Debug ===');
    console.log('Student ID:', req.user.id);
    console.log('User role:', req.user.role);
    console.log('Query params:', { status, from, to });
    
    // Add no-cache headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Find courses this student purchased (enrolled in) via User.purchasedCourses
    const User = require('../../models/User');
    const currentUser = await User.findById(req.user.id).populate('purchasedCourses', '_id title teacherId');
    console.log('User purchased courses:', currentUser?.purchasedCourses?.length || 0);
    console.log('Purchased course details:', currentUser?.purchasedCourses?.map(c => ({ id: c._id, title: c.title })));
    
    const courseIds = currentUser?.purchasedCourses?.map(c => c._id) || [];
    
    // Also check alternative method (students array in Course)
    const coursesFromStudentsArray = await Course.find({ students: req.user.id }).select('_id title teacherId');
    console.log('Courses from students array:', coursesFromStudentsArray.length);
    console.log('Students array courses:', coursesFromStudentsArray.map(c => ({ id: c._id, title: c.title })));
    
    // Combine both methods to get all possible courses
    const allCourseIds = [...courseIds, ...coursesFromStudentsArray.map(c => c._id)];
    const uniqueCourseIds = [...new Set(allCourseIds.map(id => id.toString()))];
    console.log('Total unique course IDs:', uniqueCourseIds.length);
    
    if (!uniqueCourseIds.length) {
      console.log('No courses found for this student - student may not be enrolled in any courses');
      return res.json([]);
    }

    // Build filter for live sessions
    const filter = { courseId: { $in: uniqueCourseIds } };
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }

    console.log('LiveSession filter:', JSON.stringify(filter, null, 2));
    
    // Find all live sessions matching the filter
    const sessions = await LiveSession.find(filter)
      .populate('courseId', 'title')
      .populate('teacherId', 'firstName lastName username')
      .sort({ scheduledAt: -1 });

    console.log('Found sessions:', sessions.length);
    console.log('Sessions details:', sessions.map(s => ({ 
      id: s._id, 
      title: s.title, 
      courseId: s.courseId?._id,
      courseName: s.courseId?.title,
      status: s.status, 
      scheduledAt: s.scheduledAt 
    })));

    // shape: include courseName alongside session fields
    const result = sessions.map(s => ({
      _id: s._id,
      title: s.title,
      description: s.description,
      course: s.courseId ? { _id: s.courseId._id, title: s.courseId.title } : null,
      teacher: s.teacherId ? { 
        _id: s.teacherId._id, 
        name: `${s.teacherId.firstName} ${s.teacherId.lastName}`,
        username: s.teacherId.username 
      } : null,
      scheduledAt: s.scheduledAt,
      durationMinutes: s.durationMinutes,
      status: s.status,
      teacherId: s.teacherId,
      roomCode: s.roomCode,
      recordingUrl: s.recordingUrl,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    console.log('Final result:', result);
    res.json(result);
  } catch (err) {
    console.error('Error in myLiveSessions:', err);
    res.status(500).json({ message: err.message });
  }
};
