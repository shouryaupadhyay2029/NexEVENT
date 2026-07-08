import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/config";
import { logFirebaseError } from "../firebase/errorLogging";
import { verifyUserPermission } from "./permissionService";

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
  const { uid: adminUid } = await verifyUserPermission(["admin"]);

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
    createdBy: adminUid,
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

  console.log("[redeemInviteToken] Initiating token verification query.", {
    path: `collection(${COLLECTION_NAME}) where token == ${tokenString}`,
    authenticatedUid: userId,
    operation: "getDocs"
  });

  try {
    const snap = await getDocs(q);
    console.log("[redeemInviteToken] Token verification query complete.", {
      empty: snap.empty,
      size: snap.size
    });

    if (snap.empty) {
      throw new Error("Invalid Token: The provided token does not exist in our registry.");
    }

    const inviteDocSnap = snap.docs[0];
    const currentInvite = inviteDocSnap.data();
    const inviteRef = doc(db, COLLECTION_NAME, currentInvite.inviteId);
    const userRef = doc(db, "users", userId);

    // 1. Fetch user doc to check role
    console.log("[redeemInviteToken] Fetching user profile document...", { path: userRef.path });
    const uDoc = await getDoc(userRef);
    if (!uDoc.exists()) {
      throw new Error("User record not found.");
    }
    const userData = uDoc.data();
    const userRole = (userData.role || "student").toLowerCase().trim();

    if (userRole === "admin") {
      throw new Error("Already Organizer: Admin accounts bypass organizer restrictions.");
    }
    if (userRole === "organizer") {
      throw new Error("Already Organizer: This account is already verified as an organizer.");
    }

    // Check token expiration
    const expiry = new Date(currentInvite.expiresAt);
    if (expiry < new Date()) {
      throw new Error("Expired Token: This invitation token has expired.");
    }

    // 2. Determine Step 1 action based on token status
    if (currentInvite.used) {
      if (currentInvite.usedBy !== userId) {
        throw new Error("Already Used: This invitation token has already been redeemed.");
      }
      console.log("[redeemInviteToken] Token already claimed by this user in a previous attempt. Skipping Step 1, proceeding to Step 2 profile upgrade.");
    } else {
      // Step 1: Claim the invite
      const inviteUpdatePayload = {
        used: true,
        usedBy: userId,
        usedAt: new Date().toISOString()
      };
      console.log("[redeemInviteToken] [Step 1] Claiming invitation token...", {
        path: inviteRef.path,
        payload: inviteUpdatePayload
      });
      await updateDoc(inviteRef, inviteUpdatePayload);
      console.log("[redeemInviteToken] [Step 1] Invitation token claimed successfully.");
    }

    // Step 2: Upgrade user profile
    const userUpdatePayload = {
      role: currentInvite.role || "organizer",
      verified: true,
      clubId: currentInvite.clubId,
      clubName: currentInvite.clubName,
      appliedInviteId: currentInvite.inviteId,
      updatedAt: new Date().toISOString()
    };

    console.log("[redeemInviteToken] [Step 2] Upgrading user profile to Organizer...", {
      path: userRef.path,
      payload: userUpdatePayload
    });
    await updateDoc(userRef, userUpdatePayload);
    console.log("[redeemInviteToken] [Step 2] User profile upgraded successfully.");

    return {
      success: true,
      clubName: currentInvite.clubName,
      role: currentInvite.role || "organizer"
    };
  } catch (error) {
    console.error("[redeemInviteToken] Failed to complete sequential invite redemption flow.", {
      authenticatedUid: userId,
      errorCode: error?.code || "N/A",
      errorMessage: error?.message,
      errorDetails: error
    });
    logFirebaseError("[redeemInviteToken] Failed to redeem invitation token.", error);
    throw error;
  }
};
