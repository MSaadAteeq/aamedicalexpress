import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RideRequestForm from "@/components/forms/RideRequestForm";
import { useAuth } from "@/context/AuthContext";

export default function RequestRidePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">Checking authentication...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Request a Ride</h1>
        <p className="mt-1 text-sm text-slate-600">Provide full ride details and we will confirm your transportation shortly.</p>
        <div className="mt-6">
          <RideRequestForm />
        </div>
      </section>
    </div>
  );
}
