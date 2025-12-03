import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Add a new slot to a school's slots subcollection
 * @param {string} schoolId - The ID of the school
 * @param {Object} slotData - The data for the new slot (e.g., { title, description, date, time, capacity })
 * @returns {Promise<string>} - The ID of the newly created slot
 */
export const addSlot = async (schoolId, slotData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a slot");
    }

    const slotsCollection = collection(db, "schools", schoolId, "slots");

    const newSlot = {
      ...slotData,
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      signedUpUsers: [], // array of {userId, userName}
    };

    const docRef = await addDoc(slotsCollection, newSlot);
    return docRef.id;
  } catch (error) {
    console.error("Error adding slot:", error);
    throw error;
  }
};

/**
 * Get all slots for a school
 * @param {string} schoolId - The ID of the school
 * @returns {Promise<Array>} - Array of slot objects with IDs
 */
export const getSlots = async (schoolId) => {
  try {
    const slotsCollection = collection(db, "schools", schoolId, "slots");
    const q = query(
      slotsCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    const slots = [];
    querySnapshot.forEach((doc) => {
      slots.push({ id: doc.id, ...doc.data() });
    });
    return slots;
  } catch (error) {
    console.error("Error getting slots:", error);
    throw error;
  }
};

/**
 * Get a single slot by ID
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<Object|null>} - The slot object with ID or null if not found
 */
export const getSlotById = async (schoolId, slotId) => {
  try {
    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const docSnap = await getDoc(slotRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting slot by ID:", error);
    throw error;
  }
};

/**
 * Update a slot (only by creator or admin)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateSlot = async (schoolId, slotId, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a slot");
    }

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();

    // Check permissions
    if (slotData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this slot"
        );
      }
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(slotRef, updatedData);
  } catch (error) {
    console.error("Error updating slot:", error);
    throw error;
  }
};

/**
 * Delete a slot (only by creator or admin)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<void>}
 */
export const deleteSlot = async (schoolId, slotId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a slot");
    }

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();

    // Check permissions
    if (slotData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this slot"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(slotRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting slot:", error);
    throw error;
  }
};

/**
 * Sign up for an available slot
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @param {string} userName - The name of the user signing up
 * @returns {Promise<void>}
 */
export const signUpForSlot = async (schoolId, slotId, userName) => {
  console.log(
    "DEBUG: signUpForSlot called with schoolId:",
    schoolId,
    "slotId:",
    slotId,
    "userName:",
    userName
  );
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to sign up for a slot");
    }
    console.log("DEBUG: User authenticated, uid:", auth.currentUser.uid);

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      console.log("DEBUG: Slot not found");
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();
    console.log("DEBUG: Slot data:", slotData);

    if (!slotData.isActive) {
      console.log("DEBUG: Slot is not active");
      throw new Error("Slot is not active");
    }

    // Check if slot has capacity
    const capacity = slotData.capacity || 1; // Default to 1 if not specified
    console.log(
      "DEBUG: Slot capacity:",
      capacity,
      "current signed up:",
      slotData.signedUpUsers.length
    );
    if (slotData.signedUpUsers.length >= capacity) {
      console.log("DEBUG: Slot is full");
      throw new Error("Slot is full");
    }

    // Check if user is already signed up
    const alreadySignedUp = slotData.signedUpUsers.some(
      (user) => user.userId === auth.currentUser.uid
    );
    console.log("DEBUG: User already signed up:", alreadySignedUp);
    if (alreadySignedUp) {
      throw new Error("User is already signed up for this slot");
    }

    // Add user to signedUpUsers
    const updatedSignedUpUsers = [
      ...slotData.signedUpUsers,
      { userId: auth.currentUser.uid, userName },
    ];
    console.log("DEBUG: Updated signed up users:", updatedSignedUpUsers);

    await updateDoc(slotRef, {
      signedUpUsers: updatedSignedUpUsers,
      updatedAt: new Date(),
    });
    console.log("DEBUG: Successfully updated slot in Firebase");
  } catch (error) {
    console.log("DEBUG: Error in signUpForSlot:", error);
    console.error("Error signing up for slot:", error);
    throw error;
  }
};

/**
 * Cancel signup (only by signed-up user or admin)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<void>}
 */
export const cancelSlotSignup = async (schoolId, slotId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to cancel signup");
    }

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();

    // Check if user is signed up
    const userIndex = slotData.signedUpUsers.findIndex(
      (user) => user.userId === auth.currentUser.uid
    );
    if (userIndex === -1) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error("User is not signed up for this slot or not an admin");
      }
      // If admin, allow canceling, but since no user specified, perhaps throw error or assume cancel all? But that doesn't make sense.
      // To simplify, for admin, they can use updateSlot to modify signedUpUsers.
      // For now, throw error if not signed up and not admin, or if admin, perhaps cancel the first one or something, but better to throw.
      throw new Error(
        "Admin cannot cancel signup without specifying user; use updateSlot instead"
      );
    }

    // Remove user from signedUpUsers
    const updatedSignedUpUsers = slotData.signedUpUsers.filter(
      (user) => user.userId !== auth.currentUser.uid
    );

    await updateDoc(slotRef, {
      signedUpUsers: updatedSignedUpUsers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error canceling slot signup:", error);
    throw error;
  }
};

/**
 * Get all users (for admin use)
 * @returns {Promise<Array>} - Array of user objects with IDs
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

/**
 * Add a user to a slot (admin only)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @param {string} userId - The ID of the user to add
 * @param {string} userName - The name of the user to add
 * @returns {Promise<void>}
 */
export const addUserToSlot = async (schoolId, slotId, userId, userName) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can add users to slots");
    }

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();

    if (!slotData.isActive) {
      throw new Error("Slot is not active");
    }

    // Check capacity
    if (slotData.signedUpUsers.length >= slotData.capacity) {
      throw new Error("Slot is full");
    }

    // Check if user already signed up
    if (slotData.signedUpUsers.some((user) => user.userId === userId)) {
      throw new Error("User already signed up");
    }

    const updatedSignedUpUsers = [
      ...slotData.signedUpUsers,
      { userId, userName },
    ];

    await updateDoc(slotRef, {
      signedUpUsers: updatedSignedUpUsers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding user to slot:", error);
    throw error;
  }
};

/**
 * Remove a user from a slot (admin only)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @param {string} userId - The ID of the user to remove
 * @returns {Promise<void>}
 */
export const removeUserFromSlot = async (schoolId, slotId, userId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can remove users from slots");
    }

    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      throw new Error("Slot not found");
    }

    const slotData = slotSnap.data();

    const updatedSignedUpUsers = slotData.signedUpUsers.filter(
      (user) => user.userId !== userId
    );

    await updateDoc(slotRef, {
      signedUpUsers: updatedSignedUpUsers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error removing user from slot:", error);
    throw error;
  }
};
