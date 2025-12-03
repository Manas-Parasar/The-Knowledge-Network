import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import Turndown from "turndown";

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
      const data = contentSnap.data();
      // Merge with default navbar tabs if not present
      return {
        ...data,
        navbarTabs: data.navbarTabs || [
          { id: "home", name: "Home", path: "/", enabled: true },
          { id: "schools", name: "Schools", path: "/schools", enabled: true },
          {
            id: "community",
            name: "Community",
            path: null,
            enabled: true,
            sublinks: [
              { name: "Events", path: "/events" },
              { name: "Sponsors", path: "/sponsors" },
              { name: "Donate", path: "/donations" },
            ],
          },
          {
            id: "dashboard",
            name: "Dashboard",
            path: "/dashboard",
            enabled: true,
          },
          {
            id: "admin",
            name: "Admin",
            path: "/admin-dashboard",
            enabled: true,
            adminOnly: true,
          },
          { id: "profile", name: "Profile", path: "/profile", enabled: true },
        ],
      };
    } else {
      // Return default content
      return {
        tabs: [],
        homepageText: "Welcome to The Knowledge Network",
        navbarTabs: [
          { id: "home", name: "Home", path: "/", enabled: true },
          { id: "schools", name: "Schools", path: "/schools", enabled: true },
          {
            id: "community",
            name: "Community",
            path: null,
            enabled: true,
            sublinks: [
              { name: "Events", path: "/events" },
              { name: "Sponsors", path: "/sponsors" },
              { name: "Donate", path: "/donations" },
            ],
          },
          {
            id: "dashboard",
            name: "Dashboard",
            path: "/dashboard",
            enabled: true,
          },
          {
            id: "admin",
            name: "Admin",
            path: "/admin-dashboard",
            enabled: true,
            adminOnly: true,
          },
          { id: "profile", name: "Profile", path: "/profile", enabled: true },
        ],
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

    // Convert HTML to Markdown if homepageHtml is provided
    const processedUpdates = { ...updates };
    if (processedUpdates.homepageHtml) {
      const turndownService = new Turndown();
      processedUpdates.homepageText = turndownService.turndown(
        processedUpdates.homepageHtml
      );
    }

    const contentRef = doc(db, "website", "content");
    const contentSnap = await getDoc(contentRef);

    if (contentSnap.exists()) {
      await updateDoc(contentRef, {
        ...processedUpdates,
        lastUpdated: new Date(),
      });
    } else {
      await setDoc(contentRef, {
        ...processedUpdates,
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
    const processedTabData = { ...tabData };

    // Convert HTML to Markdown if htmlContent is provided
    if (processedTabData.htmlContent) {
      const turndownService = new Turndown();
      processedTabData.content = turndownService.turndown(
        processedTabData.htmlContent
      );
    }

    const newTab = {
      id: Date.now().toString(),
      title: processedTabData.title,
      route: processedTabData.route,
      content: processedTabData.content || "",
      htmlContent: processedTabData.htmlContent || "",
      description: processedTabData.description || "",
      enabled: processedTabData.enabled !== false,
      order: processedTabData.order || 0,
      icon: processedTabData.icon || "",
      badge: processedTabData.badge || "",
      color: processedTabData.color || "",
      animation: processedTabData.animation || "",
      visibility: processedTabData.visibility || "all",
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

    const processedUpdates = { ...updates };

    // Convert HTML to Markdown if htmlContent is provided
    if (processedUpdates.htmlContent) {
      const turndownService = new Turndown();
      processedUpdates.content = turndownService.turndown(
        processedUpdates.htmlContent
      );
    }

    tabs[tabIndex] = {
      ...tabs[tabIndex],
      ...processedUpdates,
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

/**
 * Update navbar tabs (admin only)
 * @param {Array} navbarTabs - Updated navbar tabs array
 * @returns {Promise<void>}
 */
export const updateNavbarTabs = async (navbarTabs) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can update navbar tabs");
    }

    await updateWebsiteContent({ navbarTabs });
  } catch (error) {
    console.error("Error updating navbar tabs:", error);
    throw error;
  }
};

/**
 * Add a new navbar tab (admin only)
 * @param {Object} tabData - Tab data (id, name, path, enabled, adminOnly, sublinks, order)
 * @returns {Promise<void>}
 */
export const addWebsiteNavbarTab = async (tabData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated");
    }

    // Check if admin
    const userRef = doc(usersCollection, auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "capstoneAdmin") {
      throw new Error("Only admins can add navbar tabs");
    }

    const content = await getWebsiteContent();
    const navbarTabs = content.navbarTabs || [];
    const newTab = {
      id: tabData.id || Date.now().toString(),
      name: tabData.name,
      path: tabData.path,
      enabled: tabData.enabled !== false,
      adminOnly: tabData.adminOnly || false,
      sublinks: tabData.sublinks || [],
      order: tabData.order || navbarTabs.length + 1,
    };
    const updatedTabs = [...navbarTabs, newTab];
    await updateWebsiteContent({ navbarTabs: updatedTabs });
  } catch (error) {
    console.error("Error adding navbar tab:", error);
    throw error;
  }
};
