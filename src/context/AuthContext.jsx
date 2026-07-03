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

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
    isAuthenticated: !!currentUser,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
