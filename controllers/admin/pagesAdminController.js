// controllers/admin/pagesAdminController.js
const Page = require('../../models/Page');
const Joi = require('joi');

// Validation schema
const pageSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  slug: Joi.string().alphanum().min(3).max(50).required(),
  content: Joi.string().min(3).required(),
  isActive: Joi.boolean().default(true)
});

exports.createPage = async (req, res) => {
  try {
    const { error, value } = pageSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const exists = await Page.findOne({ slug: value.slug });
    if (exists) return res.status(409).json({ error: 'Slug already exists' });
    const page = new Page(value);
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = pageSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const page = await Page.findByIdAndUpdate(id, value, { new: true });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listPages = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const pages = await Page.find(filter).sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
