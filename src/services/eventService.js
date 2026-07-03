import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, getDocsFromCache } from "firebase/firestore";
import { db } from "../firebase/firestore";

const COLLECTION_NAME = "events";

/**
 * Creates a new event with the required data structure and default values.
 */
export const createEvent = async (eventData) => {
  const eventsCol = collection(db, COLLECTION_NAME);
  const newDocRef = doc(eventsCol);

  const defaultEvent = {
    id: newDocRef.id,
    title: eventData.title || "",
    description: eventData.description || "",
    category: eventData.category || "",
    image: eventData.image || "",
    venue: eventData.venue || "",
    organizer: eventData.organizer || "",
    date: eventData.date || "",
    time: eventData.time || "",
    capacity: eventData.capacity || 0,
    registeredCount: eventData.registeredCount || 0,
    registrationDeadline: eventData.registrationDeadline || "",
    status: eventData.status || "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(newDocRef, defaultEvent);
  return defaultEvent;
};

const withTimeout = (promise, ms = 2500) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout waiting for database response"));
    }, ms);
    
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
};

export const getEvent = async (eventId) => {
  const docRef = doc(db, COLLECTION_NAME, eventId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Failed to fetch event:", error);
  }
  return null;
};

export const getAllEvents = async () => {
  const eventsCol = collection(db, COLLECTION_NAME);
  try {
    const querySnapshot = await withTimeout(getDocs(eventsCol), 2500);
    const events = [];
    querySnapshot.forEach((doc) => {
      events.push(doc.data());
    });
    return events;
  } catch (error) {
    console.warn("Firestore fetch failed or timed out. Falling back to local cache/empty: ", error);
    try {
      const querySnapshot = await getDocsFromCache(eventsCol);
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data());
      });
      return events;
    } catch (cacheError) {
      console.error("Cache fetch also failed: ", cacheError);
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
  await updateDoc(docRef, updateData);
  const updatedSnap = await getDoc(docRef);
  return updatedSnap.data();
};

export const deleteEvent = async (eventId) => {
  const docRef = doc(db, COLLECTION_NAME, eventId);
  await deleteDoc(docRef);
  return true;
};
