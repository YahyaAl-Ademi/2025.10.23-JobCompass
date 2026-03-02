// controllers/changePassword.js
import connectNeonDB from "../db/connectNeonDB.js";
import bcrypt from "bcrypt";
import { logError } from "../util/logging.js";
import { createHttpError } from "../middleware/errorHandler.js";

export default async function changePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !currentPassword || !newPassword) {
    return next(createHttpError(400, "Missing fields"));
  }

  const { connectedClient, error, endConnection } = await connectNeonDB();
  if (error) return next(createHttpError(500, error.message));

  try {
    const result = await connectedClient.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id],
    );
    const user = result.rows[0];

    if (!user) return next(createHttpError(404, "User not found"));

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return next(createHttpError(401, "Current password is incorrect"));

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connectedClient.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, user_id],
    );

    res.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    logError(err);
    return next(createHttpError(500, "Server error"));
  } finally {
    await endConnection();
  }
}
