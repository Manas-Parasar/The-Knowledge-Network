import React, { useState, useEffect } from "react";
import {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
} from "../firebase/donations";
import { useAuth } from "../hooks/useAuth";

const Donations = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";

  // Temporary mock data for testing UI without Firebase permissions
  const mockDonations = [
    {
      id: "1",
      name: "School Supplies Drive",
      description:
        "Help us provide essential school supplies to students in need.",
      link: "https://example.com/donate",
    },
    {
      id: "2",
      name: "Technology Fund",
      description:
        "Support our technology initiatives to enhance learning opportunities.",
      link: "https://example.com/donate",
    },
  ];

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    link: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Try to fetch from Firebase first
        const data = await getDonations();
        setDonations(data);
      } catch (err) {
        console.warn("Firebase permissions error, using mock data:", err);
        // Fallback to mock data if Firebase permissions fail
        setDonations(mockDonations);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-accent">Donations</h1>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
          >
            Add Donation
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donations.map((donation) => (
          <div key={donation.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">
              {donation.name || "Donation Method"}
            </h2>
            <p className="text-gray-600">
              {donation.description || "Description not available"}
            </p>
            {donation.link && (
              <a
                href={donation.link}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Donate Now
              </a>
            )}
            {canEdit && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingDonation(donation);
                    setFormData({
                      name: donation.name || "",
                      description: donation.description || "",
                      link: donation.link || "",
                    });
                    setShowModal(true);
                  }}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(donation.id)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Donations;
