import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Sponsors from "./pages/Sponsors";
import Donations from "./pages/Donations";
import SchoolSelector from "./components/SchoolSelector";
import "./App.css";
import Navbar from "./components/Navbar";

function AppRoutes() {
  const { currentUser, userRole, selectedSchool, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate
              to={
                !selectedSchool
                  ? "/select-school"
                  : userRole === "capstoneAdmin"
                  ? "/admin-dashboard"
                  : "/dashboard"
              }
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={
              currentUser
                ? userRole === "capstoneAdmin"
                  ? "/admin-dashboard"
                  : "/dashboard"
                : "/login"
            }
          />
        }
      />
      <Route path="/resources" element={<Resources />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/events" element={<Events />} />
      <Route path="/sponsors" element={<Sponsors />} />
      <Route path="/donate" element={<Donations />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
