const jwt = require("jsonwebtoken");


exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });

        req.user = user;
        next();
    });
};


exports.isTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied, only teachers allowed" });
    }
    next();
};


exports.isStudent = (req, res, next) => {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied, only students allowed" });
    }
    next();
};
