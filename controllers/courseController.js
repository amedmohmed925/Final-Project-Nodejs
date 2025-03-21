const Course = require('../models/Course');
const Resource = require('../models/Resource');
const cloudinary = require('../cloudinaryConfig');
const Category = require('../models/Category');
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
          videoUrl: lessonVideos[videoIndex] ? `pending:${lessonVideos[videoIndex].filename}` : '',
          thumbnailUrl: lessonThumbnails[thumbIndex] ? `pending:${lessonThumbnails[thumbIndex].filename}` : '',
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

      await Promise.all(uploadPromises); // انتظار اكتمال جميع عمليات الرفع
      await newCourse.save(); // حفظ التغييرات مرة واحدة
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

      await Promise.all(uploadPromises); // انتظار اكتمال جميع عمليات الرفع
      await updatedCourse.save(); // حفظ التغييرات مرة واحدة
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