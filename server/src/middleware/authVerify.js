import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export const blacklistedTokens = [];

// ========================
// VERIFY TOKEN - Middleware
// ========================
export const verifyToken = (req, res, next) => {
  let msg;
  try {
    const token = req.cookies?.token;

    if (!token) {
      msg = "No token provided";
    } else {
      // Verify the token's signature and expiration time
      const decoded = jwt.verify(token, JWT_SECRET);

      if (blacklistedTokens.includes(token)) {
        msg = "Token expired or logged out";
      } else {
        // Token is valid, continue to the next middleware/handler
        req.user = decoded;
        console.log("Token verified for user:", decoded.id);
        return next();
      }
    }
  } catch (err) {
    msg = "Invalid or expired token";
  }

  const route = req.originalUrl;
  if (route.startsWith("/api/jobs/search")) {
    return next();
  } else {
    return res.status(401).json({ success: false, msg });
  }
};
