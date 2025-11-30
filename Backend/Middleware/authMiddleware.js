const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  console.log("\n================ AUTH MIDDLEWARE ================");
  console.log("➡ Incoming request:", req.method, req.originalUrl);

  const authHeader = req.header("Authorization");
  console.log("🔍 AUTH HEADER:", authHeader);

  try {
    // CASE 1: No Authorization header
    if (!authHeader) {
      console.log("❌ No Authorization header found.");
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    let token = null;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("🔑 Extracted Bearer Token:", token);
    } else {
      token = authHeader;
      console.log("⚠ Token provided without Bearer:", token);
    }

    if (!token) {
      console.log("❌ Token extraction failed.");
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    console.log("🔐 Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token verified successfully!");
    console.log("👤 Decoded user:", decoded);

    // Attach user object
    req.user = decoded;

    console.log("➡ Passing to next middleware/route...");
    console.log("=================================================\n");

    next();

  } catch (err) {
    console.log("❌ AUTHENTICATION FAILED");
    console.log("🛑 Error Message:", err.message);
    console.log("=================================================\n");

    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
