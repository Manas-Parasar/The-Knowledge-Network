import React, { useState, useEffect } from "react";
import { getDonations } from "../firebase/donations";
import { getSponsors } from "../firebase/sponsors";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsData, sponsorsData] = await Promise.all([
          getDonations(),
          getSponsors(),
        ]);
        setDonations(donationsData);
        setSponsors(sponsorsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading donations...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Ways to Donate Section */}
      <section className="py-16 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              Ways to Donate
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Support The Knowledge Network and help us empower minds and build
              futures. Your contributions make a real difference in our
              community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="bg-secondary-50 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2 text-primary">
                  {donation.method}
                </h2>
                <p className="text-gray-600 mb-4">{donation.details}</p>
                {donation.link && (
                  <a
                    href={donation.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent text-primary font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors inline-block shadow-md"
                  >
                    Donate Now
                  </a>
                )}
              </div>
            ))}
          </div>

          {donations.length === 0 && (
            <div className="text-center text-gray-500">
              <p>No donation methods available at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-secondary-50 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Our Sponsors
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We are grateful for the support of our sponsors who help make our
              mission possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
              >
                {sponsor.logo && (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-32 object-contain rounded-lg mb-4 mx-auto"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2 text-accent">
                  {sponsor.name}
                </h3>
                {sponsor.url && (
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent transition-colors underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>

          {sponsors.length === 0 && (
            <div className="text-center text-gray-500">
              <p>No sponsors listed at this time.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Donations;
