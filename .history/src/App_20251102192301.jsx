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
import Home from "./pages/Home";
import Schools from "./pages/Schools";
import Tutoring from "./pages/Tutoring";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastProvider from "./components/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 shadow-md"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      <Route path="/" element={<Home />} />
      <Route path="/schools" element={<Schools />} />
      <Route path="/tutoring" element={<Tutoring />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/events" element={<Events />} />
      <Route path="/sponsors" element={<Sponsors />} />
      <Route path="/donations" element={<Donations />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="App w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Navbar />
            <main className="w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
