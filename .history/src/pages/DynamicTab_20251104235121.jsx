import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getWebsiteContent } from "../firebase/websiteContent";
import MDEditor from "@uiw/react-md-editor";

const DynamicTab = () => {
  const { route } = useParams();
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTab = async () => {
      try {
        const content = await getWebsiteContent();
        const foundTab = content.tabs?.find((t) => t.route === `/${route}`);
        setTab(foundTab);
      } catch (err) {
        console.error("Error fetching tab:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTab();
  }, [route]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Tab not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent mb-8">{tab.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <MDEditor.Markdown source={tab.content} />
      </div>
    </div>
  );
};

export default DynamicTab;
