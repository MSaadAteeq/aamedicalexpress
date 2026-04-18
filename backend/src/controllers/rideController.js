const Ride = require("../models/Ride");
const User = require("../models/User");
const { Types } = require("mongoose");
const { sendAdminNotification } = require("../utils/adminNotifier");
const {
  addRideStreamClient,
  removeRideStreamClient,
  sendStreamConnected,
  broadcastRideCreated,
  broadcastRideUpdated,
} = require("../utils/rideRealtime");

const buildAdminHistoryFilter = async ({ status, search, startDate, endDate }) => {
  const filter = {};

  if (status && ["pending", "confirmed", "completed"].includes(status)) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.dateTime = {};
    if (startDate) {
      filter.dateTime.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.dateTime.$lte = end;
    }
  }

  if (search?.trim()) {
    const rawSearch = search.trim();
    const asObjectId = Types.ObjectId.isValid(rawSearch) ? new Types.ObjectId(rawSearch) : null;
    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: rawSearch, $options: "i" } },
        { email: { $regex: rawSearch, $options: "i" } },
        { phone: { $regex: rawSearch, $options: "i" } },
      ],
    }).select("_id");

    filter.$or = [
      { pickupLocation: { $regex: rawSearch, $options: "i" } },
      { dropoffLocation: { $regex: rawSearch, $options: "i" } },
      { notes: { $regex: rawSearch, $options: "i" } },
      ...(matchedUsers.length ? [{ userId: { $in: matchedUsers.map((user) => user._id) } }] : []),
      ...(asObjectId ? [{ userId: asObjectId }] : []),
    ];
  }

  return filter;
};

