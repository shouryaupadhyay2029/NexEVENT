import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, getDocsFromCache, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/config";
import { logFirebaseError } from "../firebase/errorLogging";
import { createNotification } from "./notificationService";

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

  const defaultEvent = {
    id: newDocRef.id,
    creatorId: auth.currentUser?.uid || "",
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
    status: eventData.status || "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      return docSnap.data();
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
      events.push(doc.data());
    });
    return events;
  } catch (error) {
    logFirebaseError("[getAllEvents] Firestore fetch failed. Falling back to local cache/empty.", error);
    try {
      const querySnapshot = await getDocsFromCache(eventsCol);
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data());
      });
      return events;
    } catch (cacheError) {
      logFirebaseError("[getAllEvents] Cache fetch also failed.", cacheError);
      return [];
    }
  }
};

export const updateEvent = async (eventId, eventData) => {
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
 * Filters client-side to handle fallback on text organizer matches.
 */
export const subscribeToOrganizerEvents = (userId, userDisplayName, onUpdate) => {
  const eventsCol = collection(db, COLLECTION_NAME);
  return onSnapshot(eventsCol, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.creatorId === userId || 
        (data.organizer && data.organizer.toLowerCase() === (userDisplayName || '').toLowerCase())
      ) {
        list.push(data);
      }
    });
    onUpdate(list);
  }, (error) => {
    logFirebaseError("[subscribeToOrganizerEvents] Snapshot listener failed.", error);
  });
};

/**
 * Duplicates an existing event under the current user's creator ID.
 */
export const duplicateEvent = async (event) => {
  const eventsCol = collection(db, COLLECTION_NAME);
  const newDocRef = doc(eventsCol);
  
  const duplicated = {
    ...event,
    id: newDocRef.id,
    creatorId: auth.currentUser?.uid || "",
    title: `Copy of ${event.title}`,
    registeredCount: 0,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(newDocRef, duplicated);
    return duplicated;
  } catch (error) {
    logFirebaseError("[duplicateEvent] Failed to duplicate event document.", error);
    throw error;
  }
};
