import admin from "firebase-admin";

const rawServiceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!rawServiceAccount) {
  throw new Error(
    "Configuration error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set or is empty.",
  );
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(rawServiceAccount);
} catch (err) {
  throw new Error(
    `Configuration error: GOOGLE_APPLICATION_CREDENTIALS must contain valid JSON. Original error: ${err.message}`,
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

export default bucket;
