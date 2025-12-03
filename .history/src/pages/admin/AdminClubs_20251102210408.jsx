import React, { useState, useEffect } from "react";
import {
  getClubs,
  addClub,
  updateClub,
  deleteClub,
} from "../../firebase/clubs";
import toast from "react-hot-toast";

const AdminClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const clubsData = await getClubs();
      setClubs(clubsData);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setFormErrors({ general: "Name and description are required" });
      return;
    }

    try {
      if (editingClub) {
        await updateClub(editingClub.id, formData);
        toast.success("Club updated successfully");
      } else {
        await addClub(formData);
        toast.success("Club added successfully");
      }
      fetchClubs();
      setShowModal(false);
      setEditingClub(null);
      setFormData({
        name: "",
        description: "",
        photo: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving club:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name || "",
      description: club.description || "",
      photo: club.photo || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this club?")) {
      try {
        await deleteClub(id);
        toast.success("Club deleted successfully");
        fetchClubs();
      } catch (err) {
        console.error("Error deleting club:", err);
        toast.error("Failed to delete club");
      }
    }
  };

  const setFeaturedClub = async (clubId) => {
    try {
      // First, unset any currently featured club
      const currentFeatured = clubs.find((club) => club.featured);
      if (currentFeatured) {
        await updateClub(currentFeatured.id, { featured: false });
      }
      // Then set the new featured club
      await updateClub(clubId, { featured: true });
      toast.success("Club of the week updated!");
      fetchClubs();
    } catch (err) {
      console.error("Error setting featured club:", err);
      toast.error("Failed to update featured club");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading clubs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Manage Clubs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
        >
          Add Club
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Club of the Week</h2>
        {clubs.find((club) => club.featured) ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center">
              {clubs.find((club) => club.featured)?.photo && (
                <img
                  src={clubs.find((club) => club.featured)?.photo}
                  alt={clubs.find((club) => club.featured)?.name}
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">
                  {clubs.find((club) => club.featured)?.name}
                </h3>
                <p className="text-gray-600">
                  {clubs.find((club) => club.featured)?.description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No club featured this week.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {club.photo && (
              <img
                src={club.photo}
                alt={club.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{club.name}</h2>
            <p className="text-gray-600 mb-4">{club.description}</p>
            {club.featured && (
              <span className="inline-block bg-yellow-500 text-white px-2 py-1 rounded text-sm mb-2">
                Featured Club
              </span>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(club)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setFeaturedClub(club.id)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-yellow-600 transition-colors"
              >
                Feature
              </button>
              <button
                onClick={() => handleDelete(club.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingClub ? "Edit Club" : "Add Club"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {formErrors.general && (
                <p className="text-red-500 text-sm mb-4">
                  {formErrors.general}
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  {editingClub ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClub(null);
                    setFormData({
                      name: "",
                      description: "",
                      photo: "",
                    });
                    setFormErrors({});
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

export default AdminClubs;
