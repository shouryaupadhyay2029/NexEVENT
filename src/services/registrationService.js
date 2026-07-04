import { collection, doc, query, where, getDocs, deleteDoc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { logFirebaseError } from "../firebase/errorLogging";
import { createNotification, logActivity } from "./notificationService";
import { getEventBookmarks } from "./bookmarkService";
import { getEvent } from "./eventService";

const COLLECTION_NAME = "registrations";

/**
 * Checks if a user is already registered for a specific event.
 */
export const checkUserRegistration = async (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registrationId = `${userId}_${eventId}`;
  const registrationRef = doc(db, COLLECTION_NAME, registrationId);
  try {
    const docSnap = await getDoc(registrationRef);
    return docSnap.exists();
  } catch (error) {
    logFirebaseError("[checkUserRegistration] Error checking registration status.", error);
    return false;
  }
};

/**
 * Registers a user for an event using a Firestore Transaction.
 * Validates authentication, event status, capacity, and duplicate registrations.
 */
export const registerForEvent = async (userId, eventId) => {
  if (!userId) throw new Error("You must be logged in to register.");
  if (!eventId) throw new Error("Invalid event identifier.");

  const registrationId = `${userId}_${eventId}`;
  const registrationRef = doc(db, COLLECTION_NAME, registrationId);
  const eventRef = doc(db, "events", eventId);

  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Fetch event and registration document
      const eventSnap = await transaction.get(eventRef);
      const registrationSnap = await transaction.get(registrationRef);

      if (!eventSnap.exists()) {
        throw new Error("This event could not be found.");
      }

      const eventData = eventSnap.data();

      // 2. Validate user registration status
      if (registrationSnap.exists()) {
        throw new Error("You are already registered for this event.");
      }

      // 3. Validate event registration status is open
      if (eventData.status?.toLowerCase() !== "open") {
        throw new Error("Registration for this event is closed.");
      }

      // 4. Validate seat capacity
      const capacity = parseInt(eventData.capacity) || 0;
      const currentRegistered = parseInt(eventData.registeredCount) || 0;
      if (currentRegistered >= capacity) {
        throw new Error("This event is fully booked.");
      }

      // 5. Build registration document
      const registrationData = {
        userId,
        eventId,
        registeredAt: new Date().toISOString(),
        status: "confirmed"
      };

      // 6. Write registration and update event count
      transaction.set(registrationRef, registrationData);

      const newRegisteredCount = currentRegistered + 1;
      const updateData = {
        registeredCount: newRegisteredCount,
        updatedAt: new Date().toISOString()
      };

      // 7. If capacity reached, close the registration
      if (newRegisteredCount >= capacity) {
        updateData.status = "closed";
      }

      transaction.update(eventRef, updateData);

      return { 
        registration: registrationData, 
        newRegisteredCount, 
        newStatus: updateData.status || eventData.status,
        eventTitle: eventData.title || "Event",
        eventCategory: eventData.category || "General"
      };
    });

    // Send notifications and log activity after successful transaction
    createNotification(
      userId,
      "registration_success",
      "Registration Successful",
      `You are now registered for the event: "${result.eventTitle}".`,
      eventId,
      { category: result.eventCategory }
    );

    logActivity(
      userId,
      `Registered for ${result.eventCategory || 'Event'}: "${result.eventTitle}"`,
      { eventId }
    );

    if (result.newStatus === "closed") {
      getEventBookmarks(eventId).then((bookmarks) => {
        bookmarks.forEach((bm) => {
          if (bm.userId !== userId) {
            createNotification(
              bm.userId,
              "registration_closed",
              "Registration Closed",
              `The event you bookmarked, "${result.eventTitle}", is now fully booked.`,
              eventId,
              { category: result.eventCategory }
            );
          }
        });
      }).catch(err => console.error("Failed to fetch bookmarks for closed event notifications:", err));
    }

    return result;
  } catch (error) {
    logFirebaseError("[registerForEvent] Registration transaction failed.", error);
    throw error;
  }
};

export const cancelRegistration = async (registrationId) => {
  const docRef = doc(db, COLLECTION_NAME, registrationId);
  try {
    const [userId, eventId] = registrationId.split('_');
    const event = await getEvent(eventId);
    await deleteDoc(docRef);

    if (event) {
      logActivity(
        userId,
        `Cancelled Registration for ${event.category || 'Event'}: "${event.title}"`,
        { eventId }
      );
    } else {
      logActivity(userId, `Cancelled Registration`, { eventId });
    }
    return true;
  } catch (error) {
    logFirebaseError("[cancelRegistration] Failed to cancel registration.", error);
    throw error;
  }
};

export const getUserRegistrations = async (userId) => {
  const registrationsCol = collection(db, COLLECTION_NAME);
  const q = query(registrationsCol, where("userId", "==", userId));
  try {
    const querySnapshot = await getDocs(q);
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push(doc.data());
    });
    return registrations;
  } catch (error) {
    logFirebaseError("[getUserRegistrations] Failed to fetch user registrations.", error);
    throw error;
  }
};

export const getEventRegistrations = async (eventId) => {
  const registrationsCol = collection(db, COLLECTION_NAME);
  const q = query(registrationsCol, where("eventId", "==", eventId));
  try {
    const querySnapshot = await getDocs(q);
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push(doc.data());
    });
    return registrations;
  } catch (error) {
    logFirebaseError("[getEventRegistrations] Failed to fetch event registrations.", error);
    throw error;
  }
};
