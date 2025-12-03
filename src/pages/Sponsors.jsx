import React, { useState, useEffect } from "react";
import {
  getSponsors,
  deleteSponsor,
  addSponsor,
  updateSponsor,
} from "../firebase/sponsors";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const Sponsors = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: "",
    logo: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const fetchSponsors = async () => {
    try {
      const sponsorsData = await getSponsors();
      setSponsors(sponsorsData);
    } catch (err) {
      console.warn("Error fetching sponsors:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) {
      return;
    }

    setProcessing(true);
    try {
      await deleteSponsor(id);
      await fetchSponsors(); // Refresh data
      toast.success("Sponsor deleted successfully");
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast.error("Failed to delete sponsor");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSponsor = () => {
    setEditingSponsor(null);
    setSponsorFormData({
      name: "",
      logo: "",
      url: "",
    });
    setShowAddModal(true);
  };

  const handleEditSponsor = (sponsor) => {
    setEditingSponsor(sponsor);
    setSponsorFormData({
      name: sponsor.name || "",
      logo: sponsor.logo || "",
      url: sponsor.url || "",
    });
    setShowEditModal(true);
  };

  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorFormData.name) {
      setFormErrors({ general: "Name is required" });
      return;
    }

    setProcessing(true);
    try {
      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, sponsorFormData);
        toast.success("Sponsor updated successfully");
      } else {
        await addSponsor(sponsorFormData);
        toast.success("Sponsor added successfully");
      }

      // Refresh sponsors data
      await fetchSponsors();

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingSponsor(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error saving sponsor:", err);
      setFormErrors({ general: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleVisitWebsite = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
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
    <div className="w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-accent">Sponsors</h1>
          {canEdit && (
            <button
              onClick={handleAddSponsor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={processing}
            >
              {processing ? "Processing..." : "Add Sponsor"}
            </button>
          )}
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
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{sponsor.name}</h2>
              {sponsor.url && (
                <button
                  onClick={() => handleVisitWebsite(sponsor.url)}
                  className="text-blue-500 hover:text-blue-700 underline mb-4 block"
                >
                  Visit Website
                </button>
              )}
              <div className="flex space-x-2">
                {canEdit && (
                  <>
                    <button
                      onClick={() => handleEditSponsor(sponsor)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                      disabled={processing}
                    >
                      {processing ? "..." : "Edit"}
                    </button>
                    <button
                      onClick={() => handleRemove(sponsor.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      disabled={processing}
                    >
                      {processing ? "..." : "Remove"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Sponsor Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingSponsor ? "Edit Sponsor" : "Add Sponsor"}
            </h2>
            <form onSubmit={handleSaveSponsor}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={sponsorFormData.name}
                  onChange={(e) =>
                    setSponsorFormData({
                      ...sponsorFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={sponsorFormData.logo}
                  onChange={(e) =>
                    setSponsorFormData({
                      ...sponsorFormData,
                      logo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={sponsorFormData.url}
                  onChange={(e) =>
                    setSponsorFormData({
                      ...sponsorFormData,
                      url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : editingSponsor
                    ? "Update"
                    : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingSponsor(null);
                    setFormErrors({});
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
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

export default Sponsors;
