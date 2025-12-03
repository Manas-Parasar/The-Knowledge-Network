import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSchools } from "../firebase/schools";
import { getSlots, signUpForSlot } from "../firebase/slots";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const VolunteerSignup = () => {
  const { currentUser } = useAuth();
  const [schools, setSchools] = useState([]);
  const [schoolSlots, setSchoolSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", err);
        toast.error("Failed to load schools and slots");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignup = async (schoolId, slotId) => {
    if (!currentUser) {
      toast.error("Please log in to sign up for slots");
      return;
    }

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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading available slots...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/schools"
            className="text-primary hover:text-accent transition-colors mb-4 inline-block"
          >
            ← Back to Schools
          </Link>
          <h1 className="text-3xl font-bold text-accent">Volunteer Sign-Up</h1>
          <p className="text-gray-600 mt-2">
            Choose a school and time slot to volunteer for tutoring
          </p>
        </div>

        <div className="space-y-8">
          {schools.map((school) => (
            <div key={school.id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{school.name}</h2>
              <p className="text-gray-600 mb-4">{school.address}</p>

              {schoolSlots[school.id] && schoolSlots[school.id].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schoolSlots[school.id].map((slot) => {
                    const isSignedUp = slot.signedUpUsers?.some(
                      (user) => user.userId === currentUser?.uid
                    );
                    const isFull = slot.signedUpUsers?.length >= slot.capacity;
                    const isAvailable = !isFull && !isSignedUp;

                    return (
                      <div
                        key={slot.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-semibold mb-2">{slot.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Date:</strong> {slot.date}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Time:</strong> {slot.time}
                        </p>
                        {slot.volunteerName && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Volunteer:</strong> {slot.volunteerName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Volunteers Available:</strong>{" "}
                          {Math.max(
                            0,
                            (parseInt(slot.capacity) || 0) -
                              (slot.volunteerNames?.length || 0)
                          )}
                        </p>

                        {currentUser ? (
                          isSignedUp ? (
                            <span className="text-sm text-green-600 font-medium">
                              You are signed up for this slot
                            </span>
                          ) : isAvailable ? (
                            <button
                              onClick={() => handleSignup(school.id, slot.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition-colors w-full"
                            >
                              Sign Up for This Slot
                            </button>
                          ) : (
                            <span className="text-sm text-red-600 font-medium">
                              {isFull ? "Slot is full" : "Unavailable"}
                            </span>
                          )
                        ) : (
                          <Link
                            to="/login"
                            className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors w-full text-center block"
                          >
                            Log in to Sign Up
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">
                  No tutoring slots available for this school.
                </p>
              )}
            </div>
          ))}
        </div>

        {schools.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No schools available for volunteer sign-up at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerSignup;
