import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSchools } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { useAuth } from "../hooks/useAuth";

const SchoolDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [school, setSchool] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const schoolsData = await getSchools();
        const foundSchool = schoolsData.find((s) => s.id === id);
        setSchool(foundSchool);

        if (foundSchool) {
          const slotsData = await getSlots(id);
          setSlots(slotsData);
        }
      } catch (err) {
        console.error("Error fetching school data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading school details...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">School not found</div>
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
        <h1 className="text-3xl font-bold text-accent">{school.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">School Information</h2>
          <div className="space-y-3">
            <p>
              <strong>Address:</strong> {school.address}
            </p>
            {school.tutoringHours && (
              <p>
                <strong>Tutoring Hours:</strong> {school.tutoringHours}
              </p>
            )}
            {school.gradeLevels && (
              <p>
                <strong>Grade Levels:</strong> {school.gradeLevels}
              </p>
            )}
            {school.donationDetails && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  Donation Information
                </h3>
                <p>{school.donationDetails}</p>
                <Link
                  to="/donations"
                  className="inline-block mt-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Make a Donation
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Available Tutoring Slots
          </h2>
          {slots.length > 0 ? (
            <div className="space-y-4">
              {slots.map((slot) => {
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{slot.title}</h3>
                        <p className="text-sm text-gray-600">
                          <strong>Date:</strong> {slot.date} |{" "}
                          <strong>Time:</strong> {slot.time}
                        </p>
                        {slot.volunteerName && (
                          <p className="text-sm text-gray-600">
                            <strong>Volunteer:</strong> {slot.volunteerName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Availability:</strong>{" "}
                          {slot.signedUpUsers?.length || 0} / {slot.capacity}
                        </p>
                      </div>
                      {currentUser && (
                        <div className="ml-4">
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
          ) : (
            <p className="text-gray-600">
              No tutoring slots available at this time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
