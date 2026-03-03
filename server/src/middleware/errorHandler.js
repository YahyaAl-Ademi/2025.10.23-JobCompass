import { logError } from "../util/logging.js";

export function createHttpError(status, messageText) {
  const error = new Error(messageText);
  error.status = status;
  return error;
}

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const message = err?.message || "Internal server error";
  const statusCode = Number.isInteger(err?.status) ? err.status : 500;
  logError(err);

  const payload = {
    success: false,
    msg: message,
  };

  return res.status(statusCode).json(payload);
}
