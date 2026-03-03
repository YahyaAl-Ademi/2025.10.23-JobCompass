import admin from "firebase-admin";

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
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
