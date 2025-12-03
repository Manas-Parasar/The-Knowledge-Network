import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import {
  getWebsiteContent,
  updateWebsiteContent,
  addWebsiteTab,
  updateWebsiteTab,
  deleteWebsiteTab,
  updateNavbarTabs,
} from "../../firebase/websiteContent";
import toast from "react-hot-toast";

// Markdown Editor component using @uiw/react-md-editor
const MarkdownEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="border border-gray-300 rounded-lg">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        hideToolbar={false}
        textareaProps={{
          placeholder: placeholder,
        }}
        className="bg-white"
      />
      <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
        💡 Tip: Use Markdown syntax or the toolbar above to format your text.
        Click and type to edit content.
      </div>
    </div>
  );
};

const AdminWebsiteContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTabModal, setShowTabModal] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [tabFormData, setTabFormData] = useState({
    title: "",
    route: "",
    content: "",
    description: "",
    enabled: true,
    order: 0,
    icon: "",
    badge: "",
    color: "",
    animation: "",
    visibility: "all",
  });
  const [homepageText, setHomepageText] = useState("");
  const [navbarTabs, setNavbarTabs] = useState([]);
  const [showNavbarModal, setShowNavbarModal] = useState(false);
  const [editingNavbarTab, setEditingNavbarTab] = useState(null);
  const [navbarFormData, setNavbarFormData] = useState({
    name: "",
    path: "",
    enabled: true,
    adminOnly: false,
    sublinks: [],
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await getWebsiteContent();
      setContent(data);
      setHomepageText(data.homepageText || "");
      setNavbarTabs(data.navbarTabs || []);
    } catch (err) {
      console.error("Error fetching website content:", err);
      toast.error("Failed to load website content");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHomepageText = async () => {
    try {
      await updateWebsiteContent({ homepageText });
      toast.success("Homepage text updated successfully");
      fetchContent();
    } catch (err) {
      console.error("Error updating homepage text:", err);
      toast.error("Failed to update homepage text");
    }
  };

  const handleTabSubmit = async (e) => {
    e.preventDefault();
    if (!tabFormData.title || !tabFormData.route) {
      toast.error("Title and route are required");
      return;
    }

    try {
      if (editingTab) {
        await updateWebsiteTab(editingTab.id, tabFormData);
        toast.success("Tab updated successfully");
      } else {
        await addWebsiteTab(tabFormData);
        toast.success("Tab added successfully");
      }
      fetchContent();
      // Dispatch custom event to notify navbar of tab changes
      window.dispatchEvent(new CustomEvent("tabsUpdated"));
      setShowTabModal(false);
      setEditingTab(null);
      setTabFormData({ title: "", route: "", content: "" });
    } catch (err) {
      console.error("Error saving tab:", err);
      toast.error("Failed to save tab");
    }
  };

  const handleEditTab = (tab) => {
    setEditingTab(tab);
    setTabFormData({
      title: tab.title || "",
      route: tab.route || "",
      content: tab.content || "",
      description: tab.description || "",
      enabled: tab.enabled !== false,
      order: tab.order || 0,
      icon: tab.icon || "",
      badge: tab.badge || "",
      color: tab.color || "",
      animation: tab.animation || "",
      visibility: tab.visibility || "all",
    });
    setShowTabModal(true);
  };

  const handleDeleteTab = async (tabId) => {
    if (!window.confirm("Are you sure you want to delete this tab?")) {
      return;
    }

    try {
      await deleteWebsiteTab(tabId);
      toast.success("Tab deleted successfully");
      fetchContent();
      // Dispatch custom event to notify navbar of tab changes
      window.dispatchEvent(new CustomEvent("tabsUpdated"));
    } catch (err) {
      console.error("Error deleting tab:", err);
      toast.error("Failed to delete tab");
    }
  };

  const handleNavbarSubmit = async (e) => {
    e.preventDefault();
    if (!navbarFormData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      let updatedTabs;
      if (editingNavbarTab) {
        updatedTabs = navbarTabs.map((tab) =>
          tab.id === editingNavbarTab.id ? { ...tab, ...navbarFormData } : tab
        );
      } else {
        const newTab = {
          id: Date.now().toString(),
          ...navbarFormData,
        };
        updatedTabs = [...navbarTabs, newTab];
      }

      await updateNavbarTabs(updatedTabs);
      toast.success(
        editingNavbarTab
          ? "Navbar tab updated successfully"
          : "Navbar tab added successfully"
      );
      fetchContent();
      // Dispatch custom event to notify navbar of tab changes
      window.dispatchEvent(new CustomEvent("tabsUpdated"));
      setShowNavbarModal(false);
      setEditingNavbarTab(null);
      setNavbarFormData({
        name: "",
        path: "",
        enabled: true,
        adminOnly: false,
        sublinks: [],
      });
    } catch (err) {
      console.error("Error saving navbar tab:", err);
      toast.error("Failed to save navbar tab");
    }
  };

  const handleEditNavbarTab = (tab) => {
    setEditingNavbarTab(tab);
    setNavbarFormData({
      name: tab.name || "",
      path: tab.path || "",
      enabled: tab.enabled !== false,
      adminOnly: tab.adminOnly || false,
      sublinks: tab.sublinks || [],
    });
    setShowNavbarModal(true);
  };

  const handleDeleteNavbarTab = async (tabId) => {
    if (!window.confirm("Are you sure you want to delete this navbar tab?")) {
      return;
    }

    try {
      const updatedTabs = navbarTabs.filter((tab) => tab.id !== tabId);
      await updateNavbarTabs(updatedTabs);
      toast.success("Navbar tab deleted successfully");
      fetchContent();
      // Dispatch custom event to notify navbar of tab changes
      window.dispatchEvent(new CustomEvent("tabsUpdated"));
    } catch (err) {
      console.error("Error deleting navbar tab:", err);
      toast.error("Failed to delete navbar tab");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading website content...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent mb-8">
        Website Content Management
      </h1>

      <div className="space-y-8">
        {/* Homepage Text */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Homepage Text</h2>
          <MarkdownEditor
            value={homepageText}
            onChange={setHomepageText}
            placeholder="Enter homepage welcome text..."
          />
          <button
            onClick={handleSaveHomepageText}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
          >
            Save Homepage Text
          </button>
        </div>

        {/* Website Tabs */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Website Tabs</h2>
            <button
              onClick={() => setShowTabModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
            >
              Add Tab
            </button>
          </div>

          <div className="space-y-4">
            {content?.tabs?.length === 0 ? (
              <p className="text-gray-600">No tabs created yet.</p>
            ) : (
              content?.tabs?.map((tab) => (
                <div
                  key={tab.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{tab.title}</h3>
                      <p className="text-sm text-gray-600">
                        Route: {tab.route}
                      </p>
                      {tab.description && (
                        <p className="text-sm text-gray-600">
                          Description: {tab.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Enabled: {tab.enabled ? "Yes" : "No"}
                      </p>
                      {tab.order !== undefined && (
                        <p className="text-sm text-gray-600">
                          Order: {tab.order}
                        </p>
                      )}
                      {tab.icon && (
                        <p className="text-sm text-gray-600">
                          Icon: {tab.icon}
                        </p>
                      )}
                      {tab.badge && (
                        <p className="text-sm text-gray-600">
                          Badge: {tab.badge}
                        </p>
                      )}
                      {tab.color && (
                        <p className="text-sm text-gray-600">
                          Color: {tab.color}
                        </p>
                      )}
                      {tab.animation && (
                        <p className="text-sm text-gray-600">
                          Animation: {tab.animation}
                        </p>
                      )}
                      {tab.visibility && tab.visibility !== "all" && (
                        <p className="text-sm text-gray-600">
                          Visibility: {tab.visibility}
                        </p>
                      )}
                      {tab.content && (
                        <p className="text-sm text-gray-600 mt-2">
                          Content: {tab.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTab(tab)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTab(tab.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navbar Tabs */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Navbar Tabs</h2>
            <button
              onClick={() => setShowNavbarModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
            >
              Add Tab
            </button>
          </div>

          <div className="space-y-4">
            {navbarTabs.map((tab) => (
              <div
                key={tab.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{tab.name}</h3>
                    <p className="text-sm text-gray-600">
                      Path: {tab.path || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Enabled: {tab.enabled ? "Yes" : "No"}
                    </p>
                    {tab.adminOnly && (
                      <p className="text-sm text-gray-600">Admin Only: Yes</p>
                    )}
                    {tab.sublinks && tab.sublinks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Sublinks:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {tab.sublinks.map((sublink, idx) => (
                            <li key={idx}>
                              {sublink.name} - {sublink.path}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditNavbarTab(tab)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNavbarTab(tab.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navbar Modal */}
      {showNavbarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">
              {editingNavbarTab ? "Edit Navbar Tab" : "Add Navbar Tab"}
            </h2>
            <form onSubmit={handleNavbarSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={navbarFormData.name}
                  onChange={(e) =>
                    setNavbarFormData({
                      ...navbarFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path (leave empty for dropdown)
                </label>
                <input
                  type="text"
                  value={navbarFormData.path}
                  onChange={(e) =>
                    setNavbarFormData({
                      ...navbarFormData,
                      path: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/example-path"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={navbarFormData.enabled}
                    onChange={(e) =>
                      setNavbarFormData({
                        ...navbarFormData,
                        enabled: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Enabled
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={navbarFormData.adminOnly}
                    onChange={(e) =>
                      setNavbarFormData({
                        ...navbarFormData,
                        adminOnly: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Admin Only
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sublinks
                </label>
                {navbarFormData.sublinks.map((sublink, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={sublink.name}
                      onChange={(e) => {
                        const newSublinks = [...navbarFormData.sublinks];
                        newSublinks[index].name = e.target.value;
                        setNavbarFormData({
                          ...navbarFormData,
                          sublinks: newSublinks,
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Path"
                      value={sublink.path}
                      onChange={(e) => {
                        const newSublinks = [...navbarFormData.sublinks];
                        newSublinks[index].path = e.target.value;
                        setNavbarFormData({
                          ...navbarFormData,
                          sublinks: newSublinks,
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSublinks = navbarFormData.sublinks.filter(
                          (_, i) => i !== index
                        );
                        setNavbarFormData({
                          ...navbarFormData,
                          sublinks: newSublinks,
                        });
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setNavbarFormData({
                      ...navbarFormData,
                      sublinks: [
                        ...navbarFormData.sublinks,
                        { name: "", path: "" },
                      ],
                    });
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                  Add Sublink
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                  {editingNavbarTab ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNavbarModal(false);
                    setEditingNavbarTab(null);
                    setNavbarFormData({
                      name: "",
                      path: "",
                      enabled: true,
                      adminOnly: false,
                      sublinks: [],
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Modal */}
      {showTabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTab ? "Edit Tab" : "Add Tab"}
            </h2>
            <form onSubmit={handleTabSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={tabFormData.title}
                  onChange={(e) =>
                    setTabFormData({ ...tabFormData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route * (e.g., /community-partners)
                </label>
                <input
                  type="text"
                  value={tabFormData.route}
                  onChange={(e) =>
                    setTabFormData({ ...tabFormData, route: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={tabFormData.description}
                  onChange={(e) =>
                    setTabFormData({
                      ...tabFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description of the tab"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tabFormData.enabled}
                    onChange={(e) =>
                      setTabFormData({
                        ...tabFormData,
                        enabled: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Enabled
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order (for sorting)
                </label>
                <input
                  type="number"
                  value={tabFormData.order}
                  onChange={(e) =>
                    setTabFormData({
                      ...tabFormData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (FontAwesome class)
                </label>
                <input
                  type="text"
                  value={tabFormData.icon}
                  onChange={(e) =>
                    setTabFormData({ ...tabFormData, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., fa-users, fa-star, fa-heart"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add visual icons from FontAwesome (e.g., fa-users for users
                  icon)
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Text (optional notification)
                </label>
                <input
                  type="text"
                  value={tabFormData.badge}
                  onChange={(e) =>
                    setTabFormData({ ...tabFormData, badge: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., NEW, HOT, SALE"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Display a small badge next to the tab title
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Color (CSS class)
                </label>
                <input
                  type="text"
                  value={tabFormData.color}
                  onChange={(e) =>
                    setTabFormData({ ...tabFormData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., text-red-500, bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Apply custom Tailwind CSS classes for unique styling
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animation Effect
                </label>
                <select
                  value={tabFormData.animation}
                  onChange={(e) =>
                    setTabFormData({
                      ...tabFormData,
                      animation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">None</option>
                  <option value="animate-pulse">Pulse</option>
                  <option value="animate-bounce">Bounce</option>
                  <option value="animate-spin">Spin</option>
                  <option value="animate-ping">Ping</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Add eye-catching animation effects to draw attention
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility Settings
                </label>
                <select
                  value={tabFormData.visibility}
                  onChange={(e) =>
                    setTabFormData({
                      ...tabFormData,
                      visibility: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Visible to Everyone</option>
                  <option value="authenticated">Logged-in Users Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Control who can see this tab based on user status
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <MarkdownEditor
                  value={tabFormData.content}
                  onChange={(value) =>
                    setTabFormData({ ...tabFormData, content: value })
                  }
                  placeholder="Enter tab content..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                  {editingTab ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTabModal(false);
                    setEditingTab(null);
                    setTabFormData({
                      title: "",
                      route: "",
                      content: "",
                      description: "",
                      enabled: true,
                      order: 0,
                      icon: "",
                      badge: "",
                      color: "",
                      animation: "",
                      visibility: "all",
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebsiteContent;
