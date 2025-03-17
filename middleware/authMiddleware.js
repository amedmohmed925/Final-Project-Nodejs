const jwt = require("jsonwebtoken");


exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    console.log('Token received:', token);
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        console.log('JWT Error:', err);
        if (err) return res.status(403).json({ message: "Forbidden" });

        req.user = user;
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, only admins allowed" });
    }
    next();
  };

exports.isAdvertiser = (req, res, next) => {
    if (!req.user || req.user.role !== "advertiser") {
      return res.status(403).json({ message: "Access denied, only advertiser allowed" });
    }
    next();
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
