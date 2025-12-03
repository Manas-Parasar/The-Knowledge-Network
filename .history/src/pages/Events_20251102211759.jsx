import React from "react";
import { useAuth } from "../hooks/useAuth";

const Events = () => {
  const { currentUser } = useAuth();
  const canEdit = currentUser?.email === "theknowledgenetwork2025@gmail.com";

  // Temporary mock data for testing UI without Firebase permissions
  const events = [
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

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-accent">Events</h1>
          {canEdit && (
            <button className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors">
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
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors">
                      Edit
                    </button>
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent transition-colors">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
