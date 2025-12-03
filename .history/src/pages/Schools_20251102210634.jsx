import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSchools } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { useAuth } from "../hooks/useAuth";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading schools...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">Schools</h1>
        <p className="text-gray-600 mt-2">
          Explore our partner schools and find tutoring opportunities
        </p>
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
                              {slot.signedUpUsers?.length || 0} /{" "}
                              {slot.capacity}
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
