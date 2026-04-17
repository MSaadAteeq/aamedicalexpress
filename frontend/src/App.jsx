import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/components/providers/AppProviders";
import HomePage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AdminTripHistoryPage from "@/app/admin/trip-history/page";
import EditProfilePage from "@/app/edit-profile/page";
import EmergencyRidePage from "@/app/emergency-ride/page";
import LoginPage from "@/app/login/page";
import RequestRidePage from "@/app/request-ride/page";
import SignupPage from "@/app/signup/page";
import TripHistoryPage from "@/app/trip-history/page";

export default function App() {
  return (
    <AppProviders>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/trip-history" element={<AdminTripHistoryPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/emergency-ride" element={<EmergencyRidePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/request-ride" element={<RequestRidePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/trip-history" element={<TripHistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProviders>
  );
}
