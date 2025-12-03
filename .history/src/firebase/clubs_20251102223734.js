import { db, auth } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const clubsCollection = collection(db, "clubs");

export const getClubs = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to view clubs");
    }

    const q = query(
      clubsCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching clubs:", error);
    throw error;
  }
};

export const addClub = async (clubData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a club");
    }

    const newClub = {
      ...clubData,
      createdBy: auth.currentUser.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(clubsCollection, newClub);
    return docRef.id;
  } catch (error) {
    console.error("Error adding club:", error);
    throw error;
  }
};

export const updateClub = async (id, clubData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update a club");
    }

    const clubDoc = doc(db, "clubs", id);
    const updatedData = {
      ...clubData,
      updatedAt: new Date(),
    };
    await updateDoc(clubDoc, updatedData);
  } catch (error) {
    console.error("Error updating club:", error);
    throw error;
  }
};

export const deleteClub = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete a club");
    }

    const clubDoc = doc(db, "clubs", id);
    // Soft delete by setting isActive to false
    await updateDoc(clubDoc, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting club:", error);
    throw error;
  }
};
