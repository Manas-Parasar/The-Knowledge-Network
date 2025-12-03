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

const resourcesCollection = collection(db, "resources");
const usersCollection = collection(db, "users");

/**
 * Add a new resource document
 * @param {Object} resourceData - The data for the new resource
 * @returns {Promise<string>} - The ID of the newly created resource
 */
export const addResource = async (resourceData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a resource");
    }

    const newResource = {
      ...resourceData,
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(resourcesCollection, newResource);
    return docRef.id;
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
};

/**
 * Get all active resources
 * @returns {Promise<Array>} - Array of active resource objects with IDs
 */
export const getResources = async () => {
  try {
    const q = query(resourcesCollection, where("isActive", "==", true));
    const querySnapshot = await getDocs(q);
    const resources = [];
    querySnapshot.forEach((doc) => {
      resources.push({ id: doc.id, ...doc.data() });
    });
    return resources;
  } catch (error) {
    console.error("Error getting resources:", error);
    throw error;
  }
};

/**
 * Get a single resource by ID
 * @param {string} id - The ID of the resource
 * @returns {Promise<Object|null>} - The resource object with ID or null if not found
 */
export const getResourceById = async (id) => {
  try {
    const docRef = doc(resourcesCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting resource by ID:", error);
    throw error;
  }
};

/**
 * Update a resource (only by creator or admin)
 * @param {string} id - The ID of the resource
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateResource = async (id, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a resource");
    }

    const resourceRef = doc(resourcesCollection, id);
    const resourceSnap = await getDoc(resourceRef);

    if (!resourceSnap.exists()) {
      throw new Error("Resource not found");
    }

    const resourceData = resourceSnap.data();

    // Check permissions
    if (resourceData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this resource"
        );
      }
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(resourceRef, updatedData);
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
};

/**
 * Get resources created by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of resource objects with IDs created by the user
 */
export const getResourcesByUser = async (userId) => {
  try {
    console.log("resources.js: getResourcesByUser called with userId:", userId);
    const q = query(
      resourcesCollection,
      where("createdBy", "==", userId),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const resources = [];
    querySnapshot.forEach((doc) => {
      resources.push({ id: doc.id, ...doc.data() });
    });
    console.log("resources.js: Found", resources.length, "resources for user");
    return resources;
  } catch (error) {
    console.error("Error getting resources by user:", error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} userId - The ID of the user
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update profile");
    }

    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Delete a resource (only by creator or admin)
 * @param {string} id - The ID of the resource
 * @returns {Promise<void>}
 */
export const deleteResource = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a resource");
    }

    const resourceRef = doc(resourcesCollection, id);
    const resourceSnap = await getDoc(resourceRef);

    if (!resourceSnap.exists()) {
      throw new Error("Resource not found");
    }

    const resourceData = resourceSnap.data();

    // Check permissions
    if (resourceData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this resource"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(resourceRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};
