const mongoose = require("mongoose");

const emergencyRideRequestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    tripType: {
      type: String,
      enum: ["one-way", "round-trip", "multi-stop"],
      required: true,
    },
    mobilityType: {
      type: String,
      enum: ["ambulatory", "wheelchair", "stretcher", "bariatric", "other"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyRideRequest", emergencyRideRequestSchema);
