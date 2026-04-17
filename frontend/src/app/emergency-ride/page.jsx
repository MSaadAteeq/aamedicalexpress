import { PhoneCall, Siren } from "lucide-react";
import LandingRideRequestForm from "@/components/forms/LandingRideRequestForm";

export default function EmergencyRidePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Emergency Ride Request</h1>
        <p className="mt-2 max-w-2xl text-sm text-red-50 sm:text-base">
          This form is for urgent transportation needs. Dispatch will contact you as soon as possible after submission.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5">
            <Siren size={16} /> Priority dispatch queue
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5">
            <PhoneCall size={16} /> Callback support
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <LandingRideRequestForm />
      </section>
    </div>
  );
}
