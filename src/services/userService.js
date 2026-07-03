import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocFromCache } from "firebase/firestore";
import { db } from "../firebase/firestore";

const COLLECTION_NAME = "users";

const withTimeout = (promise, ms = 2000) => {
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

export const createUser = async (uid, userData) => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  const data = {
    uid,
    createdAt: new Date().toISOString(),
    ...userData,
  };
  await setDoc(userRef, data);
  return data;
};

export const getUser = async (uid) => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  try {
    const docSnap = await withTimeout(getDoc(userRef), 2000);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Failed to get user from server, trying cache:", error);
    try {
      const docSnap = await getDocFromCache(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (cacheErr) {
      console.error("Cache user get failed:", cacheErr);
    }
  }
  return null;
};

export const updateUser = async (uid, userData) => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  const updateData = {
    updatedAt: new Date().toISOString(),
    ...userData,
  };
  await updateDoc(userRef, updateData);
  const updatedSnap = await getDoc(userRef);
  return updatedSnap.data();
};

export const deleteUser = async (uid) => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  await deleteDoc(userRef);
  return true;
};

/**
 * Checks if a user profile exists in Firestore and creates it with defaults if not.
 * Safely handles both email signup and Google Sign-in.
 */
export const checkAndCreateUserProfile = async (user) => {
  if (!user) return null;

  const userRef = doc(db, COLLECTION_NAME, user.uid);
  let docSnap = null;
  try {
    docSnap = await withTimeout(getDoc(userRef), 2000);
  } catch (error) {
    console.warn("Failed to get user profile from server, trying cache:", error);
    try {
      docSnap = await getDocFromCache(userRef);
    } catch (cacheErr) {
      console.error("Cache user profile get failed:", cacheErr);
    }
  }

  if (!docSnap || !docSnap.exists()) {
    const defaultProfile = {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      college: "",
      branch: "",
      year: "",
      bio: "",
      role: "student",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await withTimeout(setDoc(userRef, defaultProfile), 2500);
    } catch (writeErr) {
      console.error("Failed to write default user profile:", writeErr);
    }
    return defaultProfile;
  }

  return docSnap.data();
};
