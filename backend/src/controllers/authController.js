const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const getRoleForNewUser = (email) => {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean) || [];
  return adminEmails.includes(email.toLowerCase()) ? "admin" : "member";
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: getRoleForNewUser(email),
  });

  const token = generateToken(user._id.toString());

  return res.status(201).json({
    message: "Registration successful.",
    token,
    user: buildUserPayload(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "Login successful.",
    token,
    user: buildUserPayload(user),
  });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId).select("_id name email phone role");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json({ user: buildUserPayload(user) });
};

const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully.",
    user: buildUserPayload(user),
  });
};

module.exports = { register, login, getCurrentUser, updateProfile };
