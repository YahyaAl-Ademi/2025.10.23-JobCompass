import normalizeDescription from "./normalizeDescription.js";
import validateJob from "./validateJob.js";

export default function processScraperJob(job) {
  const {
    id,
    applyUrl: url,
    title,
    postedAt: date_posted,
    employmentType: employment_type,
    location,
    seniorityLevel: normalizedSeniority,
    descriptionText = "",
    descriptionHtml: description_text = "",
    companyName: organization,
    companyWebsite: organization_url,
    companyLogo: organization_logo,
  } = job || {};
  
  const processedJob = {
    id,
    url,
    title,
    date_posted,
    employment_type: employment_type || null,
    work_mode: null,
    display_location: location || null,
    seniority: normalizedSeniority,
    description_text,
    normalized_description:
      normalizeDescription(title) + normalizeDescription(descriptionText),
    travel_time: null,
    least_transfers: null,
    organization,
    organization_url,
    organization_logo,
  };

  return validateJob(processedJob) ? processedJob : null;
}
