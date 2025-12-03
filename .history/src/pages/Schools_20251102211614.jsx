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
    <div className="w-full">
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
