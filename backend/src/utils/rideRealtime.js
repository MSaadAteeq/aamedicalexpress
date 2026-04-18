const clients = new Map();
let nextClientId = 1;

const formatRidePayload = (ride) => {
  if (!ride) return null;
  const owner = ride.userId?._id || ride.userId;
  return {
    rideId: ride._id?.toString?.() || String(ride._id || ""),
    userId: owner?.toString?.() || String(owner || ""),
    status: ride.status,
    updatedAt: new Date().toISOString(),
  };
};

const writeEvent = (res, eventName, payload) => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const shouldReceiveRideEvent = (client, payload) =>
  client.role === "admin" || (payload.userId && client.userId === payload.userId);

const publishRideEvent = (eventName, ride) => {
  const payload = formatRidePayload(ride);
  if (!payload) return;

  for (const client of clients.values()) {
    if (shouldReceiveRideEvent(client, payload)) {
      writeEvent(client.res, eventName, payload);
    }
  }
};

const addRideStreamClient = ({ userId, role, res }) => {
  const id = nextClientId++;
  clients.set(id, { id, userId, role, res });
  return id;
};

const removeRideStreamClient = (clientId) => {
  clients.delete(clientId);
};

const sendStreamConnected = (res) => {
  writeEvent(res, "connected", { ok: true, connectedAt: new Date().toISOString() });
};

const broadcastRideCreated = (ride) => {
  publishRideEvent("ride_created", ride);
};

const broadcastRideUpdated = (ride) => {
  publishRideEvent("ride_updated", ride);
};

module.exports = {
  addRideStreamClient,
  removeRideStreamClient,
  sendStreamConnected,
  broadcastRideCreated,
  broadcastRideUpdated,
};
