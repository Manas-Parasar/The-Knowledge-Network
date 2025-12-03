import React, { useState } from "react";
import { addSponsor } from "../firebase/sponsors";

const AddSponsorForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSponsor({ name, link });
      onAdd();
    } catch (error) {
      console.error("Error adding sponsor:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          type="text"
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Add Sponsor
      </button>
    </form>
  );
};

export default AddSponsorForm;
