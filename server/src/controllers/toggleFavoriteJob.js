import connectNeonDB from "../db/connectNeonDB.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";

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

    if (exists.rows.length > 0) {
      //  Remove favorite
      //  Best practice: Consider wrapping delete and insert operations in a transaction
      await connectedClient.query(
        "DELETE FROM user_favorites WHERE user_id = $1 AND job_id = $2",
        [user_id, jobId],
      );
      return res.status(200).json({ success: true, action: "removed", job });
    }

    //  Add favorite and store per-user travel metadata on the relation
    const insertFavoriteResult = await connectedClient.query(
      "INSERT INTO user_favorites (user_id, job_id, adding_date, travel_time, least_transfers) VALUES ($1, $2, NOW(), $3, $4) RETURNING adding_date",
      [user_id, jobId, job.travel_time, job.least_transfers],
    );

    return res.status(200).json({
      success: true,
      action: "added",
      job: {
        ...job,
        adding_date: insertFavoriteResult.rows[0].adding_date,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Failed to toggle favorite"));
  } finally {
    if (endConnection) await endConnection();
  }
}
