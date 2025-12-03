import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.section
        className="bg-white/90 shadow-lg rounded-2xl py-20 w-full mx-6 md:mx-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="The Knowledge Network Logo"
              className="h-16 md:h-24 lg:h-32 w-auto"
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6">
            The Knowledge
            <span className="block text-accent">Network</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            "Empowering minds, building futures"
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/schools"
              className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Explore Schools
            </Link>
            <Link
              to="/events"
              className="bg-secondary hover:bg-secondary-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Join Events
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Section Divider */}
      <div className="w-full mx-6 md:mx-10 my-8">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </div>

      {/* Mission Section */}
      <motion.section
        className="py-16 bg-white/90 shadow-lg rounded-2xl w-full mx-6 md:mx-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Our <span className="text-accent">Mission</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To create a comprehensive educational ecosystem where students,
              teachers, and communities collaborate to foster academic
              excellence and personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-primary">
              <div className="text-4xl text-primary mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Student Success
              </h3>
              <p className="text-gray-600">
                Providing resources and support to help every student reach
                their full potential.
              </p>
            </div>

            <div className="text-center p-6 bg-white/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-secondary">
              <div className="text-4xl text-secondary mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Community Building
              </h3>
              <p className="text-gray-600">
                Connecting schools, families, and communities to create stronger
                educational networks.
              </p>
            </div>

            <div className="text-center p-6 bg-white/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-accent">
              <div className="text-4xl text-accent mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Innovation
              </h3>
              <p className="text-gray-600">
                Embracing new technologies and methods to enhance the learning
                experience.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section Divider */}
      <div className="w-full mx-6 md:mx-10 my-8">
        <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
      </div>

      {/* Quick Links Section */}
      <motion.section
        className="py-16 bg-white/90 shadow-lg rounded-2xl w-full mx-6 md:mx-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
            Get <span className="text-accent">Involved</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                to="/schools"
                className="block bg-gradient-to-br from-white/90 to-white/95 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-t-4 border-primary hover:border-primary-600 transform hover:scale-105"
              >
                <div className="text-4xl text-primary mb-3">🏫</div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Schools
                </h3>
                <p className="text-gray-600 text-sm">
                  Explore our partner schools and programs
                </p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Link
                to="/events"
                className="block bg-gradient-to-br from-white/90 to-white/95 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-t-4 border-secondary hover:border-secondary-600 transform hover:scale-105"
              >
                <div className="text-4xl text-secondary mb-3">📅</div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Events
                </h3>
                <p className="text-gray-600 text-sm">
                  Join workshops, seminars, and community gatherings
                </p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                to="/donations"
                className="block bg-gradient-to-br from-white/90 to-white/95 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-t-4 border-accent hover:border-yellow-500 transform hover:scale-105"
              >
                <div className="text-4xl text-accent mb-3">💝</div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Donate
                </h3>
                <p className="text-gray-600 text-sm">
                  Support our mission and help students succeed
                </p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Link
                to="/profile"
                className="block bg-gradient-to-br from-white/90 to-white/95 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-t-4 border-primary hover:border-primary-600 transform hover:scale-105"
              >
                <div className="text-4xl text-primary mb-3">👤</div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage your account and preferences
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section Divider */}
      <div className="w-full mx-6 md:mx-10 my-8">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
      </div>

      {/* Featured Club Section */}
      {featuredClub && (
        <motion.section
          className="py-16 bg-white/90 shadow-lg rounded-2xl w-full mx-6 md:mx-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
              Club of the <span className="text-accent">Week</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
                <div className="flex flex-col md:flex-row items-center">
                  {featuredClub.photo && (
                    <img
                      src={featuredClub.photo}
                      alt={featuredClub.name}
                      className="w-32 h-32 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                    />
                  )}
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      {featuredClub.name}
                    </h3>
                    <p className="text-white/90">{featuredClub.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default Home;
