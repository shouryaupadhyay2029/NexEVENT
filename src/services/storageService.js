import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/storage";

/**
 * Uploads a file to Firebase Storage under events/{eventId}/cover-image.
 * Supports progress tracking.
 */
export const uploadEventImage = async (file, eventId, onProgress) => {
  const id = eventId || Math.random().toString(36).substring(2, 11);
  const storageRef = ref(storage, `events/${id}/cover-image`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Deletes an event image from Firebase Storage.
 */
export const deleteEventImage = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
  return true;
};

/**
 * Resolves the download URL for a given storage path.
 */
export const getImageURL = async (path) => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};
