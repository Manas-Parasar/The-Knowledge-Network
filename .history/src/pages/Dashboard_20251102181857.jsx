import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSchoolById } from "../firebase/schools";
import { getSlots } from "../firebase/slots";
import { getDonations } from "../firebase/donations";
import { getEvents } from "../firebase/events";

const Dashboard = () => {
  const { currentUser, userRole, logout, selectedSchool } = useAuth();
  const [schoolData, setSchoolData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!selectedSchool) {
        setSchoolData(null);
        setSlots([]);
        setDonations([]);
        setEvents([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const school = await getSchoolById(selectedSchool.id);
        setSchoolData(school);

        const schoolSlots = await getSlots(selectedSchool.id);
        setSlots(schoolSlots);

        const allDonations = await getDonations();
        const schoolDonations = allDonations.filter(
          (donation) => donation.schoolId === selectedSchool.id
        );
        setDonations(schoolDonations);

        const allEvents = await getEvents();
        const schoolEvents = allEvents.filter(
          (event) => event.schoolId === selectedSchool.id
        );
        setEvents(schoolEvents);
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError("Failed to load school data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [selectedSchool]);

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-accent">
                The Knowledge Network
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Name: {currentUser?.displayName}
                </div>
                <div className="text-sm text-gray-500">
                  Email: {currentUser?.email}
                </div>
                <div className="text-sm text-gray-500">
                  Role:{" "}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {userRole}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary-500 hover:bg-accent text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!selectedSchool ? (
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  No School Selected
                </h2>
                <p className="text-gray-600">
                  Please select a school to view personalized content.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading school data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="border-4 border-dashed border-red-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-red-900 mb-4">
                  Error Loading Data
                </h2>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* School Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {schoolData?.name || selectedSchool.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Address
                    </h3>
                    <p className="text-sm text-gray-900">
                      {schoolData?.address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Time Offered
                    </h3>
                    <p className="text-sm text-gray-900">
                      {schoolData?.timeOffered || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Grade Levels
                    </h3>
                    <p className="text-sm text-gray-900">
                      {schoolData?.gradeLevels || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Donation Info
                    </h3>
                    <p className="text-sm text-gray-900">
                      {schoolData?.donationInfo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Tutoring Slots */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Available Tutoring Slots
                </h3>
                {slots.length === 0 ? (
                  <p className="text-gray-600">
                    No tutoring slots available at this time.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot) => (
                      <div key={slot.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900">
                          {slot.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {slot.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {slot.date}
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {slot.time}
                        </p>
                        <p className="text-sm text-gray-500">
                          Capacity: {slot.signedUpUsers?.length || 0}/
                          {slot.capacity || 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Donation Opportunities */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Current Donation Opportunities
                </h3>
                {donations.length === 0 ? (
                  <p className="text-gray-600">
                    No donation opportunities available at this time.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900">
                          {donation.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {donation.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Goal: ${donation.goal}
                        </p>
                        <p className="text-sm text-gray-500">
                          Raised: ${donation.raised || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Events */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Events
                </h3>
                {events.length === 0 ? (
                  <p className="text-gray-600">No recent events available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {event.date}
                        </p>
                        <p className="text-sm text-gray-500">
                          Location: {event.location}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
