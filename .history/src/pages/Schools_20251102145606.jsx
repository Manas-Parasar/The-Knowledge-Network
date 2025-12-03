import React, { useState, useEffect } from "react";
import {
  getSchools,
  addSchool,
  updateSchool,
  deleteSchool,
} from "../firebase/schools";
import { useAuth } from "../hooks/useAuth";

const Schools = () => {
  const { currentUser, userRole } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    timeOffered: "",
    gradeLevels: "",
    donationInfo: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsData = await getSchools();
        setSchools(schoolsData);
      } catch (err) {
        setError("Failed to load schools. Please try again later.");
        console.error("Error fetching schools:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading schools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  const handleAddSchool = () => {
    setEditingSchool(null);
    setFormData({
      name: "",
      address: "",
      timeOffered: "",
      gradeLevels: "",
      donationInfo: "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditSchool = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address,
      timeOffered: school.timeOffered,
      gradeLevels: school.gradeLevels,
      donationInfo: school.donationInfo,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteSchool = (schoolId) => {
    setShowDeleteConfirm(schoolId);
  };

  const confirmDelete = async () => {
    try {
      await deleteSchool(showDeleteConfirm);
      setSchools(schools.filter((school) => school.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError("Failed to delete school. Please try again.");
      console.error("Error deleting school:", error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.timeOffered.trim())
      errors.timeOffered = "Time offered is required";
    if (!formData.gradeLevels.trim())
      errors.gradeLevels = "Grade levels are required";
    if (!formData.donationInfo.trim())
      errors.donationInfo = "Donation info is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, formData);
        setSchools(
          schools.map((school) =>
            school.id === editingSchool.id ? { ...school, ...formData } : school
          )
        );
      } else {
        const newSchoolId = await addSchool(formData);
        const newSchool = {
          id: newSchoolId,
          ...formData,
          createdBy: currentUser.uid,
        };
        setSchools([...schools, newSchool]);
      }
      setShowModal(false);
    } catch (error) {
      setError("Failed to save school. Please try again.");
      console.error("Error saving school:", error);
    }
  };

  const canEditOrDelete = (school) => {
    return (
      currentUser &&
      (school.createdBy === currentUser.uid || userRole === "capstoneAdmin")
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Schools</h1>
        {currentUser && (
          <button
            onClick={handleAddSchool}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add School
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{school.name}</h2>
            <p className="text-gray-600 mb-1">
              <strong>Address:</strong> {school.address}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Time Offered:</strong> {school.timeOffered}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Grade Levels:</strong> {school.gradeLevels}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Donation Info:</strong> {school.donationInfo}
            </p>
            <div className="flex space-x-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                Manage Slots
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schools;
