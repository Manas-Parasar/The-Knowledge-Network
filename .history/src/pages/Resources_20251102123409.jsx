import React, { useState, useEffect } from "react";
import { getResources } from "../firebase/resources";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white shadow-md rounded-lg p-4 border"
          >
            <h2 className="text-xl font-semibold mb-2">{resource.title}</h2>
            <p className="text-gray-700 mb-2">{resource.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Category: {resource.category}
            </p>
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              View Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
