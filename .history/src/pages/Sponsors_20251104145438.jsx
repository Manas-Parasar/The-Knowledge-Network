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
      setSponsors(sponsors.filter((sponsor) => sponsor.id !== id));
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? "Cancel" : "Add Sponsor"}
            </button>
          )}
        </div>
        {showAddForm && <AddSponsorForm onAdd={handleAdd} />}
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
              {sponsor.link && (
                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Visit Website
                </a>
              )}
              <div className="flex space-x-2 mt-4">
                <button className="btn btn-secondary">View Details</button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => handleRemove(sponsor.id)}
                      className="btn btn-primary"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sponsors;
