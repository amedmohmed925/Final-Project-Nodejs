// Debug script to check live sessions data
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const LiveSession = require('./models/LiveSession');
const User = require('./models/User');

async function debugLiveSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check total counts
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalSessions = await LiveSession.countDocuments();
    
    console.log('\n=== Total Counts ===');
    console.log('Users:', totalUsers);
    console.log('Courses:', totalCourses);
    console.log('Live Sessions:', totalSessions);

    // Check students
    const students = await User.find({ role: 'student' }).select('_id username email');
    console.log('\n=== Students ===');
    console.log('Students count:', students.length);
    students.forEach(s => console.log(`- ${s.username} (${s._id})`));

    // Check courses with students
    const coursesWithStudents = await Course.find({ students: { $exists: true, $ne: [] } })
      .populate('students', 'username')
      .select('title students');
    console.log('\n=== Courses with Students ===');
    coursesWithStudents.forEach(c => {
      console.log(`Course: ${c.title}`);
      c.students.forEach(s => console.log(`  - Student: ${s.username} (${s._id})`));
    });

    // Check live sessions
    const sessions = await LiveSession.find({})
      .populate('courseId', 'title')
      .select('title courseId status scheduledAt');
    console.log('\n=== Live Sessions ===');
    sessions.forEach(s => {
      console.log(`Session: ${s.title} - Course: ${s.courseId?.title} - Status: ${s.status} - Scheduled: ${s.scheduledAt}`);
    });

    // Test specific student
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`\n=== Testing Student: ${testStudent.username} ===`);
      
      const studentCourses = await Course.find({ students: testStudent._id }).select('_id title');
      console.log('Student enrolled in courses:', studentCourses.length);
      studentCourses.forEach(c => console.log(`- ${c.title} (${c._id})`));
      
      const courseIds = studentCourses.map(c => c._id);
      const studentSessions = await LiveSession.find({ courseId: { $in: courseIds } })
        .populate('courseId', 'title');
      console.log('Student accessible sessions:', studentSessions.length);
      studentSessions.forEach(s => console.log(`- ${s.title} - ${s.courseId?.title} - ${s.status}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugLiveSessions();
