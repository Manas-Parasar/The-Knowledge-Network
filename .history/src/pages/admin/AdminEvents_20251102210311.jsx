import React, { useState, useEffect } from "react";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../../firebase/events";
import toast from "react-hot-toast";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.description) {
      setFormErrors({ general: "Title, date, and description are required" });
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
        toast.success("Event updated successfully");
      } else {
        await addEvent(formData);
        toast.success("Event added successfully");
      }
      fetchEvents();
      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        title: "",
        date: "",
        description: "",
        image: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error saving event:", err);
      setFormErrors({ general: err.message });
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.name || "",
      date: event.date || "",
      description: event.description || "",
      image: event.image || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        toast.success("Event deleted successfully");
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
        toast.error("Failed to delete event");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Manage Events</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
        >
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
            <p className="text-gray-600 mb-1">
              <strong>Date:</strong> {event.date}
            </p>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(event)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? "Edit Event" : "Add Event"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {formErrors.general && (
                <p className="text-red-500 text-sm mb-4">
                  {formErrors.general}
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                >
                  {editingEvent ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setFormData({
                      title: "",
                      date: "",
                      description: "",
                      image: "",
                    });
                    setFormErrors({});
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
