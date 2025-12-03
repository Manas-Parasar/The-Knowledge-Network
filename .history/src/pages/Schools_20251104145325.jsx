import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSchools,
  addSchool,
  updateSchool,
  deleteSchool,
} from "../firebase/schools";
import { getSlots, signUpForSlot, cancelSlotSignup } from "../firebase/slots";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import SlotManager from "../components/SlotManager";

const Schools = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";

  const [schools, setSchools] = useState([]);
  const [schoolSlots, setSchoolSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSlotManager, setShowSlotManager] = useState(null);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolFormData, setSchoolFormData] = useState({
    name: "",
    address: "",
    timeOffered: "",
    gradeLevels: "",
    donationInfo: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [processing, setProcessing] = useState(false);

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

    setProcessing(true);
    try {
      const userName = currentUser.displayName || currentUser.email;
      await signUpForSlot(schoolId, slotId, userName);
      toast.success("Successfully signed up for the tutoring slot!");

      // Refresh slots data
      const slotsData = await getSlots(schoolId);
      setSchoolSlots((prev) => ({
        ...prev,
        [schoolId]: slotsData,
      }));
    } catch (err) {
      console.error("Error signing up for slot:", err);
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
      const userName = currentUser.displayName || currentUser.email;
      await cancelSlotSignup(schoolId, slotId, userName);
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
    if (!window.confirm("Are you sure you want to delete this school?")) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading schools...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 mt-8">
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
                  <h3 className="text-lg font-semibold mb-2">
                    Available Slots
                  </h3>
                  <div className="space-y-2">
                    {schoolSlots[school.id].map((slot) => {
                      const isSignedUp = slot.signedUpUsers?.some(
                        (user) => user.userId === currentUser?.uid
                      );
                      const isFull =
                        slot.signedUpUsers?.length >= slot.capacity;
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
                                  <span className="text-sm text-green-600 font-medium">
                                    Signed Up
                                  </span>
                                ) : isAvailable ? (
                                  <Link
                                    to="/signup"
                                    className="bg-green-500 text-white px-3 py-1 rounded-lg shadow-sm text-sm hover:bg-green-600 transition-colors"
                                  >
                                    Sign Up
                                  </Link>
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
                <Link
                  to={`/schools/${school.id}`}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schools;
