import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");
const eventsCollection = collection(db, "events");

/**
 * Add a new event to a school's events array
 * @param {string} schoolId - The ID of the school
 * @param {Object} eventData - The data for the new event
 * @returns {Promise<void>}
 */
export const addEvent = async (schoolId, eventData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add an event");
    }

    const schoolRef = doc(collection(db, "schools"), schoolId);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();
    const newEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEvents = [...(schoolData.events || []), newEvent];

    await updateDoc(schoolRef, {
      events: updatedEvents,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

/**
 * Get all events across all schools
 * @returns {Promise<Array>} - Array of event objects with school info
 */
export const getEvents = async () => {
  try {
    const schools = await getDocs(collection(db, "schools"));
    const allEvents = [];

    schools.forEach((schoolDoc) => {
      const schoolData = schoolDoc.data();
      const events = schoolData.events || [];
      events.forEach((event) => {
        allEvents.push({
          ...event,
          schoolId: schoolDoc.id,
          schoolName: schoolData.name,
        });
      });
    });

    return allEvents;
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

/**
 * Get events for a specific school
 * @param {string} schoolId - The ID of the school
 * @returns {Promise<Array>} - Array of event objects
 */
export const getEventsBySchool = async (schoolId) => {
  try {
    const schoolRef = doc(collection(db, "schools"), schoolId);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      return [];
    }

    const schoolData = schoolSnap.data();
    return schoolData.events || [];
  } catch (error) {
    console.error("Error getting events by school:", error);
    throw error;
  }
};

/**
 * Update an event (only by creator or admin)
 * @param {string} schoolId - The ID of the school
 * @param {string} eventId - The ID of the event
 * @param {Object} updates - The updates to apply
 * @returns {Promise<void>}
 */
export const updateEvent = async (schoolId, eventId, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update an event");
    }

    const schoolRef = doc(collection(db, "schools"), schoolId);
    const schoolSnap = await getDoc(schoolRef);

    if (!schoolSnap.exists()) {
      throw new Error("School not found");
    }

    const schoolData = schoolSnap.data();
    const events = schoolData.events || [];
    const eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const eventData = events[eventIndex];

    // Check permissions
    if (eventData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can update this event"
        );
      }
    }

    const updatedEvent = {
      ...eventData,
      ...updates,
      updatedAt: new Date(),
    };

    events[eventIndex] = updatedEvent;

    await updateDoc(schoolRef, {
      events: events,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

/**
 * Delete an event (only by creator or admin)
 * @param {string} id - The ID of the event
 * @returns {Promise<void>}
 */
export const deleteEvent = async (id) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to delete an event");
    }

    const eventRef = doc(eventsCollection, id);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error("Event not found");
    }

    const eventData = eventSnap.data();

    // Check permissions
    if (eventData.createdBy !== auth.currentUser.uid) {
      // Check if user is admin
      const userRef = doc(usersCollection, auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
        throw new Error(
          "Permission denied: Only the creator or an admin can delete this event"
        );
      }
    }

    // Soft delete by setting isActive to false
    await updateDoc(eventRef, { isActive: false, updatedAt: new Date() });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};
