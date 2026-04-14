import connectNeonDB from "../db/connectNeonDB.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";
import mapUserFromJoinRows from "../util/map_user_details_with_favorites.js";

const USER_FAVORITES_QUERY = `
  SELECT
    u.id AS user_id, u.email, u.first_name, u.last_name, u.avatar,
    u.street, u.house_number, u.city, u.country, u.skills,
    uf.travel_time, uf.least_transfers, uf.adding_date,
    j.id AS job_id, j.date_posted, j.title, j.organization, j.organization_url,
    j.employment_type, j.url, j.organization_logo, j.display_location,
    j.work_mode, j.seniority, j.description_text, j.normalized_description
  FROM users u
  LEFT JOIN user_favorites uf ON u.id = uf.user_id
  LEFT JOIN jobs j ON uf.job_id = j.id
`;

export default async function toggleFavoriteJob(req, res, next) {
  const user_id = req.user?.id;
  const { job } = req.body;
  const jobId = job?.id;

  //  Check if user is authenticated
  if (!user_id) return next(createHttpError(401, "User not authenticated"));

  //  Check if jobId is provided
  if (!jobId) return next(createHttpError(400, "job.id is required"));

  //  Validate job object
  if (!job || !job.title) {
    return next(createHttpError(400, "Invalid job: title is required"));
  }

  const { connectedClient, endConnection, error } = await connectNeonDB();

  //  Handle database connection error
  if (error) {
    if (endConnection) await endConnection();
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const existingJob = await connectedClient.query(
      "SELECT id FROM jobs WHERE id = $1",
      [jobId],
    );
    // 2️ If it does not exist → insert it into the jobs table
    //  Best practice: Consider using transactions when inserting multiple tables
    if (existingJob.rows.length === 0) {
      // Insert core job data (without per-user travel fields)
      await connectedClient.query(
        `INSERT INTO jobs 
          (id, title, organization, organization_url, employment_type, url, 
           organization_logo, display_location, work_mode, seniority, description_text,
           date_posted, normalized_description)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          jobId,
          job.title || null,
          job.organization || null,
          job.organization_url || null,
          job.employment_type || null,
          job.url || null,
          job.organization_logo || null,
          job.display_location || null,
          job.work_mode || null,
          job.seniority || null,
          job.description_text || null,
          job.date_posted || null,
          job.normalized_description || null,
        ],
      );
    }

    // 3️ Check if this favorite exists for this user
    const exists = await connectedClient.query(
      "SELECT 1 FROM user_favorites WHERE user_id = $1 AND job_id = $2",
      [user_id, jobId],
    );

    let action;
    if (exists.rows.length > 0) {
      //  Remove favorite
      await connectedClient.query(
        "DELETE FROM user_favorites WHERE user_id = $1 AND job_id = $2",
        [user_id, jobId],
      );
      action = "removed";
    } else {
      //  Add favorite
      await connectedClient.query(
        "INSERT INTO user_favorites (user_id, job_id, adding_date, travel_time, least_transfers) VALUES ($1, $2, NOW(), $3, $4)",
        [user_id, jobId, job.travel_time, job.least_transfers],
      );
      action = "added";
    }

    // Fetch the updated user favorites list
    const result = await connectedClient.query(
      `${USER_FAVORITES_QUERY} WHERE u.id = $1`,
      [user_id],
    );

    const updatedUser = mapUserFromJoinRows(result.rows);

    return res.status(200).json({
      success: true,
      action,
      favorites: updatedUser.favorites,
    });
  } catch (err) {
    return next(createHttpError(500, "Failed to toggle favorite"));
  } finally {
    if (endConnection) await endConnection();
  }
}
