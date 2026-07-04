import { collection, doc, setDoc, deleteDoc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { logFirebaseError } from "../firebase/errorLogging";
import { getEvent } from "./eventService";
import { logActivity } from "./notificationService";

const COLLECTION_NAME = "bookmarks";

/**
 * Bookmark an event for a user.
 * Avoids duplicates by using a deterministic document ID: `${userId}_${eventId}`.
 */
export const addBookmark = async (userId, eventId) => {
  if (!userId || !eventId) throw new Error("Invalid parameters for bookmarking.");
  const bookmarkId = `${userId}_${eventId}`;
  const bookmarkRef = doc(db, COLLECTION_NAME, bookmarkId);
  const data = {
    userId,
    eventId,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(bookmarkRef, data);
    
    // Log activity
    getEvent(eventId).then(event => {
      if (event) {
        logActivity(userId, `Bookmarked ${event.category || 'Event'}: "${event.title}"`, { eventId });
      }
    }).catch(err => console.error("Activity logging failed on addBookmark:", err));

    return data;
  } catch (error) {
    logFirebaseError("[addBookmark] Failed to create bookmark document.", error);
    throw error;
  }
};

/**
 * Remove an event bookmark for a user.
 */
export const removeBookmark = async (userId, eventId) => {
  if (!userId || !eventId) throw new Error("Invalid parameters for removing bookmark.");
  const bookmarkId = `${userId}_${eventId}`;
  const bookmarkRef = doc(db, COLLECTION_NAME, bookmarkId);
  try {
    const event = await getEvent(eventId);
    await deleteDoc(bookmarkRef);
    
    // Log activity
    if (event) {
      logActivity(userId, `Removed Bookmark for ${event.category || 'Event'}: "${event.title}"`, { eventId });
    } else {
      logActivity(userId, `Removed Bookmark`, { eventId });
    }

    return true;
  } catch (error) {
    logFirebaseError("[removeBookmark] Failed to delete bookmark document.", error);
    throw error;
  }
};

/**
 * Check if a specific event is bookmarked by a user.
 */
export const checkUserBookmark = async (userId, eventId) => {
  if (!userId || !eventId) return false;
  const bookmarkId = `${userId}_${eventId}`;
  const bookmarkRef = doc(db, COLLECTION_NAME, bookmarkId);
  try {
    const docSnap = await getDoc(bookmarkRef);
    return docSnap.exists();
  } catch (error) {
    logFirebaseError("[checkUserBookmark] Error checking bookmark status.", error);
    return false;
  }
};

/**
 * Get all bookmarks registered under a user.
 */
export const getUserBookmarks = async (userId) => {
  if (!userId) return [];
  const bookmarksCol = collection(db, COLLECTION_NAME);
  const q = query(bookmarksCol, where("userId", "==", userId));
  try {
    const querySnapshot = await getDocs(q);
    const bookmarks = [];
    querySnapshot.forEach((doc) => {
      bookmarks.push(doc.data());
    });
    return bookmarks;
  } catch (error) {
    logFirebaseError("[getUserBookmarks] Failed to fetch user bookmarks.", error);
    return [];
  }
};

/**
 * Get all bookmarks registered under a specific event.
 */
export const getEventBookmarks = async (eventId) => {
  if (!eventId) return [];
  const bookmarksCol = collection(db, COLLECTION_NAME);
  const q = query(bookmarksCol, where("eventId", "==", eventId));
  try {
    const querySnapshot = await getDocs(q);
    const bookmarks = [];
    querySnapshot.forEach((doc) => {
      bookmarks.push(doc.data());
    });
    return bookmarks;
  } catch (error) {
    logFirebaseError("[getEventBookmarks] Failed to fetch event bookmarks.", error);
    return [];
  }
};
