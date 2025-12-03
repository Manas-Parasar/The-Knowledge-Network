import React, { useState, useEffect } from "react";
import {
  getAllSlots,
  addSlot,
  updateSlot,
  deleteSlot,
} from "../../firebase/slots";
import { getSchools } from "../../firebase/schools";
import toast from "react-hot-toast";

const AdminSlots = () => {
  const [slots, setSlots] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    schoolId: "",
    date: "",
    time: "",
    availableVolunteers: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsData, schoolsData] = await Promise.all([
        getAllSlots(),
        getSchools(),
      ]);
      setSlots(slotsData);
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
    if (!formData.schoolId || !formData.date || !formData.time) {
      setFormErrors({ general: "School, date, and time are required" });
      return;
    }

    try {
      if (editingSlot) {
        await updateSlot(editingSlot.schoolId, editingSlot.id, formData);
        toast.success("Slot updated successfully");
      } else {
        await addSlot(formData.schoolId, formData);
        toast.success("Slot added successfully");
      }
      fetchData();
      setShowModal(false);
      setEditingSlot(null);
      setFormData({
        schoolId: "",
        date: "",
        time: "",
        availableVolunteers: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving slot:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      schoolId: slot.schoolId || "",
      date: slot.date || "",
      time: slot.time || "",
      availableVolunteers: slot.availableVolunteers || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (slot) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await deleteSlot(slot.schoolId, slot.id);
        toast.success("Slot deleted successfully");
        fetchData();
      } catch (err) {
        console.error("Error deleting slot:", err);
        toast.error("Failed to delete slot");
      }
    }
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : "Unknown School";
  };

  const slotsBySchool = slots.reduce((acc, slot) => {
    const schoolId = slot.schoolId;
    if (!acc[schoolId]) {
      acc[schoolId] = [];
    }
    acc[schoolId].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading slots...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">
          Manage Tutoring Slots
        </h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Add Slot
        </button>
      </div>

      {Object.entries(slotsBySchool).map(([schoolId, schoolSlots]) => (
        <div key={schoolId} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {getSchoolName(schoolId)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-1">
                  <strong>Date:</strong> {slot.date}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Time:</strong> {slot.time}
                </p>
                {slot.availableVolunteers && (
                  <p className="text-gray-600 mb-4">
                    <strong>Volunteers:</strong> {slot.availableVolunteers}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(slot)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="btn btn-primary"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingSlot ? "Edit Slot" : "Add Slot"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School *
                </label>
                <select
                  value={formData.schoolId}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Volunteers
                </label>
                <input
                  type="number"
                  value={formData.availableVolunteers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableVolunteers: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                />
              </div>
              {formErrors.general && (
                <p className="text-red-500 text-sm mb-4">
                  {formErrors.general}
                </p>
              )}
              <div className="flex space-x-2">
                <button type="submit" className="btn btn-primary">
                  {editingSlot ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSlot(null);
                    setFormData({
                      schoolId: "",
                      date: "",
                      time: "",
                      availableVolunteers: "",
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

export default AdminSlots;
