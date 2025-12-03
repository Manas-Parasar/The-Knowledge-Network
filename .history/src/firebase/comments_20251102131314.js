import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Add a new comment to a resource
 * @param {string} resourceId - The ID of the resource
 * @param {Object} commentData - The data for the new comment (e.g., { text: "comment text" })
 * @returns {Promise<string>} - The ID of the newly created comment
 */
export const addComment = async (resourceId, commentData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a comment");
    }

    const commentsCollection = collection(
      db,
      "resources",
      resourceId,
      "comments"
    );

    const newComment = {
      ...commentData,
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
    };

    const docRef = await addDoc(commentsCollection, newComment);
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

/**
 * Get all comments for a resource, ordered by createdAt
 * @param {string} resourceId - The ID of the resource
 * @returns {Promise<Array>} - Array of comment objects with IDs
 */
export const getComments = async (resourceId) => {
  try {
    const commentsCollection = collection(
      db,
      "resources",
      resourceId,
      "comments"
    );
    const q = query(commentsCollection, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

/**
 * Delete a comment (only by author or admin)
 * @param {string} resourceId - The ID of the resource
 * @param {string} commentId - The ID of the comment
 * @returns {Promise<void>}
 */
export const deleteComment = async (resourceId, commentId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a comment");
    }

    const commentRef = doc(db, "resources", resourceId, "comments", commentId);
    const commentSnap = await getDocs(
      query(
        collection(db, "resources", resourceId, "comments"),
        where("__name__", "==", commentRef)
      )
    );

    // Since getDocs on a single doc is tricky, better to get the doc directly
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("Comment not found");
    }

    const commentData = commentDoc.data();

    // Check permissions
    if (commentData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the author or an admin can delete this comment"
        );
      }
    }

    await deleteDoc(commentRef);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
