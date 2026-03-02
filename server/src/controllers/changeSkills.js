import connectNeonDB from "../db/connectNeonDB.js";
import { logError } from "../util/logging.js";
import { createHttpError } from "../middleware/errorHandler.js";

export default async function changeSkills(req, res, next) {
  const user_id = req.user?.id;
  const { skills } = req.body;

  if (!user_id) return next(createHttpError(401, "User not authenticated"));

  if (
    !skills ||
    !Array.isArray(skills) ||
    (skills.length !== 0 && skills.some((skill) => typeof skill !== "string"))
  )
    return next(
      createHttpError(
        400,
        "Only an array of strings (or empty array) is allowed",
      ),
    );

  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) return next(createHttpError(503, "Database connection error"));

  try {
    const result = await connectedClient.query(
      `UPDATE users
      SET skills = $1
      WHERE id = $2
      RETURNING *`,
      [skills.join(","), user_id],
    );

    if (result.rowCount === 0) {
      return next(createHttpError(404, "User not found after update"));
    }

    res.status(200).json({
      success: true,
      msg: "Skills are updated",
    });
  } catch (err) {
    logError(err);
    return next(
      createHttpError(
        500,
        "Sorry, there's an error with the DB. Unable to update skills",
      ),
    );
  } finally {
    if (endConnection) await endConnection();
  }
}
