import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminDashboard = () => {
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const adminSections = [
    {
      title: "School Management",
      description: "Add, edit, and remove schools, tutoring slots, and events",
      path: "/admin/schools",
      icon: "🏫",
      color: "bg-blue-500",
    },
    {
      title: "Tutoring Slots",
      description: "Manage tutoring slots across all schools",
      path: "/admin/slots",
      icon: "🕓",
      color: "bg-green-500",
    },
    {
      title: "Events",
      description: "Create and manage community events",
      path: "/admin/events",
      icon: "📅",
      color: "bg-purple-500",
    },
    {
      title: "Donations & Sponsors",
      description: "Manage donation methods and sponsors",
      path: "/admin/donations",
      icon: "💰",
      color: "bg-yellow-500",
    },
    {
      title: "Clubs",
      description: "Manage student clubs and feature of the week",
      path: "/admin/clubs",
      icon: "🎉",
      color: "bg-pink-500",
    },
    {
      title: "User Management",
      description: "View and manage user accounts",
      path: "/admin/users",
      icon: "👥",
      color: "bg-indigo-500",
    },
    {
      title: "Year Management",
      description: "Archive current year and start new school year",
      path: "/admin/year-management",
      icon: "📚",
      color: "bg-red-500",
    },
    {
      title: "Website Content",
      description: "Edit homepage text and manage website tabs",
      path: "/admin/website-content",
      icon: "🌐",
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-accent">
                The Knowledge Network - Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-white">
                  Welcome, {currentUser?.displayName}
                </div>
                <div className="text-sm text-white/80">
                  {currentUser?.email}
                </div>
                <div className="text-sm text-white/80">
                  Role:{" "}
                  <span className="px-2 py-1 bg-accent text-primary text-xs font-medium rounded-full">
                    {userRole}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-accent hover:bg-yellow-400 text-primary px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Administrative Controls
            </h2>
            <p className="text-gray-600">
              Manage all aspects of The Knowledge Network website and content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminSections.map((section) => (
              <Link
                key={section.path}
                to={section.path}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`text-3xl mr-3 ${section.color} text-white rounded-lg p-2`}
                  >
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">{section.description}</p>
                <div className="mt-4 text-primary font-medium text-sm">
                  Manage →
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/schools"
                className="bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors text-center font-medium"
              >
                View Public Schools Page
              </Link>
              <Link
                to="/donations"
                className="bg-secondary text-white px-4 py-3 rounded-lg hover:bg-secondary-600 transition-colors text-center font-medium"
              >
                View Donations Page
              </Link>
              <Link
                to="/"
                className="bg-accent text-primary px-4 py-3 rounded-lg hover:bg-yellow-400 transition-colors text-center font-medium"
              >
                View Homepage
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Administrative Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset the website to its original state? This action cannot be undone."
                      )
                    ) {
                      // TODO: Implement reset functionality
                      alert("Reset functionality not yet implemented");
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-center font-medium"
                >
                  Reset Website to Original State
                </button>
                <Link
                  to="/admin/website-content"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Edit Website Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
