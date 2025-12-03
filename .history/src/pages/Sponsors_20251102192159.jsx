import React, { useState, useEffect } from "react";
import {
  getSponsors,
  addSponsor,
  updateSponsor,
  deleteSponsor,
} from "../firebase/sponsors";
import { useAuth } from "../hooks/useAuth";

const Sponsors = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    link: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const sponsorsData = await getSponsors();
        setSponsors(sponsorsData);
      } catch (err) {
        setError("Failed to load sponsors. Please try again later.");
        console.error("Error fetching sponsors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading sponsors...</div>
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
      <h1 className="text-3xl font-bold text-accent mb-8">Sponsors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {sponsor.logo && (
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{sponsor.name}</h2>
            {sponsor.link && (
              <a
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Visit Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sponsors;
