import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getSchools } from "../firebase/schools";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SchoolSelector = ({ onSchoolSelected }) => {
  const {
    currentUser,
    setSelectedSchool: setGlobalSelectedSchool,
    userRole,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const schoolsData = await getSchools();
        setSchools(schoolsData);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Failed to load schools. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleSchoolSelect = async (school) => {
    if (!currentUser) {
      setError("You must be logged in to select a school.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update user profile with selected school
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        schoolId: school.id,
        schoolName: school.name,
        updatedAt: new Date(),
      });

      setSelectedSchool(school);
      setGlobalSelectedSchool(school);

      // Call callback if provided
      if (onSchoolSelected) {
        onSchoolSelected(school);
      }

      // Navigate to appropriate dashboard
      const dashboardPath =
        userRole === "capstoneAdmin" ? "/admin-dashboard" : "/dashboard";
      navigate(dashboardPath);
    } catch (err) {
      console.error("Error saving school selection:", err);
      setError("Failed to save school selection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Select Your School
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose the school you attend to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {selectedSchool ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                School Selected!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You have selected: <strong>{selectedSchool.name}</strong>
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-sm text-primary-500 hover:text-accent"
                >
                  Change selection
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    disabled={saving}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {school.name}
                        </p>
                        {school.location && (
                          <p className="text-sm text-gray-500">
                            {school.location}
                          </p>
                        )}
                      </div>
                      {saving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {schools.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No schools available at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolSelector;
