import React, { useState, useEffect } from "react";
import {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
} from "../../firebase/donations";
import { getSchools } from "../../firebase/schools";
import toast from "react-hot-toast";

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [formData, setFormData] = useState({
    method: "",
    details: "",
    schoolId: "",
    eventId: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsData, schoolsData] = await Promise.all([
        getDonations(),
        getSchools(),
      ]);
      setDonations(donationsData);
      setSchools(schoolsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.method) {
      setFormErrors({ general: "Donation method is required" });
      return;
    }

    try {
      if (editingDonation) {
        await updateDonation(editingDonation.id, formData);
        toast.success("Donation method updated successfully");
      } else {
        await addDonation(formData);
        toast.success("Donation method added successfully");
      }
      fetchData();
      setShowModal(false);
      setEditingDonation(null);
      setFormData({
        method: "",
        details: "",
        schoolId: "",
        eventId: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving donation:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (donation) => {
    setEditingDonation(donation);
    setFormData({
      method: donation.method || "",
      details: donation.details || "",
      schoolId: donation.schoolId || "",
      eventId: donation.eventId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this donation method?")
    ) {
      try {
        await deleteDonation(id);
        toast.success("Donation method deleted successfully");
        fetchData();
      } catch (err) {
        console.error("Error deleting donation:", err);
        toast.error("Failed to delete donation method");
      }
    }
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : "General";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading donation methods...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Manage Donations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
        >
          Add Donation Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{donation.method}</h2>
            <p className="text-gray-600 mb-1">
              <strong>School:</strong> {getSchoolName(donation.schoolId)}
            </p>
            {donation.details && (
              <p className="text-gray-600 mb-4">{donation.details}</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(donation)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(donation.id)}
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
              {editingDonation ? "Edit Donation Method" : "Add Donation Method"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method * (e.g., PayPal, Venmo, Zelle)
                </label>
                <input
                  type="text"
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details (account info, link, etc.)
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated School (optional)
                </label>
                <select
                  value={formData.schoolId}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">General (all schools)</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Event ID (optional)
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
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
                  {editingDonation ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDonation(null);
                    setFormData({
                      method: "",
                      details: "",
                      schoolId: "",
                      eventId: "",
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

export default AdminDonations;
