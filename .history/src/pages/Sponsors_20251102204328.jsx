import React, { useState, useEffect } from "react";
import { getSponsors } from "../firebase/sponsors";
import { useAuth } from "../hooks/useAuth";

const Sponsors = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";

  // Temporary mock data for testing UI without Firebase permissions
  const mockSponsors = [
    {
      id: "1",
      name: "Local Education Foundation",
      logo: "",
      link: "https://example.com",
    },
    {
      id: "2",
      name: "Community Support Corp",
      logo: "",
      link: "https://example.com",
    },
  ];

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
        // Try to fetch from Firebase first
        const sponsorsData = await getSponsors();
        setSponsors(sponsorsData);
      } catch (err) {
        console.warn("Firebase permissions error, using mock data:", err);
        // Fallback to mock data if Firebase permissions fail
        setSponsors(mockSponsors);
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

  if (error && !sponsors.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Sponsors</h1>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
          >
            Add Sponsor
          </button>
        )}
      </div>
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
            {canEdit && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingSponsor(sponsor);
                    setFormData({
                      name: sponsor.name,
                      logo: sponsor.logo || "",
                      link: sponsor.link || "",
                    });
                    setShowModal(true);
                  }}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(sponsor.id)}
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

export default Sponsors;
