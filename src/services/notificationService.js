import { collection, doc, setDoc, updateDoc, writeBatch, query, where, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { logFirebaseError } from "../firebase/errorLogging";

const NOTIFICATIONS_COLLECTION = "notifications";
const ACTIVITIES_COLLECTION = "activities";

/**
 * Creates a new notification document for a user.
 */
export const createNotification = async (userId, type, title, message, eventId = null, metadata = {}) => {
  if (!userId) return null;
  const notifsCol = collection(db, NOTIFICATIONS_COLLECTION);
  const newDocRef = doc(notifsCol);
  
  const notification = {
    id: newDocRef.id,
    userId,
    type,
    title,
    message,
    eventId,
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata
  };

  try {
    await setDoc(newDocRef, notification);
    return notification;
  } catch (error) {
    logFirebaseError("[createNotification] Failed to create notification document.", error);
    return null;
  }
};

/**
 * Logs a new user activity timeline action.
 */
export const logActivity = async (userId, action, metadata = {}) => {
  if (!userId) return null;
  const activitiesCol = collection(db, ACTIVITIES_COLLECTION);
  const newDocRef = doc(activitiesCol);

  const activity = {
    id: newDocRef.id,
    userId,
    action,
    createdAt: new Date().toISOString(),
    metadata
  };

  try {
    await setDoc(newDocRef, activity);
    return activity;
  } catch (error) {
    logFirebaseError("[logActivity] Failed to write user activity timeline document.", error);
    return null;
  }
};

/**
 * Marks a single notification as read.
 */
export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return;
  const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  try {
    await updateDoc(notifRef, { isRead: true });
  } catch (error) {
    logFirebaseError("[markNotificationAsRead] Failed to update read flag.", error);
  }
};

/**
 * Marks all unread notifications of a user as read via a Firestore writeBatch.
 */
export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) return;
  const notifsCol = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(notifsCol, where("userId", "==", userId), where("isRead", "==", false));
  
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;
    
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    logFirebaseError("[markAllNotificationsAsRead] Batch write operation failed.", error);
  }
};

/**
 * Subscribes to real-time user notification updates.
 * Returns unsubscribe callback.
 */
export const subscribeToNotifications = (userId, onUpdate) => {
  if (!userId) return () => {};
  const notifsCol = collection(db, NOTIFICATIONS_COLLECTION);
  // Sort descending by createdAt to get newest notifications first
  const q = query(
    notifsCol,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    onUpdate(list);
  }, (error) => {
    logFirebaseError("[subscribeToNotifications] Realtime subscriber listener error.", error);
  });
};

/**
 * Fetches the user activity logs (max limit items, newest first).
 */
export const getUserActivities = async (userId, limitCount = 20) => {
  if (!userId) return [];
  const activitiesCol = collection(db, ACTIVITIES_COLLECTION);
  const q = query(
    activitiesCol,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  try {
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    logFirebaseError("[getUserActivities] Failed to fetch activity logs.", error);
    return [];
  }
};
