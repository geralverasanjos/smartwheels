
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  // This can happen in local development with hot-reloading
  console.log('Admin SDK already initialized.');
}

const storage = admin.storage();

export const uploadFile = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    // 2. Input Validation
    const { file, path: filePath, contentType } = data;
    if (!file || !filePath || !contentType) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with file (base64 string), path, and contentType.');
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(filePath);
    const fileBuffer = Buffer.from(file, 'base64');

    // 3. Upload to Storage
    try {
        // We pipe the buffer to the file in Storage
        await new Promise((resolve, reject) => {
            const stream = fileRef.createWriteStream({
                metadata: {
                    contentType: contentType,
                    cacheControl: 'public, max-age=31536000',
                },
            });
            stream.on('error', (err) => reject(err));
            stream.on('finish', () => resolve(true));
            stream.end(fileBuffer);
        });

        // 4. Get a public URL (or a signed URL if you prefer more security)
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // A very far-future date for a "public" URL
        });

        return { downloadURL: url };

    } catch (error) {
        console.error('Error uploading file to Firebase Storage:', error);
        throw new functions.https.HttpsError('internal', 'Unable to upload file. Please check server logs.');
    }
});
