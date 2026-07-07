import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/config";
import { logFirebaseError } from "../firebase/errorLogging";

const COLLECTION_NAME = "organizerInvites";

/**
 * Generates a cryptographically secure random token starting with NEX_
 * minimum 32 random characters (url safe).
 */
export const generateInviteToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(32);
  // crypto.getRandomValues is standard in modern browsers and node environments
  (window.crypto || window.msCrypto).getRandomValues(array);
  let token = "NEX_";
  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};

/**
 * Admin helper: Creates a new invitation token.
 */
export const createInvite = async (clubId, clubName, role = "organizer", expiresInDays = 7) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Only authenticated administrators can generate invitations.");

  // Fetch admin profile to confirm permission (this is future-ready audit logging)
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  const adminRole = (userDoc.exists() ? userDoc.data().role : "student").toLowerCase().trim();
  if (!userDoc.exists() || adminRole !== "admin") {
    throw new Error("403 Unauthorized: Admin role is required to create invitations.");
  }

  const invitesCol = collection(db, COLLECTION_NAME);
  const newDocRef = doc(invitesCol);
  const token = generateInviteToken();

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + expiresInDays);

  const inviteData = {
    inviteId: newDocRef.id,
    token,
    clubId: clubId || null,
    clubName: clubName || null,
    role,
    createdBy: currentUser.uid,
    createdAt: new Date().toISOString(),
    expiresAt: expiry.toISOString(),
    used: false,
    usedBy: null,
    usedAt: null,
    maxUses: 1
  };

  try {
    await setDoc(newDocRef, inviteData);
    return inviteData;
  } catch (error) {
    logFirebaseError("[createInvite] Failed to create invitation.", error);
    throw error;
  }
};

/**
 * Admin helper: Revokes an active invitation.
 */
export const revokeInvite = async (inviteId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication is required.");

  const inviteRef = doc(db, COLLECTION_NAME, inviteId);
  try {
    await updateDoc(inviteRef, {
      expiresAt: new Date(0).toISOString() // Set expiration to beginning of time
    });
    return true;
  } catch (error) {
    logFirebaseError("[revokeInvite] Failed to revoke invitation.", error);
    throw error;
  }
};

/**
 * Admin helper: Fetches all generated invitations.
 */
export const getInvites = async () => {
  const invitesCol = collection(db, COLLECTION_NAME);
  try {
    const snap = await getDocs(invitesCol);
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    logFirebaseError("[getInvites] Failed to fetch invitations.", error);
    return [];
  }
};

/**
 * Validates and redeems an invitation token inside a transaction.
 * Updates the user's role and flags the token as used.
 */
export const redeemInviteToken = async (tokenString, userId) => {
  if (!userId) throw new Error("Authentication required.");
  if (!tokenString) throw new Error("Token string is required.");

  const invitesCol = collection(db, COLLECTION_NAME);
  const q = query(invitesCol, where("token", "==", tokenString));

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error("Invalid Token: The provided token does not exist in our registry.");
    }

    const inviteDocSnap = snap.docs[0];
    const inviteData = inviteDocSnap.data();
    const inviteRef = doc(db, COLLECTION_NAME, inviteData.inviteId);
    const userRef = doc(db, "users", userId);

    return await runTransaction(db, async (transaction) => {
      const uDoc = await transaction.get(userRef);
      const iDoc = await transaction.get(inviteRef);

      if (!uDoc.exists()) {
        throw new Error("User record not found.");
      }

      const userData = uDoc.data();
      const currentInvite = iDoc.data();

      const userRole = (userData.role || "student").toLowerCase().trim();

      // Check current user status
      if (userRole === "admin") {
        throw new Error("Already Organizer: Admin accounts bypass organizer restrictions.");
      }
      if (userRole === "organizer") {
        throw new Error("Already Organizer: This account is already verified as an organizer.");
      }

      // Check token status
      if (currentInvite.used) {
        throw new Error("Already Used: This invitation token has already been redeemed.");
      }

      // Check token expiration
      const expiry = new Date(currentInvite.expiresAt);
      if (expiry < new Date()) {
        throw new Error("Expired Token: This invitation token has expired.");
      }

      // Perform transaction updates
      transaction.update(userRef, {
        role: currentInvite.role || "organizer",
        verified: true,
        clubId: currentInvite.clubId,
        clubName: currentInvite.clubName,
        updatedAt: new Date().toISOString()
      });

      transaction.update(inviteRef, {
        used: true,
        usedBy: userId,
        usedAt: new Date().toISOString()
      });

      return {
        success: true,
        clubName: currentInvite.clubName,
        role: currentInvite.role || "organizer"
      };
    });
  } catch (error) {
    logFirebaseError("[redeemInviteToken] Failed to redeem invitation token.", error);
    throw error;
  }
};
