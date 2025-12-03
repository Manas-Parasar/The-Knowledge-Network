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
const sponsorsCollection = collection(db, "sponsors");

/**
 * Add a new sponsor document
 * @param {Object} sponsorData - The data for the new sponsor
 * @returns {Promise<string>} - The ID of the newly created sponsor
 */
export const addSponsor = async (sponsorData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a sponsor");
    }

    const newSponsor = {
      ...sponsorData,
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(sponsorsCollection, newSponsor);
    return docRef.id;
  } catch (error) {
    console.error("Error adding sponsor:", error);
    throw error;
  }
};

/**
 * Get all active sponsors
 * @returns {Promise<Array>} - Array of sponsor objects with IDs
 */
export const getSponsors = async () => {
  try {
    const q = query(
      sponsorsCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    const sponsors = [];
    querySnapshot.forEach((doc) => {
      sponsors.push({ id: doc.id, ...doc.data() });
    });
    return sponsors;
  } catch (error) {
    console.error("Error getting sponsors:", error);
    throw error;
  }
};

/**
 * Get a single sponsor by ID
 * @param {string} id - The ID of the sponsor
 * @returns {Promise<Object|null>} - The sponsor object with ID or null if not found
 */
export const getSponsorById = async (id) => {
  try {
    const sponsorRef = doc(sponsorsCollection, id);
    const docSnap = await getDoc(sponsorRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting sponsor by ID:", error);
    throw error;
  }
};

/**
 * Update a sponsor (only by creator or admin)
 * @param {string} id - The ID of the sponsor
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateSponsor = async (id, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a sponsor");
    }

    const sponsorRef = doc(sponsorsCollection, id);
    const sponsorSnap = await getDoc(sponsorRef);

    if (!sponsorSnap.exists()) {
      throw new Error("Sponsor not found");
    }

    const sponsorData = sponsorSnap.data();

    // Check permissions
    if (sponsorData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this sponsor"
        );
      }
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(sponsorRef, updatedData);
  } catch (error) {
    console.error("Error updating sponsor:", error);
    throw error;
  }
};

/**
 * Delete a sponsor (only by creator or admin)
 * @param {string} id - The ID of the sponsor
 * @returns {Promise<void>}
 */
export const deleteSponsor = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a sponsor");
    }

    const sponsorRef = doc(sponsorsCollection, id);
    const sponsorSnap = await getDoc(sponsorRef);

    if (!sponsorSnap.exists()) {
      throw new Error("Sponsor not found");
    }

    const sponsorData = sponsorSnap.data();

    // Check permissions
    if (sponsorData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this sponsor"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(sponsorRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting sponsor:", error);
    throw error;
  }
};
