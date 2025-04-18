const Course = require('../models/Course');
const Resource = require('../models/Resource');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs');

exports.addCourse = async (req, res) => {
  const { title, description, price, level, category, sections, resources, tags } = req.body;
  const teacherId = req.user.id;

  try {
    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    const lessonThumbnails = req.files && req.files.lessonThumbnails ? req.files.lessonThumbnails : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: 'Maximum 30 lesson videos are allowed' });
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

    // تحليل الأقسام
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
          if (!Array.isArray(parsedSections)) {
            parsedSections = [parsedSections];
          }
        } catch (e) {
          parsedSections = [];
        }
      }
    }

    // معالجة الفيديوهات والصور المصغرة لكل حلقة داخل الأقسام
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

    // إنشاء الكورس
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
    });

    await newCourse.save();

    // تحليل وإنشاء الموارد
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
      message: 'Course created, videos and thumbnails are being uploaded in the background',
    });

    // رفع الفيديوهات والصور المصغرة في الخلفية
    if (lessonVideos.length > 0 || lessonThumbnails.length > 0) {
      let videoIdx = 0;
      let thumbIdx = 0;
      sectionsWithFiles.forEach(async (section, sectionIndex) => {
        section.lessons.forEach(async (lesson, lessonIndex) => {
          try {
            if (lesson.videoUrl.startsWith('pending:')) {
              const videoResult = await cloudinary.uploader.upload(lessonVideos[videoIdx].path, {
                folder: 'courses/lesson_videos',
                resource_type: 'video',
                chunk_size: 6000000,
              });
              newCourse.sections[sectionIndex].lessons[lessonIndex].videoUrl = videoResult.secure_url;
              if (fs.existsSync(lessonVideos[videoIdx].path)) fs.unlinkSync(lessonVideos[videoIdx].path);
              videoIdx++;
            }

            if (lesson.thumbnailUrl.startsWith('pending:')) {
              const thumbResult = await cloudinary.uploader.upload(lessonThumbnails[thumbIdx].path, {
                folder: 'courses/lesson_thumbnails',
                resource_type: 'image',
              });
              newCourse.sections[sectionIndex].lessons[lessonIndex].thumbnailUrl = thumbResult.secure_url;
              if (fs.existsSync(lessonThumbnails[thumbIdx].path)) fs.unlinkSync(lessonThumbnails[thumbIdx].path);
              thumbIdx++;
            }

            await newCourse.save();
          } catch (uploadErr) {
            console.log(`Failed to upload files for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
          }
        });
      });
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

  console.log("Received Payload:", req.body);
  console.log("Received Files:", req.files);

  try {
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or you don't have permission to update it" });
    }

    if (Object.keys(req.body).length === 0 && (!req.files || Object.keys(req.files).length === 0)) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const { title, description, price, level, category, sections, resources, tags } = req.body;

    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    const lessonThumbnails = req.files && req.files.lessonThumbnails ? req.files.lessonThumbnails : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: "Maximum 30 lesson videos are allowed" });
    }

    let featuredImageUrl = course.featuredImage;
    if (req.files && req.files.featuredImage) {
      const featuredImage = req.files.featuredImage[0];
      const result = await cloudinary.uploader.upload(featuredImage.path, {
        folder: "courses/featured_images",
        resource_type: "image",
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
            return { title: "", lessons: [] };
          }
        });
      } else {
        try {
          parsedSections = JSON.parse(sections);
          if (!Array.isArray(parsedSections)) {
            parsedSections = [parsedSections];
          }
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
          videoUrl: lesson.videoUrl || (lessonVideos[videoIndex] ? `pending:${lessonVideos[videoIndex].filename}` : ""),
          thumbnailUrl: lesson.thumbnailUrl || (lessonThumbnails[thumbIndex] ? `pending:${lessonThumbnails[thumbIdx].filename}` : ""),
        };
        if (lessonVideos[videoIndex]) videoIndex++;
        if (lessonThumbnails[thumbIndex]) thumbIndex++;
        return lessonData;
      }),
    }));

    let resourceIds = course.resources;
    if (resources) {
      let parsedResources;
      try {
        parsedResources = JSON.parse(resources);
        if (!Array.isArray(parsedResources)) {
          parsedResources = [parsedResources];
        }
      } catch (e) {
        console.log("Failed to parse resources:", e);
        parsedResources = [];
      }

      // تصحيح البيانات إذا كانت تحتوي على مفاتيح غير متوقعة
      const cleanedResources = parsedResources.map((resource) => {
        // إذا كانت البيانات تحتوي على مفاتيح غريبة مثل "0", "1", إلخ، استخرج فقط الحقول المطلوبة
        return {
          name: resource.name || "Unnamed Resource",
          type: resource.type || "link", // قيمة افتراضية إذا لم يكن type موجودًا
          url: resource.url || "",
        };
      });

      // حذف الموارد القديمة وإنشاء جديدة
      await Resource.deleteMany({ courseId });
      resourceIds = await Promise.all(
        cleanedResources.map(async (resource) => {
          const newResource = new Resource({
            name: resource.name,
            type: resource.type,
            url: resource.url,
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
    };

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      ...updatedCourse._doc,
      message: "Course updated successfully, videos and thumbnails are being uploaded in the background if provided",
    });

    // رفع الملفات في الخلفية (كما هو)
    if (lessonVideos.length > 0 || lessonThumbnails.length > 0) {
      let videoIdx = 0;
      let thumbIdx = 0;
      sectionsWithFiles.forEach(async (section, sectionIndex) => {
        section.lessons.forEach(async (lesson, lessonIndex) => {
          try {
            if (lesson.videoUrl && lesson.videoUrl.startsWith("pending:")) {
              const videoResult = await cloudinary.uploader.upload(lessonVideos[videoIdx].path, {
                folder: "courses/lesson_videos",
                resource_type: "video",
                chunk_size: 6000000,
              });
              updatedCourse.sections[sectionIndex].lessons[lessonIndex].videoUrl = videoResult.secure_url;
              if (fs.existsSync(lessonVideos[videoIdx].path)) fs.unlinkSync(lessonVideos[videoIdx].path);
              videoIdx++;
            }

            if (lesson.thumbnailUrl && lesson.thumbnailUrl.startsWith("pending:")) {
              const thumbResult = await cloudinary.uploader.upload(lessonThumbnails[thumbIdx].path, {
                folder: "courses/lesson_thumbnails",
                resource_type: "image",
              });
              updatedCourse.sections[sectionIndex].lessons[lessonIndex].thumbnailUrl = thumbResult.secure_url;
              if (fs.existsSync(lessonThumbnails[thumbIdx].path)) fs.unlinkSync(lessonThumbnails[thumbIdx].path);
              thumbIdx++;
            }

            await updatedCourse.save();
          } catch (uploadErr) {
            console.log(`Failed to upload files for lesson ${lessonIndex + 1} in section ${sectionIndex + 1}:`, uploadErr);
          }
        });
      });
    }
  } catch (err) {
    console.log("Error in updateCourse:", err);
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