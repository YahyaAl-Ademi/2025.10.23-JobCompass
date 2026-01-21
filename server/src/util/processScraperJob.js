function normalizeDescription(str) {
  const s = typeof str === "string" ? str : "";
  return " " + s.replace(/[^A-Za-z0-9+#]/g, " ").replace(/ +/g, " ") + " ";
}

export default function processScraperJob(job) {
  const {
    id,
    applyUrl: url,
    title,
    postedAt: date_posted,
    employmentType: employment_type,
    location,
    seniorityLevel: normalizedSeniority,
    descriptionText: description_text = "",
    companyName: organization,
    companyWebsite: organization_url,
    companyLogo: organization_logo,
  } = job || {};
  return {
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
      normalizeDescription(title) + normalizeDescription(description_text),
    travel_time: null,
    least_transfers: null,
    organization,
    organization_url,
    organization_logo,
  };
}
