// controllers/cartController.js
const Coupon = require("../models/coupon");
const Cart = require("../models/Cart");
const CouponUsage = require("../models/CouponUsage"); // استيراد النموذج الجديد
const Course = require("../models/Course");
const mongoose = require("mongoose");


const addCart = async (req, res) => {
  const userId = req.user.id; // Extracted from JWT token
  const { courseId } = req.body;

  try {
    // Input validation
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Valid Course ID is required" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0, discount: 0, finalTotal: 0 });
    }

    const course = await Course.findById(courseId).select("title price featuredImage available");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
 

    const existingItem = cart.items.find(
      (item) => item.courseId.toString() === courseId
    );
    if (existingItem) {
      return res.status(400).json({ message: "Course is already in the cart" });
    }

    cart.items.push({
      courseId,
      title: course.title,
      price: course.price,
      courseImage: course.featuredImage,
      isPurchased: false,
    });

    calculateCartTotals(cart);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add course to cart", error: error.message });
  }
};

const removeCart = async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.body;
  
    console.log("Received courseId:", courseId);
  
    try {
      if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Valid Course ID is required" });
      }
  
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const itemIndex = cart.items.findIndex(
        (item) => item.courseId.toString() === courseId // مقارنة الـ courseId كـ string
      );
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Course not found in cart" });
      }
  
      cart.items.splice(itemIndex, 1);
      calculateCartTotals(cart);
  
      if (cart.items.length === 0) {
        cart.discount = 0;
      }
  
      await cart.save();
  

      await cart.populate("items.courseId", "title price featuredImage level");
      res.status(200).json({
        items: cart.items.map(item => ({
          courseId: {
            _id: item.courseId._id.toString(),
            title: item.courseId.title,
            price: item.courseId.price,
            featuredImage: item.courseId.featuredImage,
            level: item.courseId.level
          }
        })),
        total: cart.total,
        discount: cart.discount || 0,
        finalTotal: cart.finalTotal
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove course from cart", error: error.message });
    }
  };
  
const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    // Input validation
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid User ID is required" });
    }
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this cart" });
    }

    const cart = await Cart.findOne({ userId }).populate(
      "items.courseId",
      "title price featuredImage level"
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve cart", error: error.message });
  }
};

const checkout = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // إذا كان هناك كوبون مطبق
    if (cart.couponCode) {
      const coupon = await Coupon.findOne({ code: cart.couponCode });
      if (coupon) {
        // زيادة عدد الاستخدامات
        coupon.usageCount += 1;

        // تسجيل استخدام الكوبون للمستخدم
        const newCouponUsage = new CouponUsage({
          userId,
          couponCode: cart.couponCode,
        });

        await Promise.all([coupon.save(), newCouponUsage.save()]);
      }
    }

    // Mark items as purchased (for tracking purposes)
    const purchasedItems = cart.items.map((item) => ({
      userId,
      courseId: item.courseId,
      title: item.title,
      price: item.price,
      purchaseDate: new Date(),
    }));

    // Reset cart
    cart.items = [];
    cart.total = 0;
    cart.discount = 0;
    cart.couponCode = null; // إعادة تعيين الكوبون
    cart.finalTotal = 0;

    await cart.save();

    res.status(200).json({ message: "Checkout successful", cart, purchasedItems });
  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};


const calculateCartTotals = (cart) => {
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  cart.finalTotal = cart.total - (cart.total * (cart.discount / 100));
  return cart;
};

const applyCoupon = async (req, res) => {
  const userId = req.user.id;
  const { couponCode } = req.body;

  try {
    if (!couponCode || typeof couponCode !== "string") {
      return res.status(400).json({ message: "Valid coupon code is required" });
    }

    let cart = await Cart.findOne({ userId }).populate("items.courseId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty, cannot apply coupon" });
    }

    if (cart.couponCode) {
      return res.status(400).json({ message: "A coupon is already applied to this cart" });
    }

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const couponUsage = await CouponUsage.findOne({ userId, couponCode });
    if (couponUsage) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    cart.discount = coupon.discount;
    cart.couponCode = couponCode;
    calculateCartTotals(cart);

    await cart.save();

    // Populate again to ensure items have course data after save
    cart = await Cart.findOne({ userId }).populate("items.courseId");

    res.status(200).json({ message: "Coupon applied successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply coupon", error: error.message });
  }
};
module.exports = {
  addCart,
  removeCart,
  getCart,
  checkout,
  applyCoupon,
};