import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Add a new slot to a school's slots subcollection
 * @param {string} schoolId - The ID of the school
 * @param {Object} slotData - The data for the new slot
 * @returns {Promise<void>}
 */
export const addSlot = async (schoolId, slotData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a slot");
    }

    const slotsCollectionRef = collection(db, "schools", schoolId, "slots");

    const newSlot = {
      ...slotData,
      filledSlots: 0,
      volunteerNames: [],
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(slotsCollectionRef, newSlot);
  } catch (error) {
    console.error("Error adding slot:", error);
    throw error;
  }
};

/**
 * Get all slots for a school
 * @param {string} schoolId - The ID of the school
 * @returns {Promise<Array>} - Array of slot objects
 */
export const getSlots = async (schoolId) => {
  try {
    const slotsCollectionRef = collection(db, "schools", schoolId, "slots");
    const slotsSnapshot = await getDocs(slotsCollectionRef);

    const slots = [];
    slotsSnapshot.forEach((doc) => {
      slots.push({
        id: doc.id,
        ...doc.data(),
      });
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
 * @returns {Promise<Object|null>} - The slot object or null if not found
 */
export const getSlotById = async (schoolId, slotId) => {
  try {
    const slotRef = doc(db, "schools", schoolId, "slots", slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      return null;
    }

    return {
      id: slotSnap.id,
      ...slotSnap.data(),
    };
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

    const updatedSlot = {
      ...slotData,
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(slotRef, updatedSlot);
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

    await deleteDoc(slotRef);
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
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to sign up for a slot");
    }

    const schoolRef = doc(db, "schools", schoolId);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();
    const slots = schoolData.slots || [];
    const slotIndex = slots.findIndex((slot) => slot.id === slotId);

    if (slotIndex === -1) {
      throw new Error("Slot not found");
    }

    const slotData = slots[slotIndex];

    // Check if slot has capacity
    const capacity = slotData.availableVolunteers || 0;
    if (slotData.volunteerNames.length >= capacity) {
      throw new Error("Slot is full");
    }

    // Check if user is already signed up
    const alreadySignedUp = slotData.volunteerNames.some(
      (name) => name === userName
    );
    if (alreadySignedUp) {
      throw new Error("User is already signed up for this slot");
    }

    // Add user to volunteerNames
    const updatedVolunteerNames = [...slotData.volunteerNames, userName];

    slots[slotIndex] = {
      ...slotData,
      volunteerNames: updatedVolunteerNames,
      updatedAt: new Date(),
    };

    await updateDoc(schoolRef, {
      slots: slots,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error signing up for slot:", error);
    throw error;
  }
};

/**
 * Cancel signup (only by signed-up user or admin)
 * @param {string} schoolId - The ID of the school
 * @param {string} slotId - The ID of the slot
 * @param {string} userName - The name of the user canceling
 * @returns {Promise<void>}
 */
export const cancelSlotSignup = async (schoolId, slotId, userName) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to cancel signup");
    }

    const schoolRef = doc(db, "schools", schoolId);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();
    const slots = schoolData.slots || [];
    const slotIndex = slots.findIndex((slot) => slot.id === slotId);

    if (slotIndex === -1) {
      throw new Error("Slot not found");
    }

    const slotData = slots[slotIndex];

    // Check if user is signed up
    const userIndex = slotData.volunteerNames.indexOf(userName);
    if (userIndex === -1) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error("User is not signed up for this slot or not an admin");
      }
      throw new Error("Admin cannot cancel signup without specifying user");
    }

    // Remove user from volunteerNames
    const updatedVolunteerNames = slotData.volunteerNames.filter(
      (name) => name !== userName
    );

    slots[slotIndex] = {
      ...slotData,
      volunteerNames: updatedVolunteerNames,
      updatedAt: new Date(),
    };

    await updateDoc(schoolRef, {
      slots: slots,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error canceling slot signup:", error);
    throw error;
  }
};

/**
 * Get all slots across all schools (admin only)
 * @returns {Promise<Array>} - Array of slot objects with school info
 */
export const getAllSlots = async () => {
  try {
    const schools = await getDocs(collection(db, "schools"));
    const allSlots = [];

    for (const schoolDoc of schools.docs) {
      const schoolData = schoolDoc.data();
      const slotsCollectionRef = collection(
        db,
        "schools",
        schoolDoc.id,
        "slots"
      );
      const slotsSnapshot = await getDocs(slotsCollectionRef);

      slotsSnapshot.forEach((slotDoc) => {
        allSlots.push({
          id: slotDoc.id,
          ...slotDoc.data(),
          schoolId: schoolDoc.id,
          schoolName: schoolData.name,
        });
      });
    }

    return allSlots;
  } catch (error) {
    console.error("Error getting all slots:", error);
    throw error;
  }
};
