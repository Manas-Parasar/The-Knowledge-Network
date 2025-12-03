import React, { useState, useEffect } from "react";
import {
  getSponsors,
  addSponsor,
  updateSponsor,
  deleteSponsor,
} from "../../firebase/sponsors";
import toast from "react-hot-toast";

const AdminSponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const sponsorsData = await getSponsors();
      setSponsors(sponsorsData);
    } catch (err) {
      console.error("Error fetching sponsors:", err);
      toast.error("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormErrors({ general: "Name is required" });
      return;
    }

    try {
      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, formData);
        toast.success("Sponsor updated successfully");
      } else {
        await addSponsor(formData);
        toast.success("Sponsor added successfully");
      }
      fetchSponsors();
      setShowModal(false);
      setEditingSponsor(null);
      setFormData({
        name: "",
        logo: "",
        url: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving sponsor:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || "",
      logo: sponsor.logo || "",
      url: sponsor.url || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await deleteSponsor(id);
        toast.success("Sponsor deleted successfully");
        fetchSponsors();
      } catch (err) {
        console.error("Error deleting sponsor:", err);
        toast.error("Failed to delete sponsor");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading sponsors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Manage Sponsors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
        >
          Add Sponsor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {sponsor.logo && (
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-full h-32 object-contain rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{sponsor.name}</h2>
            {sponsor.url && (
              <p className="text-gray-600 mb-4">
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              </p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(sponsor)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(sponsor.id)}
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
              {editingSponsor ? "Edit Sponsor" : "Add Sponsor"}
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
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
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
                  {editingSponsor ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSponsor(null);
                    setFormData({
                      name: "",
                      logo: "",
                      url: "",
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

export default AdminSponsors;
