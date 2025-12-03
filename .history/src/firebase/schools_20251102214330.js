import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const schoolsCollection = collection(db, "schools");
const usersCollection = collection(db, "users");

/**
 * Add a new school document
 * @param {Object} schoolData - The data for the new school
 * @returns {Promise<string>} - The ID of the newly created school
 */
export const addSchool = async (schoolData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a school");
    }

    const newSchool = {
      name: schoolData.name,
      address: schoolData.address,
      tutoringHours: schoolData.tutoringHours || "",
      gradeLevels: schoolData.gradeLevels || "",
      donationLink: schoolData.donationLink || "",
      slots: [],
      events: [],
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(schoolsCollection, newSchool);
    return docRef.id;
  } catch (error) {
    console.error("Error adding school:", error);
    throw error;
  }
};

/**
 * Get all active schools
 * @returns {Promise<Array>} - Array of active school objects with IDs
 */
export const getSchools = async () => {
  try {
    const q = query(schoolsCollection, where("isActive", "==", true));
    const querySnapshot = await getDocs(q);
    const schools = [];
    querySnapshot.forEach((doc) => {
      schools.push({ id: doc.id, ...doc.data() });
    });
    return schools;
  } catch (error) {
    console.error("Error getting schools:", error);
    throw error;
  }
};

/**
 * Get a single school by ID
 * @param {string} id - The ID of the school
 * @returns {Promise<Object|null>} - The school object with ID or null if not found
 */
export const getSchoolById = async (id) => {
  try {
    const docRef = doc(schoolsCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting school by ID:", error);
    throw error;
  }
};

/**
 * Update a school (only by creator or admin)
 * @param {string} id - The ID of the school
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateSchool = async (id, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a school");
    }

    const schoolRef = doc(schoolsCollection, id);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();

    // Check permissions
    if (schoolData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this school"
        );
      }
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(schoolRef, updatedData);
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
};

/**
 * Delete a school (only by creator or admin)
 * @param {string} id - The ID of the school
 * @returns {Promise<void>}
 */
export const deleteSchool = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a school");
    }

    const schoolRef = doc(schoolsCollection, id);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();

    // Check permissions
    if (schoolData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this school"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(schoolRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting school:", error);
    throw error;
  }
};
