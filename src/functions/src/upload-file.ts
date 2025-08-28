
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
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    // 2. Input Validation
    const { file, path: filePath, contentType } = data;
    if (!file || !filePath || !contentType) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with file (base64 string), path, and contentType.');
    }

    const bucket = storage.bucket(); // Use the default bucket
    const fileRef = bucket.file(filePath);
    
    // Correctly handle the base64 string by converting it to a Buffer
    const fileBuffer = Buffer.from(file, 'base64');

    // 3. Upload to Storage
    try {
        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: contentType,
                cacheControl: 'public, max-age=31536000', // Cache for 1 year
            },
        });

        // 4. Make the file public
        await fileRef.makePublic();

        // 5. Return the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        return { downloadURL: publicUrl };

    } catch (error) {
        console.error('Error uploading file to Firebase Storage:', error);
        // Throw a specific error to help with debugging on the client
        throw new functions.https.HttpsError('internal', 'Unable to upload file. Please check server logs.', error);
    }
});
