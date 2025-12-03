import React, { useState, useEffect } from "react";
import { getDonations } from "../firebase/donations";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await getDonations();
        setDonations(data);
      } catch (err) {
        setError(err.message);
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
      <h1 className="text-3xl font-bold text-accent mb-6">Donations</h1>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Donations;
