import React, { useState, useEffect } from "react";
import { getEvents } from "../firebase/events";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error("Error fetching events:", err);
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
      <h1 className="text-3xl font-bold text-accent mb-8">Events</h1>
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
            <button className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-accent transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
