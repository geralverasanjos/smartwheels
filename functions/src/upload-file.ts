
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Busboy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  console.log('Admin SDK already initialized.');
}


const storage = admin.storage();

export const uploadFile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { file, path: filePath } = data;
    if (!file || !filePath) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a file and path.');
    }

    const fileBuffer = Buffer.from(file, 'base64');
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, fileBuffer);

    const bucket = storage.bucket();

    try {
        await bucket.upload(tempFilePath, {
            destination: filePath,
            metadata: {
                // You can add more metadata here if needed
                contentType: data.contentType || 'application/octet-stream',
                cacheControl: 'public, max-age=31536000',
            },
        });
        
        fs.unlinkSync(tempFilePath); // Clean up the temporary file

        const fileRef = bucket.file(filePath);
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // A far-future date
        });

        return { downloadURL: url };

    } catch (error) {
        console.error('Error uploading file to Firebase Storage:', error);
        throw new functions.https.HttpsError('internal', 'Unable to upload file.');
    }
});
