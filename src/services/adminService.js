import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/config";
import { logFirebaseError } from "../firebase/errorLogging";

const CLUBS_COLLECTION = "clubs";
const LOGS_COLLECTION = "adminLogs";
const USERS_COLLECTION = "users";
const EVENTS_COLLECTION = "events";
const REGS_COLLECTION = "registrations";

/**
 * Helper to check if current user is admin.
 */
const verifyAdminAccess = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required.");
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, currentUser.uid));
  const role = (userDoc.exists() ? userDoc.data().role : "student").toLowerCase().trim();
  if (!userDoc.exists() || role !== "admin") {
    throw new Error("403 Forbidden: Administrator role is required.");
  }
  return currentUser.uid;
};

/**
 * Writes a security audit log to Firestore.
 */
export const writeAuditLog = async (action, actorId, details = {}) => {
  const logsCol = collection(db, LOGS_COLLECTION);
  const newLogRef = doc(logsCol);
  
  const logData = {
    logId: newLogRef.id,
    action,
    timestamp: new Date().toISOString(),
    actorId,
    details
  };

  try {
    await setDoc(newLogRef, logData);
    return logData;
  } catch (error) {
    console.error("[writeAuditLog] Failed to write audit log document.", error);
    return null;
  }
};

/**
 * Club CRUD Operations
 */
export const createClub = async (clubData) => {
  const adminUid = await verifyAdminAccess();
  const clubsCol = collection(db, CLUBS_COLLECTION);
  const newDocRef = doc(clubsCol);

  const club = {
    clubId: newDocRef.id,
    name: clubData.name || "",
    shortName: clubData.shortName || "",
    description: clubData.description || "",
    logo: clubData.logo || "",
    college: clubData.college || "",
    department: clubData.department || "",
    facultyCoordinator: clubData.facultyCoordinator || "",
    status: clubData.status || "active",
    createdAt: new Date().toISOString(),
    createdBy: adminUid
  };

  try {
    await setDoc(newDocRef, club);
    await writeAuditLog("Club Created", adminUid, { clubId: club.clubId, clubName: club.name });
    return club;
  } catch (error) {
    logFirebaseError("[createClub] Failed to write club document.", error);
    throw error;
  }
};

export const updateClub = async (clubId, clubData) => {
  const adminUid = await verifyAdminAccess();
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);

  const updates = {
    ...clubData,
    updatedAt: new Date().toISOString()
  };

  try {
    await updateDoc(clubRef, updates);
    await writeAuditLog("Club Updated", adminUid, { clubId, name: clubData.name });
    return updates;
  } catch (error) {
    logFirebaseError("[updateClub] Failed to update club document.", error);
    throw error;
  }
};

export const deleteClub = async (clubId) => {
  const adminUid = await verifyAdminAccess();
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  try {
    const docSnap = await getDoc(clubRef);
    const name = docSnap.exists() ? docSnap.data().name : clubId;
    await deleteDoc(clubRef);
    await writeAuditLog("Club Deleted", adminUid, { clubId, name });
    return true;
  } catch (error) {
    logFirebaseError("[deleteClub] Failed to delete club document.", error);
    throw error;
  }
};

export const getAllClubs = async () => {
  const clubsCol = collection(db, CLUBS_COLLECTION);
  try {
    const snap = await getDocs(clubsCol);
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    logFirebaseError("[getAllClubs] Failed to list clubs.", error);
    return [];
  }
};

/**
 * Fetches all registered system users.
 */
export const getAllUsers = async () => {
  await verifyAdminAccess();
  const usersCol = collection(db, USERS_COLLECTION);
  try {
    const snap = await getDocs(usersCol);
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    logFirebaseError("[getAllUsers] Failed to fetch users.", error);
    return [];
  }
};

/**
 * Updates a user role, logs the action.
 */
export const updateUserRole = async (targetUid, newRole, updates = {}) => {
  const adminUid = await verifyAdminAccess();
  const userRef = doc(db, USERS_COLLECTION, targetUid);
  try {
    const uDoc = await getDoc(userRef);
    const prevData = uDoc.exists() ? uDoc.data() : {};
    
    const fields = {
      role: newRole,
      updatedAt: new Date().toISOString(),
      ...updates
    };
    
    await updateDoc(userRef, fields);
    
    await writeAuditLog("Role Changed", adminUid, { 
      targetUid, 
      targetEmail: prevData.email || "",
      previousRole: prevData.role || "student", 
      newRole 
    });
    
    if (newRole === "student" && prevData.role === "organizer") {
      await writeAuditLog("Organizer Removed", adminUid, { 
        targetUid, 
        targetEmail: prevData.email || ""
      });
    }
    
    return true;
  } catch (error) {
    logFirebaseError("[updateUserRole] Failed to modify role.", error);
    throw error;
  }
};

/**
 * Updates suspension status of a user.
 */
export const updateUserSuspension = async (targetUid, suspended) => {
  const adminUid = await verifyAdminAccess();
  const userRef = doc(db, USERS_COLLECTION, targetUid);
  try {
    const uDoc = await getDoc(userRef);
    const prevData = uDoc.exists() ? uDoc.data() : {};
    
    await updateDoc(userRef, { 
      suspended: !!suspended,
      updatedAt: new Date().toISOString()
    });
    
    await writeAuditLog(suspended ? "User Suspended" : "User Unsuspended", adminUid, { 
      targetUid, 
      targetEmail: prevData.email || ""
    });
    
    return true;
  } catch (error) {
    logFirebaseError("[updateUserSuspension] Failed to update user suspension status.", error);
    throw error;
  }
};

/**
 * Fetches security audit logs.
 */
export const getAuditLogs = async (limitCount = 50) => {
  await verifyAdminAccess();
  const logsCol = collection(db, LOGS_COLLECTION);
  const q = query(logsCol, orderBy("timestamp", "desc"), limit(limitCount));
  try {
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    logFirebaseError("[getAuditLogs] Failed to fetch logs.", error);
    return [];
  }
};

/**
 * Compiles real-time metrics across all collections.
 */
export const getAdminStats = async () => {
  await verifyAdminAccess();
  try {
    const [usersSnap, clubsSnap, eventsSnap, regsSnap] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, CLUBS_COLLECTION)),
      getDocs(collection(db, EVENTS_COLLECTION)),
      getDocs(collection(db, REGS_COLLECTION))
    ]);

    const users = [];
    usersSnap.forEach(d => users.push(d.data()));

    const totalUsers = users.length;
    const students = users.filter(u => u.role === "student").length;
    const organizers = users.filter(u => u.role === "organizer").length;
    const admins = users.filter(u => u.role === "admin").length;

    const totalClubs = clubsSnap.size;
    const totalEvents = eventsSnap.size;

    const todayStr = new Date().toISOString().split("T")[0];
    let upcomingEvents = 0;
    eventsSnap.forEach((docSnap) => {
      const e = docSnap.data();
      if (e.date && e.date >= todayStr) {
        upcomingEvents++;
      }
    });

    const registrations = regsSnap.size;

    return {
      totalUsers,
      students,
      organizers,
      admins,
      totalClubs,
      totalEvents,
      upcomingEvents,
      registrations
    };
  } catch (error) {
    logFirebaseError("[getAdminStats] Failed to compile admin dashboard statistics.", error);
    throw error;
  }
};
