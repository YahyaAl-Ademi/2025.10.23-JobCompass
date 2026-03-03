import connectNeonDB from "../db/connectNeonDB.js";
import bcrypt from "bcrypt";
import { createHttpError } from "../middleware/errorHandler.js";
import { PASSWORD_HASH_COST_FACTOR } from "../config/security.js";
import { logError } from "../util/logging.js";

const USER_FULL_INFO_QUERY = `
  SELECT
    u.id AS user_id, u.email, u.password, u.first_name, u.last_name, u.avatar,
    u.street, u.house_number, u.city, u.country, u.skills,
    uf.travel_time, uf.least_transfers,
    j.id AS job_id, j.date_posted, j.title, j.organization, j.organization_url,
    j.employment_type, j.url, j.organization_logo, j.display_location,
    j.work_mode, j.seniority, j.description_text, j.normalized_description
  FROM users u
  LEFT JOIN user_favorites uf ON u.id = uf.user_id
  LEFT JOIN jobs j ON uf.job_id = j.id
`;

const ALLOWED_PROFILE_FIELDS = new Set([
  "first_name",
  "last_name",
  "street",
  "house_number",
  "city",
  "country",
  "skills",
]);

export default async function updateUserProfile(user_id, fieldsToUpdate) {
  const { currentPassword, newPassword, ...profileFields } = fieldsToUpdate;
  let setParts = [];
  let values = [];
  let i = 1;

  const providedProfileKeys = Object.keys(profileFields).filter(
    (key) => profileFields[key] !== undefined,
  );

  if (providedProfileKeys.includes("password")) {
    throw createHttpError(
      400,
      "Direct password updates are not allowed. Use currentPassword and newPassword.",
    );
  }

  const invalidProfileKeys = providedProfileKeys.filter(
    (key) => !ALLOWED_PROFILE_FIELDS.has(key),
  );

  if (invalidProfileKeys.length > 0) {
    throw createHttpError(
      400,
      `Invalid profile fields: ${invalidProfileKeys.join(", ")}`,
    );
  }

  for (const key of providedProfileKeys) {
    let value = profileFields[key];

    if (key === "skills") {
      if (Array.isArray(value)) value = value.join(",");
      else if (value === null) value = null;
      else value = String(value);
    }

    setParts.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    if (endConnection) await endConnection();
    logError(`DB Connection Error: ${error}`);
    throw createHttpError(503, "DB Connection Error");
  }

  try {
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        throw createHttpError(
          400,
          "To change your password, please fill in all fields.",
        );
      }

      const userResult = await connectedClient.query(
        "SELECT password FROM users WHERE id = $1",
        [user_id],
      );

      if (userResult.rows.length === 0) {
        throw createHttpError(404, "User not found");
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        userResult.rows[0].password,
      );

      if (!isMatch) {
        throw createHttpError(401, "Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        PASSWORD_HASH_COST_FACTOR,
      );
      setParts.push(`password = $${i}`);
      values.push(hashedPassword);
      i++;
    }

    if (setParts.length === 0) {
      throw createHttpError(400, "No fields provided to update");
    }

    values.push(user_id);
    const updateUserIdIndex = i;
    const updateQuery = `
      UPDATE users
      SET ${setParts.join(", ")}
      WHERE id = $${updateUserIdIndex}
    `;

    await connectedClient.query(updateQuery, values);

    const fetchQuery = `${USER_FULL_INFO_QUERY} WHERE u.id = $1`;
    const result = await connectedClient.query(fetchQuery, [user_id]);

    if (result.rows.length === 0) {
      throw createHttpError(404, "User not found after update");
    }

    const rows = result.rows;
    const userDataRow = rows[0];

    const updatedUser = {
      id: userDataRow.user_id,
      email: userDataRow.email,
      first_name: userDataRow.first_name,
      last_name: userDataRow.last_name,
      avatar: userDataRow.avatar,
      street: userDataRow.street,
      house_number: userDataRow.house_number,
      city: userDataRow.city,
      country: userDataRow.country,
      skills: userDataRow.skills ? userDataRow.skills.split(",") : [],
      favorites: [],
    };

    rows.forEach((row) => {
      if (row.job_id) {
        const jobFavorite = {
          id: row.job_id,
          date_posted: row.date_posted,
          title: row.title,
          organization: row.organization,
          organization_url: row.organization_url,
          employment_type: row.employment_type,
          url: row.url,
          organization_logo: row.organization_logo,
          display_location: row.display_location,
          work_mode: row.work_mode,
          seniority: row.seniority,
          description_text: row.description_text,
          travel_time: row.travel_time,
          least_transfers: row.least_transfers,
          normalized_description: row.normalized_description,
        };
        updatedUser.favorites.push(jobFavorite);
      }
    });

    return updatedUser;
  } finally {
    if (endConnection) await endConnection();
  }
}
