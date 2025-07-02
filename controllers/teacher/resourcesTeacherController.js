// controllers/teacher/resourcesTeacherController.js
const Resource = require('../../models/Resource');
const Course = require('../../models/Course');
const Joi = require('joi');
const cloudinary = require('../../cloudinaryConfig');


const resourceSchema = Joi.object({
  courseId: Joi.string().required(),
  title: Joi.string().min(3).max(100).required(),
  type: Joi.string().valid('file', 'link').required(),
  url: Joi.string().uri().optional(),
});

exports.addResource = async (req, res) => {
  try {
    const { error, value } = resourceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const course = await Course.findById(value.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    let resourceData = {
      course: value.courseId,
      title: value.title,
      type: value.type,
      url: value.url || '',
      uploadedBy: req.user.id
    };
    if (value.type === 'file' && req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
      resourceData.url = result.secure_url;
    }
    const resource = new Resource(resourceData);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listResources = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const resources = await Resource.find({ course: courseId });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    const course = await Course.findById(resource.course);
    if (!course || course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
