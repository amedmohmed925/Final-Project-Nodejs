const User = require("../models/UserSchema");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.ACCESS_SECRET,
        { expiresIn: "15m" }
    );
};


const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};


exports.register = async (req, res) => {
    try {
        const { username, password, confirm_password, firstName, lastName, email, dob, role } = req.body;

        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, firstName, lastName, email, dob, role });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await RefreshToken.create({ token: refreshToken, userId: user._id });

        res.json({ message: "Login successful", accessToken, refreshToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken) return res.status(403).json({ message: "Forbidden" });

        jwt.verify(token, process.env.REFRESH_SECRET, async (err, user) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const newAccessToken = generateAccessToken(user);
            res.json({ accessToken: newAccessToken });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.logout = async (req, res) => {
    try {
        const { token } = req.body;
        await RefreshToken.deleteOne({ token });

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
