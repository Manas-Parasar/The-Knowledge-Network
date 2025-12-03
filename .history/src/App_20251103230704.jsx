import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import AdminSchools from "./pages/admin/AdminSchools";
import AdminSlots from "./pages/admin/AdminSlots";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminClubs from "./pages/admin/AdminClubs";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminYearManagement from "./pages/admin/AdminYearManagement";
import AdminWebsiteContent from "./pages/admin/AdminWebsiteContent";
import VolunteerSignup from "./pages/VolunteerSignup";
import SchoolDetail from "./pages/SchoolDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastProvider from "./components/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
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
        <Route
          path="/admin/schools"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSchools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/slots"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sponsors"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSponsors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clubs"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/year-management"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminYearManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/website-content"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminWebsiteContent />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/tutoring" element={<Tutoring />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<Events />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/signup" element={<VolunteerSignup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App w-full min-h-screen text-gray-900 flex flex-col">
              <Navbar />
              <main className="w-full flex-1 text-gray-900 px-6 md:px-10">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
