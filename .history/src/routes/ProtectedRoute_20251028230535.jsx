import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/firebaseConfig"; // Assuming you have an auth hook

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
