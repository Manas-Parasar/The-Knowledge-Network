import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSchools } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { cancelSlotSignup } from "../firebase/slots";
import toast from "react-hot-toast";

const Profile = () => {
  const { currentUser } = useAuth();
  const [signedUpSlots, setSignedUpSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignedUpSlots = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        // Get all schools and their slots to find user's signups
        const schoolsData = await getSchools();
        const allSlots = [];

        for (const school of schoolsData) {
          const slots = await getSlots(school.id);
          slots.forEach((slot) => {
            if (
              slot.signedUpUsers?.some(
                (user) => user.userId === currentUser.uid
              )
            ) {
              allSlots.push({
                ...slot,
                schoolName: school.name,
                schoolId: school.id,
              });
            }
          });
        }

        setSignedUpSlots(allSlots);
      } catch (err) {
        console.error("Error fetching signed up slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUpSlots();
  }, [currentUser]);

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    console.log(
      "Profile: handleUpdateDisplayName called with:",
      newDisplayName
    );
    if (!newDisplayName.trim()) {
      console.log("Profile: Display name is empty, setting error");
      setUpdateError("Display name cannot be empty");
      return;
    }

    try {
      setUpdatingName(true);
      setUpdateError(null);
      console.log(
        "Profile: Starting update process for user:",
        currentUser.uid
      );

      // Update Firebase Auth
      console.log("Profile: Updating Firebase Auth displayName");
      await updateProfile(auth.currentUser, {
        displayName: newDisplayName.trim(),
      });
      console.log("Profile: Firebase Auth updated successfully");

      // Update Firestore user document
      console.log("Profile: Updating Firestore user document");
      await updateUserProfile(currentUser.uid, {
        name: newDisplayName.trim(),
      });
      console.log("Profile: Firestore updated successfully");

      setNewDisplayName("");
      console.log("Profile: Update completed, reloading page");
      // Force re-render by updating state or trigger auth context refresh
      window.location.reload(); // Simple way to refresh the page
    } catch (err) {
      console.error("Error updating display name:", err);
      setUpdateError("Failed to update display name. Please try again.");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleSchoolChange = async (school) => {
    if (!currentUser) {
      setSchoolChangeError("You must be logged in to change your school.");
      return;
    }

    try {
      setChangingSchool(true);
      setSchoolChangeError(null);

      // Update user profile with selected school
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        schoolId: school.id,
        schoolName: school.name,
        updatedAt: new Date(),
      });

      // Update context
      setSelectedSchool(school);

      // Force re-render to show updated school
      window.location.reload();
    } catch (err) {
      console.error("Error changing school:", err);
      setSchoolChangeError("Failed to change school. Please try again.");
    } finally {
      setChangingSchool(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleCancelSignup = async (schoolId, slotId) => {
    try {
      await cancelSlotSignup(schoolId, slotId);
      toast.success("Successfully canceled signup");
      // Refresh the signed up slots
      const schoolsData = await getSchools();
      const allSlots = [];

      for (const school of schoolsData) {
        const slots = await getSlots(school.id);
        slots.forEach((slot) => {
          if (
            slot.signedUpUsers?.some((user) => user.userId === currentUser.uid)
          ) {
            allSlots.push({
              ...slot,
              schoolName: school.name,
              schoolId: school.id,
            });
          }
        });
      }

      setSignedUpSlots(allSlots);
    } catch (err) {
      console.error("Error canceling signup:", err);
      toast.error("Failed to cancel signup");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">Profile</h1>
        <p className="text-gray-600 mt-2">
          View your account information and signed up tutoring slots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <p className="text-gray-900">
                {currentUser.displayName || "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-gray-900">
                {currentUser.metadata?.creationTime
                  ? new Date(
                      currentUser.metadata.creationTime
                    ).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Signed Up Slots */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Signed Up Slots</h2>
          {loading ? (
            <p className="text-gray-600">Loading your slots...</p>
          ) : signedUpSlots.length === 0 ? (
            <p className="text-gray-600">
              You haven't signed up for any tutoring slots yet.
            </p>
          ) : (
            <div className="space-y-4">
              {signedUpSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="font-semibold mb-2">{slot.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>School:</strong> {slot.schoolName}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Date:</strong> {slot.date}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Time:</strong> {slot.time}
                  </p>
                  <button
                    onClick={() => handleCancelSignup(slot.schoolId, slot.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                  >
                    Cancel Signup
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
