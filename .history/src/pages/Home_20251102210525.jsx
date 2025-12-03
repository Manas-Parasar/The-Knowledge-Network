import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/The Knowledge Network.png";
import { getClubs } from "../firebase/clubs";

const Home = () => {
  const [featuredClub, setFeaturedClub] = useState(null);

  useEffect(() => {
    const fetchFeaturedClub = async () => {
      try {
        const clubs = await getClubs();
        const featured = clubs.find((club) => club.featured);
        setFeaturedClub(featured);
      } catch (err) {
        console.error("Error fetching featured club:", err);
      }
    };

    fetchFeaturedClub();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-600 to-secondary py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="The Knowledge Network Logo"
              className="h-16 md:h-24 lg:h-32 w-auto"
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            The Knowledge
            <span className="block text-accent">Network</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            "Empowering minds, building futures"
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/schools"
              className="bg-accent hover:bg-yellow-400 text-primary font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Explore Schools
            </Link>
            <Link
              to="/events"
              className="bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Join Events
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-accent">Mission</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To create a comprehensive educational ecosystem where students,
              teachers, and communities collaborate to foster academic
              excellence and personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-secondary-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-primary mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Student Success
              </h3>
              <p className="text-gray-600">
                Providing resources and support to help every student reach
                their full potential.
              </p>
            </div>

            <div className="text-center p-6 bg-secondary-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-secondary mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Building
              </h3>
              <p className="text-gray-600">
                Connecting schools, families, and communities to create stronger
                educational networks.
              </p>
            </div>

            <div className="text-center p-6 bg-secondary-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-accent mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Innovation
              </h3>
              <p className="text-gray-600">
                Embracing new technologies and methods to enhance the learning
                experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Get <span className="text-accent">Involved</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Link
                to="/schools"
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-3xl text-primary mb-3">🏫</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schools
                </h3>
                <p className="text-gray-600 text-sm">
                  Explore our partner schools and programs
                </p>
              </Link>
            </div>

            <div>
              <Link
                to="/events"
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-3xl text-secondary mb-3">📅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Events
                </h3>
                <p className="text-gray-600 text-sm">
                  Join workshops, seminars, and community gatherings
                </p>
              </Link>
            </div>

            <div>
              <Link
                to="/donations"
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-3xl text-accent mb-3">💝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Donate
                </h3>
                <p className="text-gray-600 text-sm">
                  Support our mission and help students succeed
                </p>
              </Link>
            </div>

            <div>
              <Link
                to="/profile"
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-3xl text-primary mb-3">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage your account and preferences
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
