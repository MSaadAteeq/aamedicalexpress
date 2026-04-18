import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ambulance, ArrowRight, CircleUserRound, ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { createRideEventStream } from "@/lib/realtime";
import { useAuth } from "@/context/AuthContext";
import RideCard from "@/components/rides/RideCard";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const emptyStats = {
  totalRides: 0,
  upcomingRides: 0,
  completedRides: 0,
  pendingConfirmations: 0,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isAuthLoading, logout } = useAuth();
  const tripHistoryHref = user?.role === "admin" ? "/admin/trip-history" : "/trip-history";

  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) return;

      try {
        if (!silent) {
          setIsLoadingData(true);
        }
        const [ridesResponse, statsResponse] = await Promise.all([api.get("/rides"), api.get("/rides/stats")]);
        setRides(ridesResponse.data.rides || []);
        setStats(statsResponse.data || emptyStats);
      } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!silent) {
          toast.error("Could not load dashboard data.");
        }
      } finally {
        if (!silent) {
          setIsLoadingData(false);
        }
      }
    },
    [isAuthenticated, logout, navigate]
  );

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!isAuthenticated || !token) return undefined;

    const stream = createRideEventStream(token);
    if (!stream) return undefined;

    const onRideEvent = () => {
      void fetchDashboardData({ silent: true });
    };

    stream.addEventListener("ride_created", onRideEvent);
    stream.addEventListener("ride_updated", onRideEvent);

    return () => {
      stream.removeEventListener("ride_created", onRideEvent);
      stream.removeEventListener("ride_updated", onRideEvent);
      stream.close();
    };
  }, [fetchDashboardData, isAuthenticated, token]);

  const recentRides = useMemo(() => rides.slice(0, 5), [rides]);

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">Loading dashboard...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white shadow-lg">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-50">
          Welcome back, {user?.name?.split(" ")?.[0] || "Member"}
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Your transportation dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-50 sm:text-base">
          Manage bookings, track ride status updates, and coordinate upcoming appointments in one place.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/request-ride" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            <Ambulance size={16} />
            Request New Ride
          </Link>
          <Link to="/edit-profile" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white">
            <CircleUserRound size={16} />
            Edit Profile
          </Link>
          {user?.role === "admin" ? (
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white">
              <ShieldCheck size={16} />
              Dispatch Console
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Name</dt>
              <dd className="text-slate-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Email</dt>
              <dd className="text-slate-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Phone</dt>
              <dd className="text-slate-900">{user?.phone}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 grid gap-3">
            <Link to="/request-ride" className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Request a Ride
              <ArrowRight size={14} />
            </Link>
            <Link to={tripHistoryHref} className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              My Trip History
              <ClipboardList size={14} />
            </Link>
            <Link to="/edit-profile" className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700">
              Edit Profile
              <CircleUserRound size={14} />
            </Link>
            <Button type="button" className="w-full justify-center" onClick={handleSignOut}>
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>
        </article>
        </section>

        <section className="space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent Rides</h3>
          {isLoadingData ? (
            <p className="mt-4 text-sm text-slate-600">Loading rides...</p>
          ) : recentRides.length ? (
            <div className="mt-4 space-y-3">
              {recentRides.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No rides yet. Book your first ride.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Account Summary</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Total Rides" value={stats.totalRides} />
            <StatCard label="Upcoming Rides" value={stats.upcomingRides} />
            <StatCard label="Completed Rides" value={stats.completedRides} />
            <StatCard label="Pending Confirmations" value={stats.pendingConfirmations} />
          </div>
        </article>
        </section>
      </div>
    </div>
  );
}
