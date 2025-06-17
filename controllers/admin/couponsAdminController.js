// controllers/admin/couponsAdminController.js
const Coupon = require('../../models/Coupon');
const Joi = require('joi');

const couponSchema = Joi.object({
  code: Joi.string().alphanum().min(3).max(20).required(),
  discount: Joi.number().min(1).max(100).required(),
  type: Joi.string().valid('percentage', 'fixed').required(),
  expiresAt: Joi.date().optional(),
  isActive: Joi.boolean().default(true),
  usageLimit: Joi.number().min(1).optional(),
  description: Joi.string().allow('').optional()
});

exports.createCoupon = async (req, res) => {
  try {
    const { error, value } = couponSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const exists = await Coupon.findOne({ code: value.code });
    if (exists) return res.status(409).json({ error: 'Coupon code already exists' });
    const coupon = new Coupon(value);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = couponSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const coupon = await Coupon.findByIdAndUpdate(id, value, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listCoupons = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let filter = {};
    if (search) filter.code = { $regex: search, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
