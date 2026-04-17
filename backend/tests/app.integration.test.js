const bcrypt = require("bcryptjs");
const request = require("supertest");

const mockUsers = [];
const mockRides = [];

let mockUserIdCounter = 0;
let mockRideIdCounter = 0;

const makeThenable = (value) => ({
  select: () => Promise.resolve(value),
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
});

const cloneUserPublic = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const createRideQuery = (source) => {
  let data = [...source];
  return {
    populate() {
      data = data.map((ride) => {
        const owner = mockUsers.find((user) => user._id === ride.userId);
        return {
          ...ride,
          userId: owner ? cloneUserPublic(owner) : ride.userId,
        };
      });
      return this;
    },
    sort(sortBy) {
      if (sortBy?.createdAt === -1) {
        data.sort((a, b) => b.createdAt - a.createdAt);
      }
      return this;
    },
    limit(count) {
      return Promise.resolve(data.slice(0, count));
    },
    then(resolve, reject) {
      return Promise.resolve(data).then(resolve, reject);
    },
  };
};

jest.mock("../src/models/User", () => ({
  create: jest.fn(async (payload) => {
    const user = {
      _id: `u${++mockUserIdCounter}`,
      name: payload.name,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      password: payload.password,
      role: payload.role || "member",
      save: async function save() {
        return this;
      },
    };
    mockUsers.push(user);
    return user;
  }),
  findOne: jest.fn((query) => {
    const user = mockUsers.find((item) => item.email === query.email.toLowerCase()) || null;
    return makeThenable(user);
  }),
  findById: jest.fn((id) => {
    const user = mockUsers.find((item) => item._id.toString() === id.toString()) || null;
    return makeThenable(user);
  }),
}));

jest.mock("../src/models/Ride", () => ({
  create: jest.fn(async (payload) => {
    const ride = {
      _id: `r${++mockRideIdCounter}`,
      userId: payload.userId,
      tripType: payload.tripType,
      mobilityType: payload.mobilityType,
      pickupLocation: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      dateTime: new Date(payload.dateTime),
      notes: payload.notes || "",
      status: payload.status || "pending",
      createdAt: new Date(),
      save: async function save() {
        return this;
      },
    };
    mockRides.push(ride);
    return ride;
  }),
  find: jest.fn((query = {}) => {
    const filtered = mockRides.filter((ride) => {
      if (query.userId && ride.userId !== query.userId) return false;
      return true;
    });
    return createRideQuery(filtered);
  }),
  findById: jest.fn(async (rideId) => mockRides.find((ride) => ride._id === rideId) || null),
  countDocuments: jest.fn(async (query = {}) => {
    const now = new Date();
    return mockRides.filter((ride) => {
      if (query.userId && ride.userId !== query.userId) return false;
      if (query.status) {
        if (query.status.$in) return query.status.$in.includes(ride.status);
        return ride.status === query.status;
      }
      if (query.dateTime?.$gte && new Date(ride.dateTime) < (query.dateTime.$gte || now)) return false;
      return true;
    }).length;
  }),
}));

const app = require("../src/app");

const registerAndLogin = async ({ name, email, phone, password }) => {
  await request(app).post("/api/auth/register").send({ name, email, phone, password }).expect(201);
  const loginResponse = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
  return loginResponse.body;
};

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
  process.env.ADMIN_EMAILS = "admin@example.com";
});

beforeEach(() => {
  mockUsers.splice(0, mockUsers.length);
  mockRides.splice(0, mockRides.length);
  mockUserIdCounter = 0;
  mockRideIdCounter = 0;
});

describe("auth profile flow", () => {
  test("registers user and allows profile updates", async () => {
    const auth = await registerAndLogin({
      name: "Member One",
      email: "member1@example.com",
      phone: "5715550101",
      password: "password123",
    });

    expect(auth.user.role).toBe("member");

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${auth.token}`)
      .expect(200);

    expect(me.body.user.email).toBe("member1@example.com");

    const update = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${auth.token}`)
      .send({ name: "Member One Updated", phone: "5715550102" })
      .expect(200);

    expect(update.body.user.name).toBe("Member One Updated");
    expect(update.body.user.phone).toBe("5715550102");
  });
});

describe("ride workflow and admin dispatch", () => {
  test("admin can progress rides pending to confirmed to completed", async () => {
    const member = await registerAndLogin({
      name: "Member Rider",
      email: "member2@example.com",
      phone: "5715550103",
      password: "password123",
    });

    const createRide = await request(app)
      .post("/api/rides")
      .set("Authorization", `Bearer ${member.token}`)
      .send({
        tripType: "one-way",
        mobilityType: "wheelchair",
        pickupLocation: "123 Main St",
        dropoffLocation: "General Hospital",
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        notes: "Bring wheelchair support",
      })
      .expect(201);

    const rideId = createRide.body.ride._id;

    const admin = await registerAndLogin({
      name: "Admin User",
      email: "admin@example.com",
      phone: "5715550104",
      password: "password123",
    });
    expect(admin.user.role).toBe("admin");

    const adminDashboard = await request(app)
      .get("/api/rides/admin/dashboard")
      .set("Authorization", `Bearer ${admin.token}`)
      .expect(200);

    expect(adminDashboard.body.stats.totalRides).toBeGreaterThanOrEqual(1);

    await request(app)
      .patch(`/api/rides/${rideId}/status`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "confirmed" })
      .expect(200);

    await request(app)
      .patch(`/api/rides/${rideId}/status`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "completed" })
      .expect(200);
  });

  test("blocks invalid status transitions", async () => {
    const member = await registerAndLogin({
      name: "Member Three",
      email: "member3@example.com",
      phone: "5715550106",
      password: "password123",
    });

    const createRide = await request(app)
      .post("/api/rides")
      .set("Authorization", `Bearer ${member.token}`)
      .send({
        tripType: "round-trip",
        mobilityType: "ambulatory",
        pickupLocation: "111 A St",
        dropoffLocation: "222 B St",
        dateTime: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(201);

    const adminPassword = await bcrypt.hash("password123", 10);
    mockUsers.push({
      _id: "u99",
      name: "Admin Two",
      email: "admin@example.com",
      phone: "5715550107",
      password: adminPassword,
      role: "admin",
      save: async function save() {
        return this;
      },
    });
    const admin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" })
      .expect(200);

    await request(app)
      .patch(`/api/rides/${createRide.body.ride._id}/status`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ status: "completed" })
      .expect(400);
  });
});
