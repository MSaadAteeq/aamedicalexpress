const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("_id role name email phone");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user no longer exists." });
    }
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token." });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions." });
  }
  return next();
};

module.exports = { protect, authorizeRoles };
