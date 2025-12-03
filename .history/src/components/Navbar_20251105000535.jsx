import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getWebsiteContent } from "../firebase/websiteContent";
import toast from "react-hot-toast";
import logo from "../assets/The Knowledge Network.png";

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [dynamicTabs, setDynamicTabs] = useState([]);

  useEffect(() => {
    const fetchDynamicTabs = async () => {
      try {
        const content = await getWebsiteContent();
        setDynamicTabs(content.tabs || []);
      } catch (err) {
        console.error("Error fetching dynamic tabs:", err);
      }
    };

    fetchDynamicTabs();

    // Listen for tab updates
    const handleTabsUpdated = () => {
      fetchDynamicTabs();
    };

    window.addEventListener("tabsUpdated", handleTabsUpdated);

    return () => {
      window.removeEventListener("tabsUpdated", handleTabsUpdated);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Schools", path: "/schools" },
    {
      name: "Community",
      sublinks: [
        { name: "Events", path: "/events" },
        { name: "Sponsors", path: "/sponsors" },
        { name: "Donate", path: "/donations" },
      ],
    },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Admin", path: "/admin-dashboard", adminOnly: true },
    { name: "Profile", path: "/profile" },
  ];

  const adminLinks = [
    { name: "Schools", path: "/admin/schools" },
    { name: "Slots", path: "/admin/slots" },
    { name: "Events", path: "/admin/events" },
    { name: "Sponsors", path: "/admin/sponsors" },
    { name: "Donations", path: "/admin/donations" },
    { name: "Clubs", path: "/admin/clubs" },
    { name: "Users", path: "/admin/users" },
    { name: "Year Management", path: "/admin/year-management" },
    { name: "Website Content", path: "/admin/website-content" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Successfully logged out!");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md text-gray-900 shadow-lg rounded-2xl sticky top-0 z-50 left-0 right-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition-opacity duration-200"
            >
              <img
                src={logo}
                alt="The Knowledge Network Logo"
                className="h-6 md:h-8 lg:h-10 w-auto mr-2"
              />
              <h1 className="text-lg md:text-xl font-bold text-accent">
                The Knowledge Network
              </h1>
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {dynamicTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.route}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm ${
                  location.pathname === tab.route
                    ? "bg-primary-700 text-white"
                    : "hover:bg-yellow-500 hover:text-gray-900"
                }`}
              >
                {tab.title}
              </Link>
            ))}
            {navLinks.map((link) => {
              if (
                link.adminOnly &&
                currentUser?.email !== "theknowledgenetwork2025@gmail.com"
              ) {
                return null;
              }
              if (link.sublinks) {
                return (
                  <div key={link.name} className="relative">
                    <button
                      onClick={() => setCommunityOpen(!communityOpen)}
                      className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 hover:text-gray-900 transition-colors duration-200 shadow-sm"
                    >
                      {link.name}
                    </button>
                    {communityOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        {link.sublinks.map((sublink) => (
                          <Link
                            key={sublink.path}
                            to={sublink.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setCommunityOpen(false)}
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm ${
                      location.pathname === link.path
                        ? "bg-primary-700 text-blue-600"
                        : "hover:bg-yellow-500 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 hover:text-gray-900 transition-colors duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden bg-white/90 shadow-lg rounded-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {dynamicTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.route}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm ${
                  location.pathname === tab.route
                    ? "bg-primary-700 text-white"
                    : "hover:bg-yellow-500 hover:text-gray-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {tab.title}
              </Link>
            ))}
            {navLinks.map((link) => {
              if (
                link.adminOnly &&
                currentUser?.email !== "theknowledgenetwork2025@gmail.com"
              ) {
                return null;
              }
              if (link.sublinks) {
                return (
                  <div key={link.name}>
                    <div className="px-3 py-2 text-base font-medium">
                      {link.name}
                    </div>
                    {link.sublinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        className={`block px-6 py-2 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm ${
                          location.pathname === sublink.path
                            ? "bg-primary-700 text-white"
                            : "hover:bg-yellow-500 hover:text-gray-900"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm ${
                      location.pathname === link.path
                        ? "bg-primary-700 text-white"
                        : "hover:bg-yellow-500 hover:text-gray-900"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}
            <Link
              to="/dashboard"
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium hover:bg-yellow-500 hover:text-gray-900 transition-colors duration-200 shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            {currentUser?.email === "theknowledgenetwork2025@gmail.com" && (
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Admin Panel
                </div>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-yellow-500 hover:text-gray-900 transition-colors duration-200 shadow-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium hover:bg-yellow-500 hover:text-gray-900 transition-colors duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
