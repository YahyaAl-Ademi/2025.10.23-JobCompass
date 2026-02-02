export function findFilterOptions(allJobs) {
  const experienceSet = new Set();
  const jobTypeSet = new Set();
  const workModeSet = new Set();
  for (const job of allJobs) {
    if (job.seniority) {
      experienceSet.add(job.seniority);
    }
    if (job.employment_type) {
      jobTypeSet.add(job.employment_type);
    }
    if (job.work_mode) {
      workModeSet.add(job.work_mode);
    }
  }
  return {
    experienceOptions: Array.from(experienceSet),
    jobTypeOptions: Array.from(jobTypeSet),
    workModeOptions: Array.from(workModeSet),
    locationPrecisionOptions: ["precise", "approximate"],
  };
}

export function filterJobs(allJobs, activeFilters) {
  const { seniorityLevel, employmentType, work_mode, locationPrecision } =
    activeFilters;
  let filtered = allJobs.filter((job) => {
    const matchesSeniority =
      seniorityLevel.size === 0 || seniorityLevel.has(job.seniority);
    const matchesJobType =
      employmentType.size === 0 || employmentType.has(job.employment_type);
    const matcheswork_mode =
      work_mode.size === 0 || work_mode.has(job.work_mode);
    const matchesLocationPrecision =
      locationPrecision.size === 0 ||
      (locationPrecision.has("approximate") && job.travel_time === null) ||
      (locationPrecision.has("precise") && job.travel_time !== null);
    return (
      matchesSeniority &&
      matchesJobType &&
      matcheswork_mode &&
      matchesLocationPrecision
    );
  });
  return filtered;
}
