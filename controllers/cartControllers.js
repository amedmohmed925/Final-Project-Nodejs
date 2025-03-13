const Coupon = require("../models/Coupon");
const Cart = require('../models/Cart');

const Course = require('../models/Course'); // استيراد موديل الكورسات

let addCart = async (req, res) => {
    const { userId, courseId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [], total: 0 });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const existingItem = cart.items.find(item => item.courseId.toString() === courseId);
        if (existingItem) {
            return res.status(400).json({ message: "Course is already in the cart." });
        }

        cart.items.push({
            courseId,
            title: course.title,
            price: course.price, // تخزين السعر وقت الاضافه
            courseImage: course.featuredImage
        });

        cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
let removeCart = async (req, res) => {
    const { userId, courseId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.courseId.toString() === courseId);
        if (itemIndex === -1) return res.status(404).json({ message: "Course not found in cart" });

        // إزالة العنصر
        cart.items.splice(itemIndex, 1);
        
        cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

        cart.finalTotal = cart.total - (cart.total * (cart.discount / 100));

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


let getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
            .populate('items.courseId', 'title price featuredImage level');

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


let checkout = async (req, res) => {
    const { userId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) 
            return res.status(400).json({ message: "Cart is empty" });

        cart.items.forEach(item => {
            item.isPurchased = true;
        });

        // إفراغ السلة بالكامل وإعادة ضبط القيم
        cart.items = [];
        cart.total = 0;
        cart.discount = 0;
        cart.finalTotal = 0;

        await cart.save();

        res.json({ message: "Checkout successful", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const applyCoupon = async (req, res) => {
    const { userId, couponCode } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return res.status(400).json({ message: "Invalid coupon code" });
        }

        if (new Date() > coupon.expiresAt) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        let discountPercentage = coupon.discount;
        if (discountPercentage > 100) discountPercentage = 100;  // تأكيد عدم تجاوز 100%

        cart.discount = discountPercentage;
        cart.finalTotal = cart.total - (cart.total * (cart.discount / 100));

        await cart.save();

        res.json({ message: "Coupon applied", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    addCart,
    removeCart,
    getCart,
    checkout,
    applyCoupon,
};
