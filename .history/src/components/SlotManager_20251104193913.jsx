import React, { useState, useEffect } from "react";
import { getSlots, addSlot, updateSlot, deleteSlot } from "../firebase/slots";
import { getUsers } from "../firebase/users";
import { useAuth } from "../hooks/useAuth";

const SlotManager = ({ schoolId, schoolName, onClose }) => {
  const { currentUser, userRole } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showManageSignups, setShowManageSignups] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    volunteerName: "",
    description: "",
    capacity: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const slotsData = await getSlots(schoolId);
        setSlots(slotsData);
      } catch (err) {
        setError("Failed to load slots. Please try again later.");
        console.error("Error fetching slots:", err);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchSlots();
    }
  }, [schoolId]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (userRole === "capstoneAdmin") {
        try {
          const usersData = await getAllUsers();
          setUsers(usersData);
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      }
    };

    fetchUsers();
  }, [userRole]);

  const resetForm = () => {
    setFormData({
      date: "",
      time: "",
      volunteerName: "",
      description: "",
      capacity: 1,
    });
    setFormErrors({});
  };

  const handleAddSlot = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date || "",
      time: slot.time || "",
      volunteerName: slot.volunteerName || "",
      description: slot.description || "",
      capacity: slot.capacity || 1,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteSlot = (slotId) => {
    setShowDeleteConfirm(slotId);
  };

  const confirmDelete = async () => {
    try {
      await deleteSlot(schoolId, showDeleteConfirm);
      setSlots(slots.filter((slot) => slot.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError("Failed to delete slot. Please try again.");
      console.error("Error deleting slot:", error);
    }
  };

  const validateForm = () => {
    console.log("DEBUG: Validating form data:", formData);
    const errors = {};
    if (!formData.date) errors.date = "Date is required";
    if (!formData.time) errors.time = "Time is required";
    if (!formData.volunteerName.trim())
      errors.volunteerName = "Volunteer name is required";

    // Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.date && !dateRegex.test(formData.date)) {
      errors.date = "Date must be in YYYY-MM-DD format";
    }

    // Time format validation (assuming HH:MM format)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (formData.time && !timeRegex.test(formData.time)) {
      errors.time = "Time must be in HH:MM format (24-hour)";
    }

    if (formData.capacity < 1) errors.capacity = "Capacity must be at least 1";

    console.log("DEBUG: Form validation errors:", errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("DEBUG: Handling slot submit, editingSlot:", editingSlot);
    if (!validateForm()) return;

    try {
      const slotData = {
        title: `${formData.volunteerName} - ${formData.date} ${formData.time}`,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        volunteerName: formData.volunteerName,
        capacity: parseInt(formData.capacity),
      };
      console.log("DEBUG: Slot data to save:", slotData);

      if (editingSlot) {
        console.log("DEBUG: Updating existing slot:", editingSlot.id);
        await updateSlot(schoolId, editingSlot.id, slotData);
        setSlots(
          slots.map((slot) =>
            slot.id === editingSlot.id ? { ...slot, ...slotData } : slot
          )
        );
        setShowEditModal(false);
      } else {
        console.log("DEBUG: Adding new slot");
        const newSlotId = await addSlot(schoolId, slotData);
        const newSlot = {
          id: newSlotId,
          ...slotData,
          createdBy: currentUser.uid,
          isActive: true,
          signedUpUsers: [],
        };
        setSlots([...slots, newSlot]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.log("DEBUG: Error saving slot:", error);
      setError("Failed to save slot. Please try again.");
      console.error("Error saving slot:", error);
    }
  };

  const canEditOrDelete = (slot) => {
    return (
      currentUser &&
      (slot.createdBy === currentUser.uid || userRole === "capstoneAdmin")
    );
  };

  const handleManageSignups = (slot) => {
    setShowManageSignups(slot);
    setSelectedUser("");
  };

  const handleAddUser = async () => {
    console.log("DEBUG: Adding user to slot, selectedUser:", selectedUser);
    if (!selectedUser) return;

    const user = users.find((u) => u.id === selectedUser);
    if (!user) {
      console.log("DEBUG: User not found in users list");
      return;
    }
    console.log("DEBUG: Found user:", user);

    try {
      await addUserToSlot(
        schoolId,
        showManageSignups.id,
        user.id,
        user.name || user.email
      );
      console.log("DEBUG: Successfully added user to slot in Firebase");
      // Update local state
      const updatedSlots = slots.map((slot) =>
        slot.id === showManageSignups.id
          ? {
              ...slot,
              signedUpUsers: [
                ...slot.signedUpUsers,
                { userId: user.id, userName: user.name || user.email },
              ],
            }
          : slot
      );
      setSlots(updatedSlots);
      setSelectedUser("");
    } catch (error) {
      console.log("DEBUG: Error adding user to slot:", error);
      setError("Failed to add user to slot. Please try again.");
      console.error("Error adding user:", error);
    }
  };

  const handleRemoveUser = async (userId) => {
    console.log("DEBUG: Removing user from slot, userId:", userId);
    try {
      await removeUserFromSlot(schoolId, showManageSignups.id, userId);
      console.log("DEBUG: Successfully removed user from slot in Firebase");
      // Update local state
      const updatedSlots = slots.map((slot) =>
        slot.id === showManageSignups.id
          ? {
              ...slot,
              signedUpUsers: slot.signedUpUsers.filter(
                (u) => u.userId !== userId
              ),
            }
          : slot
      );
      setSlots(updatedSlots);
    } catch (error) {
      console.log("DEBUG: Error removing user from slot:", error);
      setError("Failed to remove user from slot. Please try again.");
      console.error("Error removing user:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-lg">Loading slots...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-accent">
            Manage Slots - {schoolName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Slots</h3>
          {currentUser && (
            <button
              onClick={handleAddSlot}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
            >
              Add Slot
            </button>
          )}
        </div>

        <div className="space-y-4">
          {slots.length === 0 ? (
            <p className="text-gray-500">No slots available for this school.</p>
          ) : (
            slots.map((slot) => (
              <div
                key={slot.id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{slot.title}</h4>
                    <p className="text-gray-600 mb-1">
                      <strong>Date:</strong> {slot.date}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Time:</strong> {slot.time}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Volunteer:</strong> {slot.volunteerName}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Capacity:</strong> {slot.capacity}
                    </p>
                    {slot.description && (
                      <p className="text-gray-600 mb-1">
                        <strong>Description:</strong> {slot.description}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <strong>Signed Up:</strong>{" "}
                      {slot.signedUpUsers?.length || 0} / {slot.capacity}
                    </p>
                    {userRole === "capstoneAdmin" &&
                      slot.signedUpUsers?.length > 0 && (
                        <div className="mt-2">
                          <strong>Signed Up Users:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {slot.signedUpUsers.map((user, index) => (
                              <li key={index}>{user.userName}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  {canEditOrDelete(slot) && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="bg-primary-500 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-accent transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="bg-primary-500 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-accent transition-colors text-sm"
                      >
                        Delete
                      </button>
                      {userRole === "capstoneAdmin" && (
                        <button
                          onClick={() => handleManageSignups(slot)}
                          className="bg-primary-500 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-accent transition-colors text-sm"
                        >
                          Manage Signups
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Slot Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Slot</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    required
                  />
                  {formErrors.time && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.time}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Volunteer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.volunteerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volunteerName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    required
                  />
                  {formErrors.volunteerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.volunteerName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                  />
                  {formErrors.capacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.capacity}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Add Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Slot Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Edit Slot</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    required
                  />
                  {formErrors.time && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.time}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Volunteer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.volunteerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volunteerName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                  {formErrors.volunteerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.volunteerName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  {formErrors.capacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.capacity}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Update Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="mb-4">
                Are you sure you want to delete this slot? This action cannot be
                undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={confirmDelete}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Signups Modal */}
        {showManageSignups && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                Manage Signups - {showManageSignups.title}
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Current Signups:</h4>
                {showManageSignups.signedUpUsers?.length > 0 ? (
                  <ul className="space-y-2">
                    {showManageSignups.signedUpUsers.map((user, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-sm"
                      >
                        <span>{user.userName}</span>
                        <button
                          onClick={() => handleRemoveUser(user.userId)}
                          className="bg-primary-500 text-white px-2 py-1 rounded-lg shadow-sm hover:bg-accent transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No users signed up yet.</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Add User:</h4>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm mb-2"
                >
                  <option value="">Select a user...</option>
                  {users
                    .filter(
                      (user) =>
                        !showManageSignups.signedUpUsers?.some(
                          (su) => su.userId === user.id
                        )
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAddUser}
                  disabled={!selectedUser}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors disabled:bg-gray-400"
                >
                  Add User
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowManageSignups(null)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotManager;
