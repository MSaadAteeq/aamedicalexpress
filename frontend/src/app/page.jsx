import { Link } from "react-router-dom";
import { Ambulance, CalendarClock, ShieldCheck, Stethoscope, Phone, Clock3, MapPinned, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full space-y-14 pb-0 pt-6 sm:pt-8">
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-900 px-4 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-60 w-60 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
              Medical Transportation Service
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              Safe, reliable rides for medical appointments and care transitions.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-blue-100">
              Book emergency and planned non-emergency transportation with support for ambulatory, wheelchair, and stretcher needs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/emergency-ride"
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600"
              >
                <Ambulance size={16} />
                Emergency Ride Request
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                  Go to Dashboard
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                    Create Account
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/login" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Dispatch Snapshot</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-slate-900/45 p-4">
                <p className="inline-flex items-center gap-2 text-xs text-blue-100">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Active monitoring
                </p>
                <p className="mt-1 text-2xl font-bold">12 workflows</p>
              </div>
              <div className="rounded-2xl bg-slate-900/45 p-4">
                <p className="inline-flex items-center gap-2 text-xs text-blue-100">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Average callback
                </p>
                <p className="mt-1 text-2xl font-bold">8 mins</p>
              </div>
              <div className="rounded-2xl bg-slate-900/45 p-4">
                <p className="inline-flex items-center gap-2 text-xs text-blue-100">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Same-day confirmations
                </p>
                <p className="mt-1 text-2xl font-bold">96.2%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="inline-flex rounded-lg bg-blue-100 p-2 text-blue-700">
            <CalendarClock size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Appointment Ready</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Schedule one-way, round-trip, or multi-stop rides around your care plan.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <ShieldCheck size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Verified Dispatch</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Our dispatch team confirms requests quickly and keeps riders updated.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="inline-flex rounded-lg bg-violet-100 p-2 text-violet-700">
            <Stethoscope size={18} />
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Mobility Support</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Ambulatory, wheelchair, stretcher, and specialized transport options available.</p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-2 text-sm text-slate-600">
            Our medical transport workflow is designed for speed, visibility, and safer handoffs.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 1</p>
            <h3 className="mt-2 font-semibold text-slate-900">Create Account</h3>
            <p className="mt-1 text-sm text-slate-600">Sign up in under a minute and keep your rider information saved for future bookings.</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 2</p>
            <h3 className="mt-2 font-semibold text-slate-900">Book Your Ride</h3>
            <p className="mt-1 text-sm text-slate-600">Select trip type, mobility needs, and date/time so dispatch can coordinate accurately.</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 3</p>
            <h3 className="mt-2 font-semibold text-slate-900">Track Status</h3>
            <p className="mt-1 text-sm text-slate-600">Monitor pending, confirmed, and completed status updates from your dashboard.</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="text-2xl font-bold text-slate-900">Service Coverage (Sample)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-900">Northern Virginia Medical Corridor</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Alexandria, Arlington, Fairfax, Falls Church, and nearby clinic destinations.</p>
          </article>
          <article className="rounded-2xl border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-900">Greater DC Transfer Support</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Hospital discharges and outpatient appointments with assisted mobility options.</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Need immediate help?</h2>
          <p className="mt-1 text-sm text-slate-600">Use our emergency form for urgent requests without creating an account.</p>
        </div>
        <Link
          to="/emergency-ride"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Ambulance size={16} />
          Go to Emergency Form
        </Link>
      </section>
      </div>

      <footer className="w-full bg-slate-950 px-4 py-14 text-left text-slate-100 sm:px-6 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl gap-8 text-left md:grid-cols-3">
          <section>
            <h3 className="text-lg font-semibold text-white">PMT Member</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
              Reliable non-emergency and urgent medical transportation coordination.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">Sample Contact Data</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Phone size={14} />
                Dispatch Line: (571) 555-0132
              </li>
              <li className="flex items-center gap-2">
                <Clock3 size={14} />
                Support Hours: Mon-Sat, 6:00 AM - 9:00 PM
              </li>
              <li className="flex items-center gap-2">
                <MapPinned size={14} />
                Region: Northern VA + DC Metro
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">Sample SLA</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li>Emergency intake callback target: 5-10 minutes</li>
              <li>Standard confirmation target: under 30 minutes</li>
              <li>Status updates available in dashboard timeline</li>
            </ul>
          </section>
        </div>
      </footer>
    </div>
  );
}
