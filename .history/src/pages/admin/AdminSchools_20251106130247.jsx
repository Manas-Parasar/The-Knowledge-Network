import React, { useState, useEffect } from "react";
import {
  getSchools,
  addSchool,
  updateSchool,
  deleteSchool,
} from "../../firebase/schools";
import toast from "react-hot-toast";

const AdminSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    tutoringHours: "",
    gradeLevels: "",
    donationLink: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (err) {
      console.error("Error fetching schools:", err);
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      setFormErrors({ general: "Name and address are required" });
      return;
    }

    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, formData);
        toast.success("School updated successfully");
      } else {
        await addSchool(formData);
        toast.success("School added successfully");
      }
      fetchSchools();
      setShowModal(false);
      setEditingSchool(null);
      setFormData({
        name: "",
        address: "",
        tutoringHours: "",
        gradeLevels: "",
        donationLink: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving school:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || "",
      address: school.address || "",
      tutoringHours: school.tutoringHours || "",
      gradeLevels: school.gradeLevels || "",
      donationLink: school.donationLink || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await deleteSchool(id);
        toast.success("School deleted successfully");
        fetchSchools();
      } catch (err) {
        console.error("Error deleting school:", err);
        toast.error("Failed to delete school");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading schools...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Manage Schools</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Add School
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow min-h-[300px] flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-2">{school.name}</h2>
            <p className="text-gray-600 mb-1">
              <strong>Address:</strong> {school.address}
            </p>
            {school.tutoringHours && (
              <p className="text-gray-600 mb-1">
                <strong>Hours:</strong> {school.tutoringHours}
              </p>
            )}
            {school.gradeLevels && (
              <p className="text-gray-600 mb-1">
                <strong>Grades:</strong> {school.gradeLevels}
              </p>
            )}
            {school.donationLink && (
              <p className="text-gray-600 mb-4">
                <strong>Donation Link:</strong>{" "}
                <a
                  href={school.donationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {school.donationLink}
                </a>
              </p>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => handleEdit(school)}
                className="bg-primary text-white px-3 py-2 text-sm rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(school.id)}
                className="bg-red-500 text-white px-3 py-2 text-sm rounded-lg shadow-sm hover:bg-red-600 transition-colors"
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
              {editingSchool ? "Edit School" : "Add School"}
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
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutoring Hours
                </label>
                <input
                  type="text"
                  value={formData.tutoringHours}
                  onChange={(e) =>
                    setFormData({ ...formData, tutoringHours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Levels
                </label>
                <input
                  type="text"
                  value={formData.gradeLevels}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeLevels: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Link
                </label>
                <input
                  type="url"
                  value={formData.donationLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      donationLink: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/donate"
                />
              </div>
              {formErrors.general && (
                <p className="text-red-500 text-sm mb-4">
                  {formErrors.general}
                </p>
              )}
              <div className="flex space-x-2">
                <button type="submit" className="btn btn-primary">
                  {editingSchool ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchool(null);
                    setFormData({
                      name: "",
                      address: "",
                      tutoringHours: "",
                      gradeLevels: "",
                      donationLink: "",
                    });
                    setFormErrors({});
                  }}
                  className="btn btn-secondary"
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

export default AdminSchools;
