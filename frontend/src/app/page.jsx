import { Link } from "react-router-dom";
import { Ambulance, CalendarClock, ShieldCheck, Stethoscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white shadow-lg sm:p-10">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
          Medical Transportation Service
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">Safe, reliable rides for medical appointments and care transitions.</h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
          Book emergency and planned non-emergency transportation with support for ambulatory, wheelchair, and stretcher needs.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/emergency-ride"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
          >
            <Ambulance size={16} />
            Emergency Ride Request
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">
                Create Account
              </Link>
              <Link href="/login" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-lg bg-blue-100 p-2 text-blue-700">
            <CalendarClock size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Appointment Ready</h3>
          <p className="mt-1 text-sm text-slate-600">Schedule one-way, round-trip, or multi-stop rides around your care plan.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <ShieldCheck size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Verified Dispatch</h3>
          <p className="mt-1 text-sm text-slate-600">Our dispatch team confirms requests quickly and keeps riders updated.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-lg bg-violet-100 p-2 text-violet-700">
            <Stethoscope size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Mobility Support</h3>
          <p className="mt-1 text-sm text-slate-600">Ambulatory, wheelchair, stretcher, and specialized transport options available.</p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Need immediate help?</h2>
          <p className="mt-1 text-sm text-slate-600">Use our emergency form for urgent requests without creating an account.</p>
        </div>
        <Link
          href="/emergency-ride"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Ambulance size={16} />
          Go to Emergency Form
        </Link>
      </section>
    </div>
  );
}
