const express = require("express");
const { body } = require("express-validator");
const { createEmergencyRideRequest } = require("../controllers/publicRideController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/emergency",
  [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required."),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be valid."),
    body("tripType")
      .isIn(["one-way", "round-trip", "multi-stop"])
      .withMessage("Trip type is invalid."),
    body("mobilityType")
      .isIn(["ambulatory", "wheelchair", "stretcher", "bariatric", "other"])
      .withMessage("Mobility type is invalid."),
    validateRequest,
  ],
  createEmergencyRideRequest
);

module.exports = router;
