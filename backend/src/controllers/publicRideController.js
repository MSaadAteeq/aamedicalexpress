const EmergencyRideRequest = require("../models/EmergencyRideRequest");
const { sendAdminNotification } = require("../utils/adminNotifier");

const createEmergencyRideRequest = async (req, res) => {
  const request = await EmergencyRideRequest.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    email: req.body.email || "",
    tripType: req.body.tripType,
    mobilityType: req.body.mobilityType,
  });

  sendAdminNotification({
    subject: "Emergency ride request submitted",
    eventType: "emergency_ride_request",
    details: {
      requestId: request._id.toString().slice(-8),
      riderName: `${request.firstName} ${request.lastName}`,
      phone: request.phone,
      tripType: request.tripType,
      mobilityType: request.mobilityType,
    },
  }).catch((error) => {
    console.error("Failed to send emergency ride notification:", error.message);
  });

  return res.status(201).json({
    message: "Emergency request received. Dispatch will contact you shortly.",
    requestId: request._id,
  });
};

module.exports = { createEmergencyRideRequest };
