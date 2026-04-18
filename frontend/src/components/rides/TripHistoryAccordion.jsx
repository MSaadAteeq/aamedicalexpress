"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarClock, ChevronDown, CircleEllipsis, MapPin, Navigation } from "lucide-react";
import { mobilityTypeLabels, rideStatusPillClasses, tripTypeLabels } from "@/lib/constants";

const statusOrder = ["pending", "confirmed", "completed"];

export default function TripHistoryAccordion({ rides }) {
  const [openRideId, setOpenRideId] = useState(null);

  const ridesByStatus = useMemo(() => {
    const buckets = {
      pending: [],
      confirmed: [],
      completed: [],
      other: [],
    };

    rides.forEach((ride) => {
      if (buckets[ride.status]) {
        buckets[ride.status].push(ride);
      } else {
        buckets.other.push(ride);
      }
    });

    return buckets;
  }, [rides]);

  const sections = [
    ...statusOrder.map((status) => ({
      key: status,
      title: status[0].toUpperCase() + status.slice(1),
      items: ridesByStatus[status],
    })),
    { key: "other", title: "Other", items: ridesByStatus.other },
  ].filter((section) => section.items.length > 0);

  if (!sections.length) {
    return <p className="text-sm text-slate-600">No rides yet. Book your first ride.</p>;
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.key}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {section.title} ({section.items.length})
          </h3>
          <div className="space-y-3">
            {section.items.map((ride) => {
              const isOpen = openRideId === ride._id;
              return (
                <article key={ride._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    onClick={() => setOpenRideId((prev) => (prev === ride._id ? null : ride._id))}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {ride.pickupLocation} to {ride.dropoffLocation}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                        <CalendarClock size={13} />
                        {format(new Date(ride.dateTime), "PPP p")}
                        <span className="mx-1">•</span>
                        {tripTypeLabels[ride.tripType] || ride.tripType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          rideStatusPillClasses[ride.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="space-y-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />
                        Pickup: {ride.pickupLocation}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />
                        Drop-off: {ride.dropoffLocation}
                      </p>
                      <p className="flex items-center gap-1">
                        <Navigation size={14} />
                        Mobility: {mobilityTypeLabels[ride.mobilityType] || ride.mobilityType}
                      </p>
                      <p className="flex items-center gap-1">
                        <CircleEllipsis size={14} />
                        Trip Type: {tripTypeLabels[ride.tripType] || ride.tripType}
                      </p>
                      {ride.notes ? (
                        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Notes: {ride.notes}</p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
