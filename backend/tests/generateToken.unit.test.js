const jwt = require("jsonwebtoken");
const generateToken = require("../src/utils/generateToken");

describe("generateToken", () => {
  test("creates JWT with userId payload", () => {
    process.env.JWT_SECRET = "unit-secret";
    const token = generateToken("abc123");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe("abc123");
  });
});
