import React, { useState, useEffect } from "react";
import {
  getResources,
  addResource,
  updateResource,
  deleteResource,
} from "../firebase/resources";
import { getComments } from "../firebase/comments";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../hooks/useAuth";

const Resources = () => {
  const { currentUser, userRole } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    link: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchResources().finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(resources.map((r) => r.category))];
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  const canManageResource = (resource) => {
    return (
      currentUser &&
      (userRole === "capstoneAdmin" || resource.createdBy === currentUser.uid)
    );
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ title: "", description: "", category: "", link: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      link: resource.link,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setFormData({ title: "", description: "", category: "", link: "" });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.link.trim()) errors.link = "Link is required";
    else if (!/^https?:\/\/.+/.test(formData.link))
      errors.link = "Link must be a valid URL";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData);
      } else {
        await addResource(formData);
      }
      await fetchResources();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await deleteResource(resourceId);
      await fetchResources();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Resources</h1>
        {currentUser && (
          <button
            onClick={openAddModal}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Resource
          </button>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 flex-1 min-w-0"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  rows="3"
                  required
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
                {formErrors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Link *</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
                {formErrors.link && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.link}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingResource
                    ? "Update"
                    : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete "{deleteConfirm.title}"?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white shadow-md rounded-lg p-4 border"
          >
            <h2 className="text-xl font-semibold mb-2">{resource.title}</h2>
            <p className="text-gray-700 mb-2">{resource.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Category: {resource.category}
            </p>
            <div className="flex gap-2 mb-2">
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                View Resource
              </a>
              {canManageResource(resource) && (
                <>
                  <button
                    onClick={() => openEditModal(resource)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(resource)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
