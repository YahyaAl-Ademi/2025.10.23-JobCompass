/**
 * Validates a job object to ensure it meets the criteria for database insertion
 * @param {Object} job - The job object to validate
 * @returns {boolean} - True if the job is valid, false otherwise
 */
export default function validateJob(job) {
  // Check if job date is within the last 30 days
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (new Date(job.date_posted) < oneMonthAgo) {
    return false;
  }

  // Check if all required fields are non-null
  // (excluding travel_time, least_transfers, and work_mode)
  const hasNullValues = Object.entries(job)
    .filter(
      ([key]) =>
        key !== "travel_time" &&
        key !== "least_transfers" &&
        key !== "work_mode",
    )
    .some(([, value]) => value === null);

  return !hasNullValues;
}
