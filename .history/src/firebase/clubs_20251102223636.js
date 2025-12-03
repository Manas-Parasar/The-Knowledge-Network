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
const usersCollection = collection(db, "users");

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
    const docRef = await addDoc(clubsCollection, clubData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding club:", error);
    throw error;
  }
};

export const updateClub = async (id, clubData) => {
  try {
    const clubDoc = doc(db, "clubs", id);
    await updateDoc(clubDoc, clubData);
  } catch (error) {
    console.error("Error updating club:", error);
    throw error;
  }
};

export const deleteClub = async (id) => {
  try {
    const clubDoc = doc(db, "clubs", id);
    await deleteDoc(clubDoc);
  } catch (error) {
    console.error("Error deleting club:", error);
    throw error;
  }
};
