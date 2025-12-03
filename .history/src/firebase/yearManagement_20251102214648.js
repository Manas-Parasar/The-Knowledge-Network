import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Archive current year data and reset for new year (admin only)
 * @param {string} newYear - The new school year (e.g., "2025")
 * @returns {Promise<void>}
 */
export const archiveAndResetYear = async (newYear) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can archive and reset years");
    }

    // Get current year
    const currentYear = new Date().getFullYear().toString();

    // Archive collections
    const collectionsToArchive = [
      "schools",
      "events",
      "donations",
      "sponsors",
      "clubs",
    ];
    const archiveData = {};

    for (const collectionName of collectionsToArchive) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      archiveData[collectionName] = [];
      snapshot.forEach((doc) => {
        archiveData[collectionName].push({ id: doc.id, ...doc.data() });
      });
    }

    // Save to archives
    const archiveRef = doc(db, "archives", currentYear);
    await setDoc(archiveRef, archiveData);

    // Clear main collections
    const batch = writeBatch(db);

    for (const collectionName of collectionsToArchive) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    await batch.commit();

    console.log(
      `Successfully archived ${currentYear} and reset for ${newYear}`
    );
  } catch (error) {
    console.error("Error archiving and resetting year:", error);
    throw error;
  }
};

/**
 * Get archived data for a specific year
 * @param {string} year - The year to retrieve archived data for
 * @returns {Promise<Object|null>} - The archived data or null if not found
 */
export const getArchivedYear = async (year) => {
  try {
    const archiveRef = doc(db, "archives", year);
    const archiveSnap = await getDoc(archiveRef);

    if (archiveSnap.exists()) {
      return archiveSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting archived year:", error);
    throw error;
  }
};

/**
 * Get all archived years
 * @returns {Promise<Array>} - Array of archived year strings
 */
export const getArchivedYears = async () => {
  try {
    const archivesRef = collection(db, "archives");
    const snapshot = await getDocs(archivesRef);
    const years = [];
    snapshot.forEach((doc) => {
      years.push(doc.id);
    });
    return years.sort().reverse(); // Most recent first
  } catch (error) {
    console.error("Error getting archived years:", error);
    throw error;
  }
};
