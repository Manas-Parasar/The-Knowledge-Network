import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Get user profile by userId
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} - The user profile object with ID or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update user profile (only by the user themselves or admin)
 * @param {string} userId - The ID of the user
 * @param {Object} updates - The updates to apply to the user profile
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update profile");
    }

    if (auth.currentUser.uid !== userId) {
      // Check if user is admin
      const currentUserRef = doc(usersCollection, auth.currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (
        !currentUserSnap.exists() ||
        currentUserSnap.data().role !== "capstoneAdmin"
      ) {
        throw new Error(
          "Permission denied: Can only update own profile or be admin"
        );
      }
    }

    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Set user's selected school (only by the user themselves or admin)
 * @param {string} userId - The ID of the user
 * @param {string} schoolId - The ID of the selected school
 * @param {string} schoolName - The name of the selected school
 * @returns {Promise<void>}
 */
export const setUserSelectedSchool = async (userId, schoolId, schoolName) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to set selected school");
    }

    if (auth.currentUser.uid !== userId) {
      // Check if user is admin
      const currentUserRef = doc(usersCollection, auth.currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (
        !currentUserSnap.exists() ||
        currentUserSnap.data().role !== "capstoneAdmin"
      ) {
        throw new Error(
          "Permission denied: Can only set own selected school or be admin"
        );
      }
    }

    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const updatedData = {
      selectedSchool: { id: schoolId, name: schoolName },
      updatedAt: new Date(),
    };

    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error("Error setting user selected school:", error);
    throw error;
  }
};
