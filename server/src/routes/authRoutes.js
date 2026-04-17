const express = require("express");
const { body } = require("express-validator");
const { register, login, getCurrentUser, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    validateRequest,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
    validateRequest,
  ],
  login
);

router.get("/me", protect, getCurrentUser);

router.put(
  "/profile",
  [
    protect,
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters."),
    body("phone").optional().trim().notEmpty().withMessage("Phone number cannot be empty."),
    validateRequest,
  ],
  updateProfile
);

module.exports = router;
