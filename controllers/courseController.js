const Course = require('../models/Course');
const Resource = require('../models/Resource');
const cloudinary = require('../cloudinaryConfig');
const Category = require('../models/Category');
const mailSender = require('../utils/mailSender'); 
const Feedback = require('../models/Feedback')
const fs = require('fs');

exports.addCourse = async (req, res) => {
  const { 
    title, description, price, level, category, sections, resources, tags, 
    whatYouWillLearn, requirements, targetAudience 
  } = req.body;
  const teacherId = req.user.id;

  try {
    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    const lessonThumbnails = req.files && req.files.lessonThumbnails ? req.files.lessonThumbnails : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: 'Maximum 30 lesson videos allowed' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    let featuredImageUrl = '';
    if (req.files && req.files.featuredImage) {
      const featuredImage = req.files.featuredImage[0];
      const result = await cloudinary.uploader.upload(featuredImage.path, {
        folder: 'courses/featured_images',
        resource_type: 'image',
      });
      featuredImageUrl = result.secure_url;
      if (fs.existsSync(featuredImage.path)) fs.unlinkSync(featuredImage.path);
    }

    let parsedSections = [];
    if (sections) {
      if (Array.isArray(sections)) {
        parsedSections = sections.map((section) => {
          try {
            return JSON.parse(section);
          } catch (e) {
            return { title: '', lessons: [] };
          }
        });
      } else {
        try {
          parsedSections = JSON.parse(sections);
          if (!Array.isArray(parsedSections)) parsedSections = [parsedSections];
        } catch (e) {
          parsedSections = [];
        }
      }
    }

    let videoIndex = 0;
    let thumbIndex = 0;
    const sectionsWithFiles = parsedSections.map((section) => ({
      title: section.title,
      lessons: section.lessons.map((lesson) => {
        const lessonData = {
          ...lesson,
          videoUrl: lessonVideos[videoIndex] ? `pending:${lessonVideos[videoIndex].filename}` : lesson.videoUrl || '',
          thumbnailUrl: lessonThumbnails[thumbIndex] ? `pending:${lessonThumbnails[thumbIndex].filename}` : lesson.thumbnailUrl || '',
          duration: lesson.duration || 0,
        };
        if (lessonVideos[videoIndex]) videoIndex++;
        if (lessonThumbnails[thumbIndex]) thumbIndex++;
        return lessonData;
      }),
    }));

    const newCourse = new Course({
      title,
      description,
      featuredImage: featuredImageUrl,
      sections: sectionsWithFiles,
      resources: [],
      tags: tags ? JSON.parse(tags) : [],
      teacherId,
      price: parseFloat(price),
      level,
      category,
      whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [],
      requirements: requirements ? JSON.parse(requirements) : [],
      targetAudience: targetAudience ? JSON.parse(targetAudience) : [],
    });

    await newCourse.save();

    const parsedResources = resources ? JSON.parse(resources) : [];
    const resourceIds = await Promise.all(
      parsedResources.map(async (resource) => {
        const newResource = new Resource({
          ...resource,
          courseId: newCourse._id,
        });
        await newResource.save();
        return newResource._id;
      })
    );

    newCourse.resources = resourceIds;
    await newCourse.save();

    res.status(201).json({
      ...newCourse._doc,
      message: 'Course created successfully, videos and thumbnails are being uploaded in the background',
    });

    // رفع الملفات باستخدام Promise.all
    if (lessonVideos.length > 0 || lessonThumbnails.length > 0) {
      const uploadPromises = [];
      let videoIdx = 0;
      let thumbIdx = 0;

      sectionsWithFiles.forEach((section, sectionIndex) => {
        section.lessons.forEach((lesson, lessonIndex) => {
          if (lesson.videoUrl.startsWith('pending:')) {
            uploadPromises.push(
              cloudinary.uploader.upload(lessonVideos[videoIdx].path, {
                folder: 'courses/lesson_videos',
                resource_type: 'video',
                chunk_size: 6000000,
              }).then(videoResult => {
                newCourse.sections[sectionIndex].lessons[lessonIndex].videoUrl = videoResult.secure_url;
                newCourse.sections[sectionIndex].lessons[lessonIndex].duration = Number((videoResult.duration / 60).toFixed(1)); // المدة بالدقائق من Cloudinary
                if (fs.existsSync(lessonVideos[videoIdx].path)) fs.unlinkSync(lessonVideos[videoIdx].path);
                videoIdx++;
              }).catch(uploadErr => {
                console.log(`Failed to upload video for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
              })
            );
          }

          if (lesson.thumbnailUrl.startsWith('pending:')) {
            uploadPromises.push(
              cloudinary.uploader.upload(lessonThumbnails[thumbIdx].path, {
                folder: 'courses/lesson_thumbnails',
                resource_type: 'image',
              }).then(thumbResult => {
                newCourse.sections[sectionIndex].lessons[lessonIndex].thumbnailUrl = thumbResult.secure_url;
                if (fs.existsSync(lessonThumbnails[thumbIdx].path)) fs.unlinkSync(lessonThumbnails[thumbIdx].path);
                thumbIdx++;
              }).catch(uploadErr => {
                console.log(`Failed to upload thumbnail for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
              })
            );
          }
        });
      });

      await Promise.all(uploadPromises);
      await newCourse.save(); 

      const teacher = await User.findById(teacherId);
      if (teacher && teacher.email && teacher.role === 'teacher') {
        const emailTitle = 'Your Course is Ready!';
        const emailBody = `
          <h1>Congratulations, ${teacher.firstName} ${teacher.lastName}!</h1>
          <p>Your course "<strong>${title}</strong>" has been successfully uploaded and is now ready.</p>
          <p>You can now share it with your students or review it in your dashboard.</p>
          <p>Best regards,<br>The Courses Team</p>
        `;
        await mailSender(teacher.email, emailTitle, emailBody);
      } else {
        console.log('Teacher not found or not a valid teacher');
      }
    }
    
  } catch (err) {
    console.log('Error in addCourse:', err);
    if (req.files) {
      if (req.files.featuredImage && fs.existsSync(req.files.featuredImage[0]?.path)) {
        fs.unlinkSync(req.files.featuredImage[0].path);
      }
      if (req.files.lessonVideos) {
        req.files.lessonVideos.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      if (req.files.lessonThumbnails) {
        req.files.lessonThumbnails.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 1. Endpoint to get course preview data with average rating
exports.getCoursePreview = async (req, res) => {
  try {
    const courses = await Course.find()
      .select('title description featuredImage price level category sections')
      .populate('category', 'name');

    const coursesWithRatings = await Promise.all(
      courses.map(async (course) => {
        const feedbacks = await Feedback.find({ courseId: course._id });
        const averageRating = feedbacks.length > 0 
          ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
          : 0;

        const totalMinutes = course.sections.reduce((sum, section) => {
          return sum + section.lessons.reduce((lessonSum, lesson) => {
            return lessonSum + (lesson.duration || 0);
          }, 0);
        }, 0);
        const totalHours = Number((totalMinutes / 60).toFixed(1));

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          featuredImage: course.featuredImage,
          price: course.price,
          level: course.level,
          category: course.category ? course.category.name : "غير مصنف",
          averageRating: Number(averageRating.toFixed(1)),
          totalHours,
        };
      })
    );

    res.status(200).json(coursesWithRatings);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المعاينة: ' + err.message });
  }
};

// Alternative version for single course preview
exports.getCoursePreviewById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .select('title description featuredImage price level sections');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const feedbacks = await Feedback.find({ courseId: course._id });
    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
      : 0;

    const totalMinutes = course.sections.reduce((sum, section) => {
      return sum + section.lessons.reduce((lessonSum, lesson) => {
        return lessonSum + (lesson.duration || 0);
      }, 0);
    }, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    const coursePreview = {
      _id: course._id,
      title: course.title,
      description: course.description,
      featuredImage: course.featuredImage,
      price: course.price,
      level: course.level,
      averageRating: Number(averageRating.toFixed(1)),
      totalHours,
    };

    res.status(200).json(coursePreview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Endpoint to get course details without video URLs
exports.getCourseDetailsWithoutVideos = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('resources', '-courseId')
      .populate('category', 'name')
      .populate('teacherId', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const feedbacks = await Feedback.find({ courseId: course._id });
    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
      : 0;

    const totalMinutes = course.sections.reduce((sum, section) => {
      return sum + section.lessons.reduce((lessonSum, lesson) => {
        return lessonSum + (lesson.duration || 0);
      }, 0);
    }, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    const sectionsWithoutVideos = course.sections.map(section => ({
      title: section.title,
      lessons: section.lessons.map(lesson => ({
        title: lesson.title,
        content: lesson.content,
        thumbnailUrl: lesson.thumbnailUrl,
        quiz: lesson.quiz || '',
        duration: lesson.duration || 0, // عدد الدقائق لكل حلقة
      })),
    }));

    const courseDetails = {
      _id: course._id,
      title: course.title,
      description: course.description,
      featuredImage: course.featuredImage,
      sections: sectionsWithoutVideos,
      resources: course.resources,
      tags: course.tags,
      teacherId: course.teacherId,
      price: course.price,
      level: course.level,
      category: course.category ? course.category.name : 'غير مصنف',
      whatYouWillLearn: course.whatYouWillLearn,
      requirements: course.requirements,
      targetAudience: course.targetAudience,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      averageRating: Number(averageRating.toFixed(1)),
      totalHours, // عدد الساعات للكورس
    };

    res.status(200).json(courseDetails);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب تفاصيل الكورس: ' + err.message });
  }
};

// في courseController.js
// exports.getCoursePreview = async (req, res) => {
//   try {
//     const courses = await Course.find()
//       .select('title description featuredImage price level category') // أضفت category إلى الـ select
//       .populate('category', 'name'); // جلب اسم الفئة فقط

//     // تحويل الكورسات مع إضافة متوسط التقييم
//     const coursesWithRatings = await Promise.all(
//       courses.map(async (course) => {
//         const feedbacks = await Feedback.find({ courseId: course._id }); // تصحيح من course.id إلى course._id
//         const averageRating = feedbacks.length > 0 
//           ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
//           : 0;
        
//         return {
//           _id: course._id, // تصحيح من course.id إلى course._id
//           title: course.title,
//           description: course.description,
//           featuredImage: course.featuredImage,
//           price: course.price,
//           level: course.level,
//           category: course.category ? course.category.name : "غير مصنف", // اسم الفئة
//           averageRating: Number(averageRating.toFixed(1))
//         };
//       })
//     );

//     res.status(200).json(coursesWithRatings);
//   } catch (err) {
//     res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المعاينة: ' + err.message });
//   }
// };


// exports.getCoursePreviewById = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//       .select('title description featuredImage price level');
    
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }

//     const feedbacks = await Feedback.find({ courseId: course._id });
//     const averageRating = feedbacks.length > 0 
//       ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
//       : 0;

//     const coursePreview = {
//       _id: course._id,
//       title: course.title,
//       description: course.description,
//       featuredImage: course.featuredImage,
//       price: course.price,
//       level: course.level,
//       averageRating: Number(averageRating.toFixed(1))
//     };

//     res.status(200).json(coursePreview);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getCourseDetailsWithoutVideos = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('resources', '-courseId') // استبعاد courseId من الموارد
      .populate('category', 'name') // جلب اسم الفئة
      .populate('teacherId', 'firstName lastName email'); // معلومات المعلم الأساسية

    if (!course) {
      return res.status(404).json({ message: 'الكورس غير موجود' });
    }
    const feedbacks = await Feedback.find({ courseId: course._id });
    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length 
      : 0;
    // تعديل الأقسام لاستبعاد videoUrl
    const sectionsWithoutVideos = course.sections.map(section => ({
      title: section.title,
      lessons: section.lessons.map(lesson => ({
        title: lesson.title,
        content: lesson.content,
        thumbnailUrl: lesson.thumbnailUrl,
        quiz: lesson.quiz || '',

        // videoUrl مستبعد عمدًا
      }))
    }));

    // بناء كائن الاستجابة مع كل الحقول باستثناء videoUrl
    const courseDetails = {
      _id: course._id,
      title: course.title,
      description: course.description,
      featuredImage: course.featuredImage,
      sections: sectionsWithoutVideos,
      resources: course.resources,
      tags: course.tags,
      teacherId: course.teacherId,
      price: course.price,
      level: course.level,
      category: course.category ? course.category.name : 'غير مصنف', // اسم الفئة
      whatYouWillLearn: course.whatYouWillLearn,
      requirements: course.requirements,
      targetAudience: course.targetAudience,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
              averageRating: Number(averageRating.toFixed(1))

    };

    res.status(200).json(courseDetails);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب تفاصيل الكورس: ' + err.message });
  }
};
// Helper function to calculate average rating (can be used separately if needed)
const getAverageRating = async (courseId) => {
  try {
    const feedbacks = await Feedback.find({ courseId });
    if (feedbacks.length === 0) return 0;
    
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    return Number((totalRating / feedbacks.length).toFixed(1));
  } catch (err) {
    console.error('Error calculating average rating:', err);
    return 0;
  }
};





exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCoursesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const courses = await Course.find({ teacherId });
    if (!courses.length) {
      return res.status(404).json({ message: 'No courses found for this teacher' });
    }
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  const teacherId = req.user.id;
  const courseId = req.params.id;

  try {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you do not have permission to update it' });
    }

    const { 
      title, description, price, level, category, sections, resources, tags, 
      whatYouWillLearn, requirements, targetAudience 
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    const lessonThumbnails = req.files && req.files.lessonThumbnails ? req.files.lessonThumbnails : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: 'Maximum 30 lesson videos allowed' });
    }

    let featuredImageUrl = course.featuredImage;
    if (req.files && req.files.featuredImage) {
      const featuredImage = req.files.featuredImage[0];
      const result = await cloudinary.uploader.upload(featuredImage.path, {
        folder: 'courses/featured_images',
        resource_type: 'image',
      });
      featuredImageUrl = result.secure_url;
      if (fs.existsSync(featuredImage.path)) fs.unlinkSync(featuredImage.path);
    }

    let parsedSections = [];
    if (sections) {
      if (Array.isArray(sections)) {
        parsedSections = sections.map((section) => {
          try {
            return JSON.parse(section);
          } catch (e) {
            return { title: '', lessons: [] };
          }
        });
      } else {
        try {
          parsedSections = JSON.parse(sections);
          if (!Array.isArray(parsedSections)) parsedSections = [parsedSections];
        } catch (e) {
          parsedSections = [];
        }
      }
    }

    let videoIndex = 0;
    let thumbIndex = 0;
    const sectionsWithFiles = parsedSections.map((section) => ({
      title: section.title,
      lessons: section.lessons.map((lesson) => {
        const lessonData = {
          ...lesson,
          videoUrl: lesson.videoUrl || (lessonVideos[videoIndex] ? `pending:${lessonVideos[videoIndex].filename}` : ''),
          thumbnailUrl: lesson.thumbnailUrl || (lessonThumbnails[thumbIndex] ? `pending:${lessonThumbnails[thumbIndex].filename}` : ''),
          duration: lesson.duration || 0, // سيتم تحديثه من Cloudinary إذا تم رفع فيديو جديد
        };
        if (lessonVideos[videoIndex]) videoIndex++;
        if (lessonThumbnails[thumbIndex]) thumbIndex++;
        return lessonData;
      }),
    }));

    let resourceIds = course.resources;
    if (resources) {
      let parsedResources = JSON.parse(resources) || [];
      if (!Array.isArray(parsedResources)) parsedResources = [parsedResources];
      await Resource.deleteMany({ courseId });
      resourceIds = await Promise.all(
        parsedResources.map(async (resource) => {
          const newResource = new Resource({
            ...resource,
            courseId,
          });
          await newResource.save();
          return newResource._id;
        })
      );
    }

    const updatedData = {
      title: title || course.title,
      description: description || course.description,
      featuredImage: featuredImageUrl,
      sections: sectionsWithFiles.length > 0 ? sectionsWithFiles : course.sections,
      resources: resourceIds,
      tags: tags ? JSON.parse(tags) : course.tags,
      price: price ? parseFloat(price) : course.price,
      level: level || course.level,
      category: category || course.category,
      whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : course.whatYouWillLearn,
      requirements: requirements ? JSON.parse(requirements) : course.requirements,
      targetAudience: targetAudience ? JSON.parse(targetAudience) : course.targetAudience,
    };

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      ...updatedCourse._doc,
      message: 'Course updated successfully, videos and thumbnails are being uploaded in the background if provided',
    });

    // رفع الملفات باستخدام Promise.all
    if (lessonVideos.length > 0 || lessonThumbnails.length > 0) {
      const uploadPromises = [];
      let videoIdx = 0;
      let thumbIdx = 0;

      sectionsWithFiles.forEach((section, sectionIndex) => {
        section.lessons.forEach((lesson, lessonIndex) => {
          if (lesson.videoUrl && lesson.videoUrl.startsWith('pending:')) {
            uploadPromises.push(
              cloudinary.uploader.upload(lessonVideos[videoIdx].path, {
                folder: 'courses/lesson_videos',
                resource_type: 'video',
                chunk_size: 6000000,
              }).then(videoResult => {
                updatedCourse.sections[sectionIndex].lessons[lessonIndex].videoUrl = videoResult.secure_url;
                updatedCourse.sections[sectionIndex].lessons[lessonIndex].duration = Number((videoResult.duration / 60).toFixed(1)); // المدة بالدقائق من Cloudinary
                if (fs.existsSync(lessonVideos[videoIdx].path)) fs.unlinkSync(lessonVideos[videoIdx].path);
                videoIdx++;
              }).catch(uploadErr => {
                console.log(`Failed to upload video for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
              })
            );
          }

          if (lesson.thumbnailUrl && lesson.thumbnailUrl.startsWith('pending:')) {
            uploadPromises.push(
              cloudinary.uploader.upload(lessonThumbnails[thumbIdx].path, {
                folder: 'courses/lesson_thumbnails',
                resource_type: 'image',
              }).then(thumbResult => {
                updatedCourse.sections[sectionIndex].lessons[lessonIndex].thumbnailUrl = thumbResult.secure_url;
                if (fs.existsSync(lessonThumbnails[thumbIdx].path)) fs.unlinkSync(lessonThumbnails[thumbIdx].path);
                thumbIdx++;
              }).catch(uploadErr => {
                console.log(`Failed to upload thumbnail for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
              })
            );
          }
        });
      });

      await Promise.all(uploadPromises);
      await updatedCourse.save();
    }
  } catch (err) {
    console.log('Error in updateCourse:', err);
    if (req.files) {
      if (req.files.featuredImage && fs.existsSync(req.files.featuredImage[0]?.path)) {
        fs.unlinkSync(req.files.featuredImage[0].path);
      }
      if (req.files.lessonVideos) {
        req.files.lessonVideos.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      if (req.files.lessonThumbnails) {
        req.files.lessonThumbnails.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
    }
    res.status(500).json({ message: err.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};