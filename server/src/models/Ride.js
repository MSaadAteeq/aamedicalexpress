const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

rideSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Ride", rideSchema);
