import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellRing, CheckCircle2, Clock3, MapPin, ShieldAlert, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  mobilityTypeLabels,
  rideStatusPillClasses,
  statusWorkflowAction,
  tripTypeLabels,
} from "@/lib/constants";
import Button from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";

const defaultStats = {
  totalRides: 0,
  pendingRides: 0,
  confirmedRides: 0,
  completedRides: 0,
  upcomingRides: 0,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRideId, setUpdatingRideId] = useState(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAuthLoading && user?.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, user]);

  const loadData = async () => {
    try {
      const response = await api.get("/rides/admin/dashboard");
      setStats(response.data.stats || defaultStats);
      setRides(response.data.allRides || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dispatch dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const timer = setTimeout(() => {
        void loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.role]);

  const actionableRides = useMemo(
    () => rides.filter((ride) => ride.status === "pending" || ride.status === "confirmed"),
    [rides]
  );
  const recentRides = useMemo(() => rides.slice(0, 12), [rides]);

  const updateStatus = async (ride) => {
    const nextStatus = statusWorkflowAction[ride.status];
    if (!nextStatus) return;

    try {
      setUpdatingRideId(ride._id);
      await api.patch(`/rides/${ride._id}/status`, { status: nextStatus });
      toast.success(`Ride marked as ${nextStatus}.`);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update ride status.");
    } finally {
      setUpdatingRideId(null);
    }
  };

  if (isAuthLoading || isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">Loading dispatch dashboard...</div>;
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-indigo-900/70 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-50">
          <BellRing size={14} /> Dispatch Control Center
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Operations Command Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50 sm:text-base">
          You are controlling dispatch operations. Review incoming demand, promote ride statuses, and audit cross-member trip activity.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/trip-history"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Open Full Trip History
            <ArrowRight size={15} />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-1.5 text-xs text-slate-100">
            <ShieldAlert size={14} />
            Admin-only controls enabled
          </span>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={stats.totalRides} />
        <StatCard label="Pending" value={stats.pendingRides} />
        <StatCard label="Confirmed" value={stats.confirmedRides} />
        <StatCard label="Completed" value={stats.completedRides} />
        <StatCard label="Upcoming" value={stats.upcomingRides} />
      </section>

      <section className="mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-lg">
        <h2 className="text-lg font-semibold text-white">Status Workflow Queue</h2>
        <p className="mt-1 text-sm text-slate-300">Advance rides through the flow: pending → confirmed → completed.</p>

        <div className="mt-4 space-y-3">
          {actionableRides.length ? (
            actionableRides.map((ride) => {
              const nextStatus = statusWorkflowAction[ride.status];
              return (
                <article key={ride._id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {ride.userId?.name || "Member"} • {tripTypeLabels[ride.tripType] || ride.tripType}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {format(new Date(ride.dateTime), "PPP p")} • {mobilityTypeLabels[ride.mobilityType] || ride.mobilityType}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-300">
                        <MapPin size={14} /> {ride.pickupLocation} to {ride.dropoffLocation}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          rideStatusPillClasses[ride.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                      <Button
                        type="button"
                        isLoading={updatingRideId === ride._id}
                        onClick={() => updateStatus(ride)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        {nextStatus === "confirmed" ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                        Mark {nextStatus}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="text-sm text-slate-300">No pending workflow actions right now.</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Dispatch Activity</h2>
        <div className="mt-4 space-y-2">
          {recentRides.length ? (
            recentRides.map((ride) => (
              <div key={ride._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm lg:grid lg:grid-cols-[1.2fr_1fr_1.5fr_auto] lg:items-center">
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <Clock3 size={14} />
                  {format(new Date(ride.dateTime), "PPp")}
                </span>
                <span className="text-slate-700">{ride.userId?.name || "Member"}</span>
                <span className="text-slate-700">
                  {tripTypeLabels[ride.tripType] || ride.tripType} • {mobilityTypeLabels[ride.mobilityType] || ride.mobilityType}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    rideStatusPillClasses[ride.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ride.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No dispatch activity yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
