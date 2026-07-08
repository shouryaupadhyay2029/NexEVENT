import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, getDocsFromCache, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/config";
import { logFirebaseError } from "../firebase/errorLogging";
import { createNotification } from "./notificationService";
import { resolveEventStatus } from "../utils/eventLifecycle";
import { verifyUserPermission } from "./permissionService";

const COLLECTION_NAME = "events";

/**
 * Creates a new event with the required data structure and default values.
 */
export const createEvent = async (eventData) => {
  console.log("[createEvent] Starting Firestore event creation.");
  const eventsCol = collection(db, COLLECTION_NAME);
  const newDocRef = doc(eventsCol);
  console.log("[createEvent] Generated document reference.", {
    collection: COLLECTION_NAME,
    id: newDocRef.id,
    path: newDocRef.path,
  });

  const { uid, profile: userProfile } = await verifyUserPermission(["organizer", "admin"]);
  const role = userProfile.role;

  const initialStatus = eventData.status || "draft";
  const nowStr = new Date().toISOString();

  const defaultEvent = {
    id: newDocRef.id,
    creatorId: currentUser?.uid || "",
    creatorName: currentUser?.displayName || currentUser?.email || "Unknown Creator",
    clubId: userProfile?.clubId || null,
    clubName: userProfile?.clubName || null,
    role: role,
    title: eventData.title || "",
    description: eventData.description || "",
    category: eventData.category || "",
    image: eventData.image || "",
    venue: eventData.venue || "",
    organizer: eventData.organizer || "",
    date: eventData.date || "",
    time: eventData.time || "",
    capacity: eventData.capacity ? Number(eventData.capacity) : 0,
    registeredCount: eventData.registeredCount || 0,
    registrationDeadline: eventData.registrationDeadline || "",
    
    // Lifecycle Status Parameters
    status: initialStatus,
    publishedAt: initialStatus !== "draft" ? nowStr : null,
    completedAt: null,
    archivedAt: null,
    lastStatusChange: nowStr,

    // Analytics Preparation Fields
    views: 0,
    shares: 0,
    registrations: 0,
    checkIns: 0,
    favorites: 0,

    createdAt: nowStr,
    updatedAt: nowStr,
  };

  try {
    console.log("[createEvent] Creating Firestore document with setDoc...");
    await setDoc(newDocRef, defaultEvent);
    console.log("[createEvent] Firestore success.", {
      id: newDocRef.id,
      path: newDocRef.path,
    });
    return defaultEvent;
  } catch (error) {
    logFirebaseError("[createEvent] Firestore failed.", error);
    throw error;
  }
};


export const getEvent = async (eventId) => {
  const docRef = doc(db, COLLECTION_NAME, eventId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      data.status = resolveEventStatus(data);
      return data;
    }
  } catch (error) {
    logFirebaseError("[getEvent] Failed to fetch event.", error);
  }
  return null;
};

export const getAllEvents = async () => {
  const eventsCol = collection(db, COLLECTION_NAME);
  try {
    const querySnapshot = await getDocs(eventsCol);
    const events = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      data.status = resolveEventStatus(data);
      events.push(data);
    });
    return events;
  } catch (error) {
    logFirebaseError("[getAllEvents] Firestore fetch failed. Falling back to local cache/empty.", error);
    try {
      const querySnapshot = await getDocsFromCache(eventsCol);
      const events = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.status = resolveEventStatus(data);
        events.push(data);
      });
      return events;
    } catch (cacheError) {
      logFirebaseError("[getAllEvents] Cache fetch also failed.", cacheError);
      return [];
    }
  }
};

const checkPermission = async (eventId) => {
  const { uid, profile } = await verifyUserPermission(["organizer", "admin"]);
  const role = profile.role;
  
  if (role === "admin") return true;
  
  if (eventId) {
    const eventDoc = await getDoc(doc(db, COLLECTION_NAME, eventId));
    if (!eventDoc.exists()) {
      throw new Error("Event not found.");
    }
    const eventData = eventDoc.data();
    if (eventData.creatorId !== uid) {
      throw new Error("403 Access Required: You do not own this event.");
    }
  }
  
  return true;
};

export const updateEvent = async (eventId, eventData) => {
  await checkPermission(eventId);
  const docRef = doc(db, COLLECTION_NAME, eventId);
  const updateData = {
    updatedAt: new Date().toISOString(),
    ...eventData,
  };
  try {
    await updateDoc(docRef, updateData);
    const updatedSnap = await getDoc(docRef);
    const updatedEvent = updatedSnap.data();

    // Notify registered attendees in the background
    const registrationsCol = collection(db, "registrations");
    const q = query(registrationsCol, where("eventId", "==", eventId));
    getDocs(q).then((snap) => {
      snap.forEach((docSnap) => {
        const reg = docSnap.data();
        createNotification(
          reg.userId,
          "event_updated",
          "Event Details Updated",
          `The details for event "${updatedEvent.title}" have been updated by the organizer.`,
          eventId,
          { category: updatedEvent.category || "General" }
        );
      });
    }).catch(err => console.error("Failed to notify attendees of event update:", err));

    return updatedEvent;
  } catch (error) {
    logFirebaseError("[updateEvent] Failed to update event.", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  await checkPermission(eventId);
  const docRef = doc(db, COLLECTION_NAME, eventId);
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    logFirebaseError("[deleteEvent] Failed to delete event.", error);
    throw error;
  }
};

/**
 * Subscribes to real-time events created/managed by a specific organizer.
 * Queries Firestore directly using creatorId to enforce strict UID ownership.
 */
export const subscribeToOrganizerEvents = (userId, onUpdate) => {
  const eventsCol = collection(db, COLLECTION_NAME);
  const q = query(eventsCol, where("creatorId", "==", userId));
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      data.status = resolveEventStatus(data);
      list.push(data);
    });
    onUpdate(list);
  }, (error) => {
    logFirebaseError("[subscribeToOrganizerEvents] Snapshot listener failed.", error);
  });
};

export const duplicateEvent = async (event) => {
  const eventsCol = collection(db, COLLECTION_NAME);
  const newDocRef = doc(eventsCol);
  const { uid, profile: userProfile } = await verifyUserPermission(["organizer", "admin"]);
  const role = userProfile.role;

  const nowStr = new Date().toISOString();
  const duplicated = {
    ...event,
    id: newDocRef.id,
    creatorId: currentUser?.uid || "",
    creatorName: currentUser?.displayName || currentUser?.email || "Unknown Creator",
    clubId: userProfile?.clubId || null,
    clubName: userProfile?.clubName || null,
    role: role,
    title: `Copy of ${event.title}`,
    registeredCount: 0,
    
    // Lifecycle Status Parameters
    status: "draft",
    publishedAt: null,
    completedAt: null,
    archivedAt: null,
    lastStatusChange: nowStr,

    // Analytics Preparation Fields
    views: 0,
    shares: 0,
    registrations: 0,
    checkIns: 0,
    favorites: 0,

    createdAt: nowStr,
    updatedAt: nowStr
  };

  try {
    await setDoc(newDocRef, duplicated);
    return duplicated;
  } catch (error) {
    logFirebaseError("[duplicateEvent] Failed to duplicate event document.", error);
    throw error;
  }
};
