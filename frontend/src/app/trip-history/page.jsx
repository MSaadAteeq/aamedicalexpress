import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TripHistoryAccordion from "@/components/rides/TripHistoryAccordion";

export default function TripHistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
    if (!isAuthLoading && isAuthenticated && user?.role === "admin") {
      navigate("/admin/trip-history", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, user?.role]);

  useEffect(() => {
    const fetchRideHistory = async () => {
      if (!isAuthenticated || user?.role === "admin") return;

      try {
        setIsLoading(true);
        const response = await api.get("/rides");
        setRides(response.data.rides || []);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        toast.error("Unable to load trip history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideHistory();
  }, [isAuthenticated, logout, navigate, user?.role]);

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">Loading trip history...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white shadow-lg">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-50">
          <ClipboardList size={14} />
          Member History
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">My Trip History</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-50 sm:text-base">
          Expand each ride accordion to review full trip details, notes, status, and appointment timing.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? <p className="text-sm text-slate-600">Loading your rides...</p> : <TripHistoryAccordion rides={rides} />}
      </section>
    </div>
  );
}
