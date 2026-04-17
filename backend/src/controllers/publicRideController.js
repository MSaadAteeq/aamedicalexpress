const EmergencyRideRequest = require("../models/EmergencyRideRequest");

const createEmergencyRideRequest = async (req, res) => {
  const request = await EmergencyRideRequest.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    email: req.body.email || "",
    tripType: req.body.tripType,
    mobilityType: req.body.mobilityType,
  });

  return res.status(201).json({
    message: "Emergency request received. Dispatch will contact you shortly.",
    requestId: request._id,
  });
};

module.exports = { createEmergencyRideRequest };