const formatRideCsvRows = (rides) => {
  const escapeCsv = (value) => {
    const normalized = value ?? "";
    const text = String(normalized).replace(/"/g, '""');
    return `"${text}"`;
  };

  const headers = [
    "Ride ID",
    "Requested At",
    "Date Time",
    "Status",
    "Trip Type",
    "Mobility Type",
    "Pickup Location",
    "Dropoff Location",
    "Rider Name",
    "Rider Email",
    "Rider Phone",
    "Notes",
  ];

  const rows = rides.map((ride) =>
    [
      ride._id,
      ride.createdAt?.toISOString?.() || "",
      ride.dateTime?.toISOString?.() || "",
      ride.status,
      ride.tripType,
      ride.mobilityType,
      ride.pickupLocation,
      ride.dropoffLocation,
      ride.userId?.name || "",
      ride.userId?.email || "",
      ride.userId?.phone || "",
      ride.notes || "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
};

const createRide = async (req, res) => {
  const ride = await Ride.create({
    userId: req.user.userId,
    tripType: req.body.tripType,
    mobilityType: req.body.mobilityType,
    pickupLocation: req.body.pickupLocation,
    dropoffLocation: req.body.dropoffLocation,
    dateTime: req.body.dateTime,
    notes: req.body.notes || "",
  });

  sendAdminNotification({
    subject: "New ride request submitted",
    eventType: "ride_request_created",
    details: {
      rider: req.user.name,
      riderEmail: req.user.email,
      riderPhone: req.user.phone,
      tripType: ride.tripType,
      route: `${ride.pickupLocation} -> ${ride.dropoffLocation}`,
      scheduledFor: ride.dateTime.toISOString(),
      notes: ride.notes || "N/A",
    },
  }).catch((error) => {
    console.error("Failed to send ride request notification:", error.message);
  });

  broadcastRideCreated(ride);

  return res.status(201).json({
    message: "Ride request submitted successfully.",
    ride,
  });
};

const getUserRides = async (req, res) => {
  const rides = await Ride.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.status(200).json({ rides });
};

const getRideStats = async (req, res) => {
  const now = new Date();

  const [totalRides, upcomingRides, completedRides, pendingConfirmations] = await Promise.all([
    Ride.countDocuments({ userId: req.user.userId }),
    Ride.countDocuments({
      userId: req.user.userId,
      dateTime: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    }),
    Ride.countDocuments({ userId: req.user.userId, status: "completed" }),
    Ride.countDocuments({ userId: req.user.userId, status: "pending" }),
  ]);

  return res.status(200).json({
    totalRides,
    upcomingRides,
    completedRides,
    pendingConfirmations,
  });
};

const getAdminDashboard = async (_req, res) => {
  const now = new Date();
  const [totalRides, pendingRides, confirmedRides, completedRides, upcomingRides, allRides] =
    await Promise.all([
      Ride.countDocuments({}),
      Ride.countDocuments({ status: "pending" }),
      Ride.countDocuments({ status: "confirmed" }),
      Ride.countDocuments({ status: "completed" }),
      Ride.countDocuments({ dateTime: { $gte: now }, status: { $in: ["pending", "confirmed"] } }),
      Ride.find({}).populate("userId", "name email phone").sort({ createdAt: -1 }),
    ]);

  return res.status(200).json({
    stats: {
      totalRides,
      pendingRides,
      confirmedRides,
      completedRides,
      upcomingRides,
    },
    recentRides: allRides.slice(0, 12),
    allRides,
  });
};

const getAdminTripHistory = async (_req, res) => {
  const { status, search, startDate, endDate } = _req.query;
  const page = Math.max(Number.parseInt(_req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(_req.query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = await buildAdminHistoryFilter({ status, search, startDate, endDate });

  const [rides, total] = await Promise.all([
    Ride.find(filter).populate("userId", "name email phone").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ride.countDocuments(filter),
  ]);

  return res.status(200).json({
    rides,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasMore: skip + rides.length < total,
    },
  });
};

const exportAdminTripHistoryCsv = async (req, res) => {
  const { status, search, startDate, endDate } = req.query;
  const filter = await buildAdminHistoryFilter({ status, search, startDate, endDate });

  const rides = await Ride.find(filter).populate("userId", "name email phone").sort({ createdAt: -1 });
  const csv = formatRideCsvRows(rides);

  const timestamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"dispatch-history-${timestamp}.csv\"`);
  return res.status(200).send(csv);
};

const updateRideStatus = async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body;

  const ride = await Ride.findById(rideId);
  if (!ride) {
    return res.status(404).json({ message: "Ride not found." });
  }
  const rider = await User.findById(ride.userId).select("_id name email phone");

  const workflow = {
    pending: ["confirmed"],
    confirmed: ["completed"],
    completed: [],
  };

  const previousStatus = ride.status;
  if (!workflow[ride.status].includes(status)) {
    return res.status(400).json({
      message: `Invalid status transition from ${ride.status} to ${status}.`,
    });
  }

  ride.status = status;
  await ride.save();

  sendAdminNotification({
    subject: "Ride status updated",
    eventType: "ride_status_updated",
    details: {
      rider: rider?.name || "Unknown",
      riderEmail: rider?.email || "N/A",
      riderPhone: rider?.phone || "N/A",
      route: `${ride.pickupLocation} -> ${ride.dropoffLocation}`,
      status: `${previousStatus} -> ${status}`,
      notes: ride.notes || "N/A",
      updatedBy: req.user.name || req.user.email,
    },
  }).catch((error) => {
    console.error("Failed to send ride status notification:", error.message);
  });

  broadcastRideUpdated(ride);

  return res.status(200).json({
    message: "Ride status updated successfully.",
    ride,
  });
};

const streamRideEvents = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const clientId = addRideStreamClient({
    userId: req.user.userId,
    role: req.user.role,
    res,
  });
  sendStreamConnected(res);

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeRideStreamClient(clientId);
  });
};

module.exports = {
  createRide,
  getUserRides,
  getRideStats,
  getAdminDashboard,
  getAdminTripHistory,
  exportAdminTripHistoryCsv,
  updateRideStatus,
  streamRideEvents,
};
