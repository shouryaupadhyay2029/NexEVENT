import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/storage";
import { logFirebaseError } from "../firebase/errorLogging";

/**
 * Uploads a file to Firebase Storage under events/{eventId}/cover-image.
 * Supports progress tracking.
 */
export const uploadEventImage = async (file, eventId, onProgress) => {
  console.log("[uploadEventImage] Starting upload.", {
    eventId,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
  });
  const id = eventId || Math.random().toString(36).substring(2, 11);
  const storageRef = ref(storage, `events/${id}/cover-image`);
  console.log("[uploadEventImage] Storage reference created.", {
    bucket: storage.app.options.storageBucket,
    fullPath: storageRef.fullPath,
  });
  console.log("[uploadEventImage] Calling uploadBytesResumable...");
  const uploadTask = uploadBytesResumable(storageRef, file);
  console.log("[uploadEventImage] uploadBytesResumable returned upload task.", {
    taskState: uploadTask.snapshot.state,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          : 0;

        console.log("[uploadEventImage] Upload progress.", {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round(progress),
          state: snapshot.state,
        });

        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        logFirebaseError("[uploadEventImage] Storage upload failed.", error);
        reject(error);
      },
      async () => {
        console.log("[uploadEventImage] Upload completed. Getting download URL...");
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("[uploadEventImage] Download URL retrieved.", {
            fullPath: uploadTask.snapshot.ref.fullPath,
          });
          resolve(downloadURL);
        } catch (error) {
          logFirebaseError("[uploadEventImage] Failed to retrieve download URL.", error);
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
  try {
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    logFirebaseError("[deleteEventImage] Failed to delete event image.", error);
    throw error;
  }
};

/**
 * Resolves the download URL for a given storage path.
 */
export const getImageURL = async (path) => {
  const storageRef = ref(storage, path);
  try {
    return await getDownloadURL(storageRef);
  } catch (error) {
    logFirebaseError("[getImageURL] Failed to resolve image URL.", error);
    throw error;
  }
};
