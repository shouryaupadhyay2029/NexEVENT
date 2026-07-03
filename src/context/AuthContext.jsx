import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  logout as firebaseLogout, 
  resetPassword as firebaseResetPassword 
} from '../firebase/auth';

import { checkAndCreateUserProfile, getUser } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (uid) => {
    const targetUid = uid || (auth.currentUser ? auth.currentUser.uid : null);
    if (targetUid) {
      try {
        const p = await getUser(targetUid);
        setProfile(p);
        return p;
      } catch (error) {
        console.error("Failed to refresh user profile: ", error);
      }
    }
    return null;
  };

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    const syncProfile = async () => {
      if (!currentUser) {
        setProfile(null);
        return;
      }

      try {
        const userProfile = await checkAndCreateUserProfile(currentUser);
        if (active) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Failed to sync user profile with Firestore: ", error);
        if (active) {
          setProfile(null);
        }
      }
    };

    syncProfile();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const login = async (email, password) => {
    return signInWithEmail(email, password);
  };

  const signup = async (email, password, displayName) => {
    return signUpWithEmail(email, password, displayName);
  };

  const googleLogin = async () => {
    return signInWithGoogle();
  };

  const logout = async () => {
    return firebaseLogout();
  };

  const resetPassword = async (email) => {
    return firebaseResetPassword(email);
  };

  const value = {
    user: currentUser,
    profile,
    isAuthenticated: !!currentUser,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    resetPassword,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
