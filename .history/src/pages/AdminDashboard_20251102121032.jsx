import React from "react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                The Knowledge Network - Admin
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
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    {userRole}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to the administrative panel.
              </p>
              <p className="text-sm text-gray-500">
                This is where admin-specific content and controls will be
                displayed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
