import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const role =
          user.email === "theknowledgenetwork2025@gmail.com"
            ? "capstoneAdmin"
            : "user";
        const userData = {
          name: user.displayName,
          email: user.email,
          role: role,
          createdAt: new Date(),
        };

        await setDoc(userDocRef, userData);
        return role;
      } else {
        return userDoc.data().role;
      }
    } catch (error) {
      console.error("Firestore error in createUserDocument:", error);
      // Fallback to email-based role assignment if Firestore fails
      return user.email === "theknowledgenetwork2025@gmail.com"
        ? "capstoneAdmin"
        : "user";
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Validate required user information
      if (!user.email) {
        throw new Error(
          "Email is required for sign-up. Please ensure your Google account has an email address."
        );
      }
      if (!user.displayName) {
        throw new Error(
          "Display name is required for sign-up. Please ensure your Google account has a display name."
        );
      }

      try {
        const role = await createUserDocument(user);
        setUserRole(role);
      } catch (firestoreError) {
        console.error("Firestore error, using fallback role:", firestoreError);
        // Fallback to email-based role assignment if Firestore fails
        const role =
          user.email === "theknowledgenetwork2025@gmail.com"
            ? "capstoneAdmin"
            : "user";
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await createUserDocument(user);
          setUserRole(role);

          // Fetch user's selected school
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setSelectedSchool(
              userData.schoolId
                ? { id: userData.schoolId, name: userData.schoolName }
                : null
            );
          }
        } catch (error) {
          console.error("Error creating user document:", error);
          // Still set user even if Firestore fails
          setUserRole(
            user.email === "theknowledgenetwork2025@gmail.com"
              ? "capstoneAdmin"
              : "user"
          );
          setSelectedSchool(null);
        }
      } else {
        setUserRole(null);
        setSelectedSchool(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    selectedSchool,
    setSelectedSchool,
    signInWithGoogle,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
