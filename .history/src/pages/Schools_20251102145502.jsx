import React, { useState, useEffect } from "react";
import { getSchools } from "../firebase/schools";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Schools</h1>
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
