import jwt from "jsonwebtoken";
import { createHttpError } from "./errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET;

/** token -> blacklistUntilMs (drops automatically once past JWT exp) */
const tokenBlacklist = new Map();

export function addTokenToBlacklist(token) {
  const payload = jwt.decode(token);
  const until =
    typeof payload?.exp === "number"
      ? payload.exp * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000;
  tokenBlacklist.set(token, until);
}

function isTokenBlacklisted(token) {
  const until = tokenBlacklist.get(token);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    tokenBlacklist.delete(token);
    return false;
  }
  return true;
}

/** Requires a valid JWT cookie that has not been logged out*/
export function verifyToken(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(createHttpError(401, "No token provided"));
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isTokenBlacklisted(token)) {
      return next(createHttpError(401, "Token expired or logged out"));
    }
    req.user = decoded;
    next();
  } catch {
    next(createHttpError(401, "Invalid or expired token"));
  }
}

/**
 * Sets req.user when the cookie is valid; otherwise req.user is null (guest).
 */
export function attachUserFromCookie(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isTokenBlacklisted(token)) {
      req.user = null;
      return next();
    }
    req.user = decoded;
    next();
  } catch {
    req.user = null;
    next();
  }
}
