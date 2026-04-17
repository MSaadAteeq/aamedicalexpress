import { format } from "date-fns";
import { CalendarClock, Navigation } from "lucide-react";
import { mobilityTypeLabels, rideStatusPillClasses, tripTypeLabels } from "@/lib/constants";

export default function RideCard({ ride }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">
          {ride.pickupLocation} to {ride.dropoffLocation}
        </h4>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            rideStatusPillClasses[ride.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {ride.status}
        </span>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
        <CalendarClock size={14} />
        {format(new Date(ride.dateTime), "PPP p")}
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
        <Navigation size={14} />
        {tripTypeLabels[ride.tripType] || ride.tripType} • {mobilityTypeLabels[ride.mobilityType] || ride.mobilityType}
      </p>
      {ride.notes ? <p className="mt-2 text-sm text-slate-500">{ride.notes}</p> : null}
    </article>
  );
}
