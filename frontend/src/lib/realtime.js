const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const createRideEventStream = (token) => {
  if (!token) return null;
  const streamUrl = `${API_BASE_URL}/rides/stream?token=${encodeURIComponent(token)}`;
  return new EventSource(streamUrl);
};
