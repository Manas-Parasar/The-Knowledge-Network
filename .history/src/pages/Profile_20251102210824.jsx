import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSchools } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { cancelSlotSignup } from "../firebase/slots";
import toast from "react-hot-toast";

const Profile = () => {
  const { currentUser, userRole, selectedSchool, setSelectedSchool } =
    useAuth();
  const [userResources, setUserResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingName, setUpdatingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [updateError, setUpdateError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState(null);
  const [changingSchool, setChangingSchool] = useState(false);
  const [schoolChangeError, setSchoolChangeError] = useState(null);

  useEffect(() => {
    const fetchUserResources = async () => {
      console.log(
        "Profile: fetchUserResources called, currentUser:",
        currentUser ? currentUser.uid : null
      );
      if (!currentUser) return;

      try {
        setLoading(true);
        console.log("Profile: Fetching resources for user:", currentUser.uid);
        const resources = await getResourcesByUser(currentUser.uid);
        console.log("Profile: Resources fetched:", resources.length, "items");
        setUserResources(resources);
        setError(null);
      } catch (err) {
        console.error("Error fetching user resources:", err);
        setError("Failed to load your resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserResources();
  }, [currentUser]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setSchoolsLoading(true);
        const schoolsData = await getSchools();
        setSchools(schoolsData);
        setSchoolsError(null);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setSchoolsError("Failed to load schools. Please try again.");
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

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

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your account information and settings.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.displayName || "Not provided"}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {userRole}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Account created
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.metadata?.creationTime
                      ? new Date(
                          currentUser.metadata.creationTime
                        ).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Selected school
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {selectedSchool ? selectedSchool.name : "Not selected"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Change School Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Change School
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Select a different school for your account.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {schoolsLoading ? (
                <div className="text-center">
                  <div className="text-gray-500">Loading schools...</div>
                </div>
              ) : schoolsError ? (
                <div className="text-center">
                  <div className="text-red-600">{schoolsError}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="schoolSelect"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select School
                    </label>
                    <select
                      id="schoolSelect"
                      onChange={(e) => {
                        const selectedSchoolId = e.target.value;
                        const school = schools.find(
                          (s) => s.id === selectedSchoolId
                        );
                        if (school) handleSchoolChange(school);
                      }}
                      disabled={changingSchool}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">
                        {selectedSchool
                          ? `Currently: ${selectedSchool.name}`
                          : "Select a school"}
                      </option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {schoolChangeError && (
                    <div className="text-red-600 text-sm">
                      {schoolChangeError}
                    </div>
                  )}
                  {changingSchool && (
                    <div className="text-blue-600 text-sm">
                      Changing school...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Update Display Name Form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Update Display Name
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Change your display name that appears throughout the
                application.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your new display name"
                    disabled={updatingName}
                  />
                </div>
                {updateError && (
                  <div className="text-red-600 text-sm">{updateError}</div>
                )}
                <button
                  type="submit"
                  disabled={updatingName || !newDisplayName.trim()}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingName ? "Updating..." : "Update Display Name"}
                </button>
              </form>
            </div>
          </div>

          {/* User's Resources */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Resources
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Resources you've added to the knowledge network.
              </p>
            </div>
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <div className="text-gray-500">Loading your resources...</div>
                </div>
              ) : error ? (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <div className="text-red-600">{error}</div>
                </div>
              ) : userResources.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <div className="text-gray-500">
                    You haven't added any resources yet.
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {userResources.map((resource) => (
                    <li key={resource.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {resource.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            Created:{" "}
                            {resource.createdAt?.toDate
                              ? resource.createdAt.toDate().toLocaleDateString()
                              : "Unknown"}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              resource.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {resource.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
