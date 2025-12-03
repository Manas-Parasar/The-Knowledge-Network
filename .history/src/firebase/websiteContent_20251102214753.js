import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const usersCollection = collection(db, "users");

/**
 * Get website content (tabs, homepage text, etc.)
 * @returns {Promise<Object>} - Website content object
 */
export const getWebsiteContent = async () => {
  try {
    const contentRef = doc(db, "website", "content");
    const contentSnap = await getDoc(contentRef);

    if (contentSnap.exists()) {
      return contentSnap.data();
    } else {
      // Return default content
      return {
        tabs: [],
        homepageText: "Welcome to The Knowledge Network",
        lastUpdated: new Date(),
      };
    }
  } catch (error) {
    console.error("Error getting website content:", error);
    throw error;
  }
};

/**
 * Update website content (admin only)
 * @param {Object} updates - Content updates
 * @returns {Promise<void>}
 */
export const updateWebsiteContent = async (updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can update website content");
    }

    const contentRef = doc(db, "website", "content");
    const contentSnap = await getDoc(contentRef);

    if (contentSnap.exists()) {
      await updateDoc(contentRef, {
        ...updates,
        lastUpdated: new Date(),
      });
    } else {
      await setDoc(contentRef, {
        ...updates,
        lastUpdated: new Date(),
      });
    }
  } catch (error) {
    console.error("Error updating website content:", error);
    throw error;
  }
};

/**
 * Add a new website tab (admin only)
 * @param {Object} tabData - Tab data (title, route, content)
 * @returns {Promise<void>}
 */
export const addWebsiteTab = async (tabData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can add website tabs");
    }

    const content = await getWebsiteContent();
    const newTab = {
      id: Date.now().toString(),
      title: tabData.title,
      route: tabData.route,
      content: tabData.content || "",
      createdAt: new Date(),
    };

    const updatedTabs = [...(content.tabs || []), newTab];

    await updateWebsiteContent({ tabs: updatedTabs });
  } catch (error) {
    console.error("Error adding website tab:", error);
    throw error;
  }
};

/**
 * Update a website tab (admin only)
 * @param {string} tabId - Tab ID
 * @param {Object} updates - Tab updates
 * @returns {Promise<void>}
 */
export const updateWebsiteTab = async (tabId, updates) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can update website tabs");
    }

    const content = await getWebsiteContent();
    const tabs = content.tabs || [];
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex === -1) {
      throw new Error("Tab not found");
    }

    tabs[tabIndex] = {
      ...tabs[tabIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await updateWebsiteContent({ tabs });
  } catch (error) {
    console.error("Error updating website tab:", error);
    throw error;
  }
};

/**
 * Delete a website tab (admin only)
 * @param {string} tabId - Tab ID
 * @returns {Promise<void>}
 */
export const deleteWebsiteTab = async (tabId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can delete website tabs");
    }

    const content = await getWebsiteContent();
    const tabs = content.tabs || [];
    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);

    await updateWebsiteContent({ tabs: updatedTabs });
  } catch (error) {
    console.error("Error deleting website tab:", error);
    throw error;
  }
};
