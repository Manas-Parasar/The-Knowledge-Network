import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSchools } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { useAuth } from "../hooks/useAuth";
import SlotManager from "../components/SlotManager";

const Schools = () => {
  const { currentUser } = useAuth();

  const [schools, setSchools] = useState([]);
  const [schoolSlots, setSchoolSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsData = await getSchools();
        setSchools(schoolsData);

        // Fetch slots for each school
        const slotsPromises = schoolsData.map(async (school) => {
          try {
            const slots = await getSlots(school.id);
            return { schoolId: school.id, slots };
          } catch (err) {
            console.error(`Error fetching slots for school ${school.id}:`, err);
            return { schoolId: school.id, slots: [] };
          }
        });

        const slotsResults = await Promise.all(slotsPromises);
        const slotsMap = {};
        slotsResults.forEach(({ schoolId, slots }) => {
          slotsMap[schoolId] = slots;
        });
        setSchoolSlots(slotsMap);
      } catch (err) {
        console.warn("Firebase permissions error:", err);
        setSchools([]);
        setSchoolSlots({});
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleSignUp = async (schoolId, slotId) => {
    if (!currentUser) {
      toast.error("Please log in to sign up for slots");
      return;
    }

    // Find the slot to get its details
    const slot = schoolSlots[schoolId]?.find((s) => s.id === slotId);
    if (!slot) {
      toast.error("Slot not found");
      return;
    }

    setSelectedSlotForSignup({ schoolId, slotId, slot });
    setSignupFormData({
      email: currentUser.email || "",
      studentName: "",
    });
    setShowSignupModal(true);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupFormData.studentName.trim()) {
      setFormErrors({ general: "Student's name is required" });
      return;
    }

    setProcessing(true);
    try {
      const userName = `${signupFormData.studentName}${
        signupFormData.email ? ` (${signupFormData.email})` : ""
      }`;
      await signUpForSlot(
        selectedSlotForSignup.schoolId,
        selectedSlotForSignup.slotId,
        userName
      );
      toast.success("Successfully signed up for the tutoring slot!");

      // Refresh slots data
      const slotsData = await getSlots(selectedSlotForSignup.schoolId);
      setSchoolSlots((prev) => ({
        ...prev,
        [selectedSlotForSignup.schoolId]: slotsData,
      }));

      setShowSignupModal(false);
      setSelectedSlotForSignup(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error signing up for slot:", err);
      setFormErrors({ general: err.message });
      toast.error("Failed to sign up for the slot. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSignup = async (schoolId, slotId) => {
    if (!currentUser) {
      toast.error("Please log in to cancel signup");
      return;
    }

    setProcessing(true);
    try {
      // Find the slot to get the user's signup entry
      const slot = schoolSlots[schoolId]?.find((s) => s.id === slotId);
      if (!slot) {
        toast.error("Slot not found");
        return;
      }

      const volunteerNames = slot.volunteerNames || [];
      // Find the user's signup entry that contains their email
      const userSignupEntry = volunteerNames.find((name) =>
        name.includes(currentUser.email || "")
      );

      if (!userSignupEntry) {
        toast.error("You are not signed up for this slot");
        return;
      }

      await cancelSlotSignup(schoolId, slotId, userSignupEntry);
      toast.success("Successfully canceled signup for the tutoring slot!");

      // Refresh slots data
      const slotsData = await getSlots(schoolId);
      setSchoolSlots((prev) => ({
        ...prev,
        [schoolId]: slotsData,
      }));
    } catch (err) {
      console.error("Error canceling signup:", err);
      toast.error("Failed to cancel signup. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewSlots = (school) => {
    setShowSlotManager(school);
  };

  const handleAddSlot = (school) => {
    setSelectedSchoolForSlot(school);
    setSlotFormData({
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      totalSlots: 1,
    });
    setShowAddSlotModal(true);
  };

  const handleEditSlot = (school, slot) => {
    setSelectedSchoolForSlot(school);
    setEditingSlot(slot);
    setSlotFormData({
      date: slot.date || "",
      startTime: slot.startTime || "",
      endTime: slot.endTime || "",
      description: slot.description || "",
      totalSlots: slot.capacity || 150,
    });
    setShowEditSlotModal(true);
  };

  const handleDeleteSlot = async (schoolId, slotId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this slot? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setProcessing(true);
    try {
      await deleteSlot(schoolId, slotId);
      toast.success("Slot deleted successfully");

      // Refresh slots data
      const slotsData = await getSlots(schoolId);
      setSchoolSlots((prev) => ({
        ...prev,
        [schoolId]: slotsData,
      }));
    } catch (err) {
      console.error("Error deleting slot:", err);
      toast.error("Failed to delete slot");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    if (!slotFormData.date || !slotFormData.totalSlots) {
      setFormErrors({
        general: "Date and number of volunteers are required",
      });
      return;
    }

    setProcessing(true);
    try {
      await updateSlot(selectedSchoolForSlot.id, editingSlot.id, slotFormData);
      toast.success("Slot updated successfully");

      // Refresh slots data
      const slotsData = await getSlots(selectedSchoolForSlot.id);
      setSchoolSlots((prev) => ({
        ...prev,
        [selectedSchoolForSlot.id]: slotsData,
      }));

      setShowEditSlotModal(false);
      setEditingSlot(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error updating slot:", err);
      setFormErrors({ general: err.message });
      toast.error("Failed to update slot. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSchool = () => {
    setEditingSchool(null);
    setSchoolFormData({
      name: "",
      address: "",
      timeOffered: "",
      gradeLevels: "",
      donationInfo: "",
    });
    setShowAddSchoolModal(true);
  };

  const handleEditSchool = (school) => {
    setEditingSchool(school);
    setSchoolFormData({
      name: school.name || "",
      address: school.address || "",
      timeOffered: school.timeOffered || "",
      gradeLevels: school.gradeLevels || "",
      donationInfo: school.donationInfo || "",
    });
    setShowEditSchoolModal(true);
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    if (!schoolFormData.name || !schoolFormData.address) {
      setFormErrors({ general: "Name and address are required" });
      return;
    }

    setProcessing(true);
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, schoolFormData);
        toast.success("School updated successfully");
      } else {
        await addSchool(schoolFormData);
        toast.success("School added successfully");
      }

      // Refresh schools data
      const schoolsData = await getSchools();
      setSchools(schoolsData);

      setShowAddSchoolModal(false);
      setShowEditSchoolModal(false);
      setEditingSchool(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error saving school:", err);
      setFormErrors({ general: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this school? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setProcessing(true);
    try {
      await deleteSchool(schoolId);
      toast.success("School deleted successfully");

      // Refresh schools data
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (err) {
      console.error("Error deleting school:", err);
      toast.error("Failed to delete school");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!slotFormData.date || !slotFormData.totalSlots) {
      setFormErrors({
        general: "Date and number of volunteers are required",
      });
      return;
    }

    setProcessing(true);
    try {
      await addSlot(selectedSchoolForSlot.id, slotFormData);
      toast.success("Slot added successfully");

      // Refresh slots data
      const slotsData = await getSlots(selectedSchoolForSlot.id);
      setSchoolSlots((prev) => ({
        ...prev,
        [selectedSchoolForSlot.id]: slotsData,
      }));

      setShowAddSlotModal(false);
      setSelectedSchoolForSlot(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error saving slot:", err);
      setFormErrors({ general: err.message });
      toast.error("Failed to add slot. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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

  const handleManageSlots = (school) => {
    setShowSlotManager(school);
  };

  const handleSignup = async (schoolId, slotId, userName) => {
    console.log(
      "DEBUG: Signing up for slot, schoolId:",
      schoolId,
      "slotId:",
      slotId,
      "userName:",
      userName
    );
    try {
      await signUpForSlot(schoolId, slotId, userName);
      console.log("DEBUG: Successfully signed up for slot in Firebase");
      // Update local state
      setSchoolSlots((prev) => ({
        ...prev,
        [schoolId]: prev[schoolId].map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                signedUpUsers: [
                  ...slot.signedUpUsers,
                  { userId: currentUser.uid, userName },
                ],
              }
            : slot
        ),
      }));
    } catch (error) {
      console.log("DEBUG: Error signing up for slot:", error);
      setError("Failed to sign up for slot. Please try again.");
      console.error("Error signing up for slot:", error);
    }
  };

  const handleCancelSignup = async (schoolId, slotId) => {
    console.log(
      "DEBUG: Canceling signup for slot, schoolId:",
      schoolId,
      "slotId:",
      slotId
    );
    try {
      await cancelSlotSignup(schoolId, slotId);
      console.log("DEBUG: Successfully canceled signup in Firebase");
      // Update local state
      setSchoolSlots((prev) => ({
        ...prev,
        [schoolId]: prev[schoolId].map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                signedUpUsers: slot.signedUpUsers.filter(
                  (user) => user.userId !== currentUser.uid
                ),
              }
            : slot
        ),
      }));
    } catch (error) {
      console.log("DEBUG: Error canceling signup:", error);
      setError("Failed to cancel signup. Please try again.");
      console.error("Error canceling signup:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Schools</h1>
        {canEdit && (
          <button
            onClick={handleAddSchool}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
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
            {schoolSlots[school.id] && schoolSlots[school.id].length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Available Slots</h3>
                <div className="space-y-2">
                  {schoolSlots[school.id].map((slot) => {
                    const isSignedUp = slot.signedUpUsers?.some(
                      (user) => user.userId === currentUser?.uid
                    );
                    const isFull = slot.signedUpUsers?.length >= slot.capacity;
                    const isAvailable = !isFull && !isSignedUp;

                    return (
                      <div
                        key={slot.id}
                        className="border border-gray-200 rounded-lg shadow-sm p-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{slot.title}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Date:</strong> {slot.date} |{" "}
                              <strong>Time:</strong> {slot.time}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Volunteer:</strong> {slot.volunteerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Availability:</strong>{" "}
                              {slot.signedUpUsers?.length || 0} / {slot.capacity}
                            </p>
                          </div>
                          {currentUser && (
                            <div className="ml-2">
                              {isSignedUp ? (
                                <button
                                  onClick={() =>
                                    handleCancelSignup(school.id, slot.id)
                                  }
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg shadow-sm text-sm hover:bg-red-600 transition-colors"
                                >
                                  Cancel Signup
                                </button>
                              ) : isAvailable ? (
                                <button
                                  onClick={() =>
                                    handleSignup(
                                      school.id,
                                      slot.id,
                                      currentUser.displayName ||
                                        currentUser.email
                                    )
                                  }
                                  className="bg-green-500 text-white px-3 py-1 rounded-lg shadow-sm text-sm hover:bg-green-600 transition-colors"
                                >
                                  Sign Up
                                </button>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {isFull ? "Full" : "Unavailable"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleManageSlots(school)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Manage Slots
              </button>
              <button className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-accent transition-colors">
                View Details
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => handleEditSchool(school)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit School */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingSchool ? "Edit School" : "Add School"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg shadow-sm"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg shadow-sm"
                  required
                />
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Time Offered *
                </label>
                <input
                  type="text"
                  value={formData.timeOffered}
                  onChange={(e) =>
                    setFormData({ ...formData, timeOffered: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg shadow-sm"
                  required
                />
                {formErrors.timeOffered && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.timeOffered}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Grade Levels *
                </label>
                <input
                  type="text"
                  value={formData.gradeLevels}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeLevels: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                {formErrors.gradeLevels && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.gradeLevels}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Donation Info *
                </label>
                <textarea
                  value={formData.donationInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, donationInfo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  required
                />
                {formErrors.donationInfo && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.donationInfo}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  {editingSchool ? "Update" : "Add"} School
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this school? This action cannot be
              undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={confirmDelete}
                className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-accent transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Manager Modal */}
      {showSlotManager && (
        <SlotManager
          schoolId={showSlotManager.id}
          schoolName={showSlotManager.name}
          onClose={() => setShowSlotManager(null)}
        />
      )}
    </div>
  );
};

export default Schools;
                  onChange={(e) =>
                    setSchoolFormData({
                      ...schoolFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={schoolFormData.address}
                  onChange={(e) =>
                    setSchoolFormData({
                      ...schoolFormData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Offered
                </label>
                <input
                  type="text"
                  value={schoolFormData.timeOffered}
                  onChange={(e) =>
                    setSchoolFormData({
                      ...schoolFormData,
                      timeOffered: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Levels
                </label>
                <input
                  type="text"
                  value={schoolFormData.gradeLevels}
                  onChange={(e) =>
                    setSchoolFormData({
                      ...schoolFormData,
                      gradeLevels: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Info
                </label>
                <input
                  type="text"
                  value={schoolFormData.donationInfo}
                  onChange={(e) =>
                    setSchoolFormData({
                      ...schoolFormData,
                      donationInfo: e.target.value,
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
                    : editingSchool
                    ? "Update"
                    : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSchoolModal(false);
                    setShowEditSchoolModal(false);
                    setEditingSchool(null);
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

export default Schools;
