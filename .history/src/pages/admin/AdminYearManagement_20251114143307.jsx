import React, { useState, useEffect } from "react";
import {
  archiveAndResetYear,
  getArchivedYears,
  getArchivedYear,
} from "../../firebase/yearManagement";
import { updateAllSlotsCapacity } from "../../firebase/slots";
import toast from "react-hot-toast";

const AdminYearManagement = () => {
  const [archivedYears, setArchivedYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [archivedData, setArchivedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [migratingCapacity, setMigratingCapacity] = useState(false);

  useEffect(() => {
    fetchArchivedYears();
  }, []);

  const fetchArchivedYears = async () => {
    try {
      const years = await getArchivedYears();
      setArchivedYears(years);
    } catch (err) {
      console.error("Error fetching archived years:", err);
      toast.error("Failed to load archived years");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveAndReset = async () => {
    if (!newYear.trim()) {
      toast.error("Please enter a new school year");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to archive the current year and start ${newYear}? This will clear all current data.`
      )
    ) {
      return;
    }

    try {
      await archiveAndResetYear(newYear);
      toast.success(
        `Successfully archived current year and started ${newYear}`
      );
      setShowModal(false);
      setNewYear("");
      fetchArchivedYears();
    } catch (err) {
      console.error("Error archiving and resetting year:", err);
      toast.error("Failed to archive and reset year");
    }
  };

  const handleViewArchivedYear = async (year) => {
    try {
      const data = await getArchivedYear(year);
      setSelectedYear(year);
      setArchivedData(data);
    } catch (err) {
      console.error("Error fetching archived data:", err);
      toast.error("Failed to load archived data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading year management...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Year Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
        >
          New School Year
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Archived Years List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Archived Years</h2>
          {archivedYears.length === 0 ? (
            <p className="text-gray-600">No archived years found.</p>
          ) : (
            <div className="space-y-2">
              {archivedYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleViewArchivedYear(year)}
                  className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                    selectedYear === year
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  School Year {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Archived Data View */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedYear ? `Archived Data - ${selectedYear}` : "Select a Year"}
          </h2>
          {archivedData ? (
            <div className="space-y-4">
              {Object.entries(archivedData).map(([collection, items]) => (
                <div key={collection}>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {collection} ({items.length})
                  </h3>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-sm text-gray-500">No data</p>
                    ) : (
                      <ul className="text-sm text-gray-600 space-y-1">
                        {items.slice(0, 5).map((item, index) => (
                          <li key={index} className="truncate">
                            •{" "}
                            {item.name ||
                              item.title ||
                              item.method ||
                              `Item ${index + 1}`}
                          </li>
                        ))}
                        {items.length > 5 && (
                          <li className="text-gray-400">
                            ... and {items.length - 5} more
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              Select an archived year to view its data.
            </p>
          )}
        </div>
      </div>

      {/* New Year Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Start New School Year</h2>
            <p className="text-gray-600 mb-4">
              This will archive all current data and reset the system for a new
              year. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New School Year (e.g., 2025)
              </label>
              <input
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="2025"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleArchiveAndReset}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
              >
                Archive & Reset
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewYear("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminYearManagement;
