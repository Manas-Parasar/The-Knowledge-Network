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
const donationsCollection = collection(db, "donations");

/**
 * Add a new donation document
 * @param {Object} donationData - The data for the new donation
 * @returns {Promise<string>} - The ID of the newly created donation
 */
export const addDonation = async (donationData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a donation");
    }

    const newDonation = {
      ...donationData,
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(donationsCollection, newDonation);
    return docRef.id;
  } catch (error) {
    console.error("Error adding donation:", error);
    throw error;
  }
};

/**
 * Get all active donations
 * @returns {Promise<Array>} - Array of donation objects with IDs
 */
export const getDonations = async () => {
  try {
    const q = query(
      donationsCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    const donations = [];
    querySnapshot.forEach((doc) => {
      donations.push({ id: doc.id, ...doc.data() });
    });
    return donations;
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
};

/**
 * Get a single donation by ID
 * @param {string} id - The ID of the donation
 * @returns {Promise<Object|null>} - The donation object with ID or null if not found
 */
export const getDonationById = async (id) => {
  try {
    const donationRef = doc(donationsCollection, id);
    const docSnap = await getDoc(donationRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting donation by ID:", error);
    throw error;
  }
};

/**
 * Update a donation (only by creator or admin)
 * @param {string} id - The ID of the donation
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateDonation = async (id, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a donation");
    }

    const donationRef = doc(donationsCollection, id);
    const donationSnap = await getDoc(donationRef);

    if (!donationSnap.exists()) {
      throw new Error("Donation not found");
    }

    const donationData = donationSnap.data();

    // Check permissions
    if (donationData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this donation"
        );
      }
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(donationRef, updatedData);
  } catch (error) {
    console.error("Error updating donation:", error);
    throw error;
  }
};

/**
 * Delete a donation (only by creator or admin)
 * @param {string} id - The ID of the donation
 * @returns {Promise<void>}
 */
export const deleteDonation = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a donation");
    }

    const donationRef = doc(donationsCollection, id);
    const donationSnap = await getDoc(donationRef);

    if (!donationSnap.exists()) {
      throw new Error("Donation not found");
    }

    const donationData = donationSnap.data();

    // Check permissions
    if (donationData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this donation"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(donationRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting donation:", error);
    throw error;
  }
};
