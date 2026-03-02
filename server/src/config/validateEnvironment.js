const REQUIRED_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "X_RAPIDAPI_KEY",
  "LINKEDIN_SCRAPER_KEY",
  "JWT_EXPIRES_IN",
  "JWT_SECRET",
  "DONATION_URL",
  "GOOGLE_MAPS_API_KEY",
  "VITE_FRONTEND_URL",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "STORAGE_BUCKET",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "OPENAI_API_KEY",
];

export default function validateEnvironment() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}
