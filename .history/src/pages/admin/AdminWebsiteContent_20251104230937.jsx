import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import {
  getWebsiteContent,
  updateWebsiteContent,
  addWebsiteTab,
  updateWebsiteTab,
  deleteWebsiteTab,
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
        visibleDragBar={false}
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
    htmlContent: "",
  });
  const [homepageText, setHomepageText] = useState("");
  const [homepageHtml, setHomepageHtml] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await getWebsiteContent();
      setContent(data);
      setHomepageText(data.homepageText || "");
      setHomepageHtml(data.homepageHtml || "");
    } catch (err) {
      console.error("Error fetching website content:", err);
      toast.error("Failed to load website content");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHomepageText = async () => {
    try {
      await updateWebsiteContent({ homepageText, homepageHtml });
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
      setShowTabModal(false);
      setEditingTab(null);
      setTabFormData({ title: "", route: "", content: "", htmlContent: "" });
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
      htmlContent: tab.htmlContent || "",
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
    } catch (err) {
      console.error("Error deleting tab:", err);
      toast.error("Failed to delete tab");
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
          <WYSIWYGEditor
            value={homepageHtml}
            onChange={(value) => {
              setHomepageHtml(value);
              // Also update the plain text version for backward compatibility
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = value;
              setHomepageText(tempDiv.textContent || tempDiv.innerText || "");
            }}
            placeholder="Enter homepage welcome text..."
          />
          <button
            onClick={handleSaveHomepageText}
            className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
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
              className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
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
                      {tab.content && (
                        <p className="text-sm text-gray-600 mt-2">
                          {tab.content}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTab(tab)}
                        className="bg-primary-500 text-white px-3 py-1 rounded text-sm hover:bg-accent transition-colors"
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
      </div>

      {/* Tab Modal */}
      {showTabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                  Content
                </label>
                <WYSIWYGEditor
                  value={tabFormData.htmlContent}
                  onChange={(value) => {
                    setTabFormData({ ...tabFormData, htmlContent: value });
                    // Also update the plain text version for backward compatibility
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = value;
                    setTabFormData((prev) => ({
                      ...prev,
                      content: tempDiv.textContent || tempDiv.innerText || "",
                    }));
                  }}
                  placeholder="Enter tab content..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
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
                      htmlContent: "",
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
