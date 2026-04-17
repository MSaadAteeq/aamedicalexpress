const express = require("express");
const { body } = require("express-validator");
const {
  createRide,
  getUserRides,
  getRideStats,
  getAdminDashboard,
  getAdminTripHistory,
  exportAdminTripHistoryCsv,
  updateRideStatus,
} = require("../controllers/rideController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("tripType")
      .isIn(["one-way", "round-trip", "multi-stop"])
      .withMessage("Trip type is invalid."),
    body("mobilityType")
      .isIn(["ambulatory", "wheelchair", "stretcher", "bariatric", "other"])
      .withMessage("Mobility type is invalid."),
    body("pickupLocation").trim().notEmpty().withMessage("Pickup location is required."),
    body("dropoffLocation").trim().notEmpty().withMessage("Drop-off location is required."),
    body("dateTime").isISO8601().withMessage("A valid date/time is required."),
    body("notes").optional().isLength({ max: 1000 }).withMessage("Notes are too long."),
    validateRequest,
  ],
  createRide
);

router.get("/", getUserRides);
router.get("/stats", getRideStats);
router.get("/admin/dashboard", authorizeRoles("admin"), getAdminDashboard);
router.get("/admin/history", authorizeRoles("admin"), getAdminTripHistory);
router.get("/admin/history/export", authorizeRoles("admin"), exportAdminTripHistoryCsv);
router.patch(
  "/:rideId/status",
  [
    authorizeRoles("admin"),
    body("status").isIn(["confirmed", "completed"]).withMessage("Status must be confirmed or completed."),
    validateRequest,
  ],
  updateRideStatus
);

module.exports = router;
