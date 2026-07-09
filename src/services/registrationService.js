import { collection, doc, query, where, getDocs, getDoc, runTransaction, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { logFirebaseError } from "../firebase/errorLogging";
import { createNotification, logActivity } from "./notificationService";
import { getEvent } from "./eventService";

import { resolveEventStatus } from "../utils/eventLifecycle";

const COLLECTION_NAME = "registrations";

/**
 * Generates a unique, deterministic ticket ID based on the userId and eventId.
 */
export const generateDeterministicTicketId = (userId, eventId) => {
  const seed = `${userId}_${eventId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let ticketSuffix = "";
  let temp = Math.abs(hash);
  for (let i = 0; i < 9; i++) {
    ticketSuffix += chars[temp % chars.length];
    temp = Math.floor(temp / chars.length);
  }
  while (ticketSuffix.length < 9) {
    ticketSuffix += "X";
  }
  return `NEX-TKT-${ticketSuffix}`;
};

/**
 * Checks if a user is already registered for a specific event.
 */
export const checkUserRegistration = async (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registrationId = `${userId}_${eventId}`;
  const registrationRef = doc(db, COLLECTION_NAME, registrationId);
  try {
    const docSnap = await getDoc(registrationRef);
    return docSnap.exists() && docSnap.data().status !== "cancelled";
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
  const userRef = doc(db, "users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      // 1. Fetch event and registration document
      const eventSnap = await transaction.get(eventRef);
      const registrationSnap = await transaction.get(registrationRef);
      const userSnap = await transaction.get(userRef);

      if (!eventSnap.exists()) {
        throw new Error("This event could not be found.");
      }

      const eventData = eventSnap.data();
      const userProfile = userSnap.exists() ? userSnap.data() : {};
      const userRole = (userProfile.role || "student").toLowerCase().trim();

      // Organizers cannot register for their own events
      if (userRole === "organizer" && eventData.creatorId === userId) {
        throw new Error("Organizers cannot register for their own events.");
      }

      // Admins may register only if explicitly allowed by configuration
      const ALLOW_ADMIN_REGISTRATION = import.meta.env.VITE_ALLOW_ADMIN_REGISTRATION === 'true';
      if (userRole === "admin" && !ALLOW_ADMIN_REGISTRATION) {
        throw new Error("Admin registration is disabled by configuration.");
      }

      // 2. Validate user registration status (exclude cancelled ones)
      if (registrationSnap.exists() && registrationSnap.data().status !== "cancelled") {
        throw new Error("You are already registered for this event.");
      }

      // 3. Validate event registration status is open/published
      const resolvedStatus = resolveEventStatus(eventData);
      if (resolvedStatus === "archived" || eventData.status === "archived") {
        throw new Error("Registration blocked: Event is archived.");
      }
      if (resolvedStatus === "cancelled" || eventData.status === "cancelled") {
        throw new Error("Registration blocked: Event has been cancelled.");
      }
      if (resolvedStatus === "deleted" || eventData.status === "deleted") {
        throw new Error("Registration blocked: Event is deleted.");
      }
      if (resolvedStatus === "completed" || eventData.status === "completed") {
        throw new Error("Registration blocked: Event is completed.");
      }

      // 4. Validate registration deadline
      const today = new Date().toISOString().split("T")[0];
      if (eventData.registrationDeadline && today > eventData.registrationDeadline) {
        throw new Error("Registration blocked: The registration deadline has passed.");
      }

      // 5. Validate seat capacity
      const capacity = parseInt(eventData.capacity) || 0;
      const currentRegistered = parseInt(eventData.registeredCount) || 0;
      if (currentRegistered >= capacity) {
        throw new Error("Registration blocked: Event capacity is full.");
      }

      // 6. Build registration document
      const ticketId = generateDeterministicTicketId(userId, eventId);
      const ticketQR = JSON.stringify({ ticketId, eventId, userId });

      const registrationData = {
        registrationId,
        eventId,
        eventTitle: eventData.title || "",
        userId,
        userName: userProfile.displayName || userProfile.email || "Unknown Student",
        userEmail: userProfile.email || "",
        clubId: eventData.clubId || null,
        organizerId: eventData.creatorId || "",
        registeredAt: new Date().toISOString(),
        status: "confirmed",
        ticketId,
        ticketQR,
        attendanceStatus: "absent",
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null
      };

      // 7. Write registration and update event count
      transaction.set(registrationRef, registrationData);

      const newRegisteredCount = currentRegistered + 1;
      const updateData = {
        registeredCount: newRegisteredCount,
        updatedAt: new Date().toISOString()
      };

      // If capacity reached, close the registration
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

    return result;
  } catch (error) {
    logFirebaseError("[registerForEvent] Registration transaction failed.", error);
    throw error;
  }
};

/**
 * Cancels a user registration. Soft cancels by setting status = 'cancelled'.
 */
export const cancelRegistration = async (registrationId, actorRole = "student") => {
  const docRef = doc(db, COLLECTION_NAME, registrationId);
  const [userId, eventId] = registrationId.split('_');
  const eventRef = doc(db, "events", eventId);

  try {
    const event = await getEvent(eventId);
    if (!event) throw new Error("Event not found.");

    if (actorRole === "student") {
      const today = new Date().toISOString().split("T")[0];
      if (event.registrationDeadline && today > event.registrationDeadline) {
        throw new Error("You cannot cancel registration after the registration deadline has passed.");
      }
    }

    const result = await runTransaction(db, async (transaction) => {
      const regSnap = await transaction.get(docRef);
      if (!regSnap.exists()) return false;
      const regData = regSnap.data();

      // If already cancelled, do nothing
      if (regData.status === "cancelled") {
        return false;
      }

      const eventSnap = await transaction.get(eventRef);
      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        const currentCount = parseInt(eventData.registeredCount) || 0;
        const newCount = Math.max(currentCount - 1, 0);
        
        const updateData = {
          registeredCount: newCount,
          updatedAt: new Date().toISOString()
        };
        
        // Reopen registrations if we fall below capacity limit
        if ((eventData.status === 'closed' || eventData.status === 'open' || eventData.status === 'published') && newCount < (parseInt(eventData.capacity) || 0)) {
          updateData.status = 'published';
        }
        
        transaction.update(eventRef, updateData);
      }

      // Soft cancel
      transaction.update(docRef, {
        status: "cancelled",
        updatedAt: new Date().toISOString()
      });
      return true;
    });

    if (event) {
      logActivity(
        userId,
        `Cancelled Registration for ${event.category || 'Event'}: "${event.title}"`,
        { eventId }
      );
    } else {
      logActivity(userId, `Cancelled Registration`, { eventId });
    }
    return result;
  } catch (error) {
    logFirebaseError("[cancelRegistration] Failed to cancel registration transaction.", error);
    throw error;
  }
};

/**
 * Checks in an attendee for a registration event by document lookup.
 */
export const checkInAttendee = async (userId, eventId, actorId) => {
  const registrationId = `${userId}_${eventId}`;
  const regRef = doc(db, COLLECTION_NAME, registrationId);
  try {
    const fields = {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: actorId,
      attendanceStatus: "present"
    };
    await updateDoc(regRef, fields);
    return true;
  } catch (error) {
    logFirebaseError("[checkInAttendee] Failed to check in attendee.", error);
    throw error;
  }
};

/**
 * Validates ticket and marks attendee present. Prevents double check-in.
 */
export const checkInByTicket = async (userId, eventId, ticketId, actorId) => {
  if (!userId || !eventId || !ticketId) {
    throw new Error("Invalid scan: Missing scan parameter context.");
  }
  const registrationId = `${userId}_${eventId}`;
  const regRef = doc(db, COLLECTION_NAME, registrationId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const regSnap = await transaction.get(regRef);
      if (!regSnap.exists()) {
        throw new Error("Registration Not Found: Ticket does not exist in registry.");
      }

      const regData = regSnap.data();
      if (regData.ticketId !== ticketId) {
        throw new Error("Invalid Ticket: Ticket ID mismatch.");
      }

      if (regData.eventId !== eventId) {
        throw new Error("Wrong Event: Ticket does not belong to this event.");
      }

      if (regData.status === "cancelled") {
        throw new Error("Invalid Ticket: Registration has been cancelled.");
      }

      if (regData.checkedIn || regData.attendanceStatus === "present") {
        throw new Error("Already Checked In: Attendee has already checked in.");
      }

      const checkInFields = {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: actorId,
        attendanceStatus: "present"
      };

      transaction.update(regRef, checkInFields);
      return { ...regData, ...checkInFields };
    });

    return result;
  } catch (error) {
    logFirebaseError("[checkInByTicket] Check-in transaction failed.", error);
    throw error;
  }
};

/**
 * Subscribes to real-time registrations for a specific event (active confirmed ones only).
 */
export const subscribeToEventRegistrations = (eventId, onUpdate) => {
  const registrationsCol = collection(db, COLLECTION_NAME);
  const q = query(registrationsCol, where("eventId", "==", eventId), where("status", "==", "confirmed"));
  return onSnapshot(q, async (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });

    const resolved = await Promise.all(list.map(async (reg) => {
      try {
        const uDoc = await getDoc(doc(db, "users", reg.userId));
        const uData = uDoc.exists() ? uDoc.data() : {};
        return {
          ...reg,
          studentName: uData.displayName || "Unknown Student",
          email: uData.email || "",
          college: uData.college || "N/A",
          branch: uData.department || uData.branch || "N/A",
          avatar: uData.avatar || ""
        };
      } catch (e) {
        logFirebaseError("[subscribeToEventRegistrations] User profile fetch failed", e);
        return {
          ...reg,
          studentName: "Unknown Student",
          email: "",
          college: "N/A",
          branch: "N/A",
          avatar: ""
        };
      }
    }));

    onUpdate(resolved);
  }, (error) => {
    logFirebaseError("[subscribeToEventRegistrations] Error in registration stream.", error);
  });
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
