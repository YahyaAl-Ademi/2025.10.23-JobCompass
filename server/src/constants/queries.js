export const USER_FULL_INFO_QUERY = `
  SELECT
    u.id AS user_id, u.email, u.password, u.first_name, u.last_name, u.avatar,
    u.street, u.house_number, u.city, u.country, u.skills, u.number_of_logins,
    uf.travel_time, uf.least_transfers, uf.adding_date,
    j.id AS job_id, j.date_posted, j.title, j.organization, j.organization_url,
    j.employment_type, j.url, j.organization_logo, j.display_location,
    j.work_mode, j.seniority, j.description_text, j.normalized_description
  FROM users u
  LEFT JOIN user_favorites uf ON u.id = uf.user_id
  LEFT JOIN jobs j ON uf.job_id = j.id
`;
