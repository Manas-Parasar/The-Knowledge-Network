import React, { useEffect } from "react";
import { getEvents } from "../firebase/events";
import { useAuth } from "../hooks/useAuth";

const Events = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";

  // Temporary mock data for testing UI without Firebase permissions
  const mockEvents = [
    {
      id: "1",
      name: "Community Tutoring Workshop",
      date: "2025-01-15",
      description:
        "Join us for a hands-on tutoring workshop to learn effective teaching strategies.",
      image: "",
    },
    {
      id: "2",
      name: "Back to School Drive",
      date: "2025-08-20",
      description:
        "Help us prepare for the new school year by donating school supplies.",
      image: "",
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Try to fetch from Firebase first
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (err) {
        console.warn("Firebase permissions error, using mock data:", err);
        // Fallback to mock data if Firebase permissions fail
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Events</h1>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
          >
            Add Event
          </button>
        )}
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
              <button className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors">
                View Details
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setFormData({
                        name: event.name,
                        date: event.date,
                        description: event.description,
                        image: event.image || "",
                      });
                      setShowModal(true);
                    }}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(event.id)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
