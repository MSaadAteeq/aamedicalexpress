"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { mobilityTypeLabels, rideStatusPillClasses, tripTypeLabels } from "@/lib/constants";

export default function AdminTripHistoryAccordion({ rides }) {
  const [openRideId, setOpenRideId] = useState(null);

  if (!rides.length) {
    return <p className="text-sm text-slate-600">No trip history found yet.</p>;
  }

  return (
    <div className="space-y-3">
      {rides.map((ride) => {
        const isOpen = openRideId === ride._id;
        return (
          <article key={ride._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 sm:flex-nowrap"
              onClick={() => setOpenRideId((prev) => (prev === ride._id ? null : ride._id))}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 md:text-base">
                  {ride.userId?.name || "Member"} • {tripTypeLabels[ride.tripType] || ride.tripType}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600 md:text-sm">
                  <CalendarClock size={13} />
                  {format(new Date(ride.dateTime), "PPP p")}
                  <span className="mx-1">•</span>
                  <span className="truncate">
                    {ride.pickupLocation} to {ride.dropoffLocation}
                  </span>
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
                <ChevronDown size={16} className={`text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isOpen ? (
              <div className="space-y-4 border-t border-slate-200 bg-slate-50 px-4 py-4">
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <UserRound size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Rider Name</span>
                      <span className="font-medium text-slate-900">{ride.userId?.name || "N/A"}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <Mail size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                      <span className="break-all font-medium text-slate-900">{ride.userId?.email || "N/A"}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <Phone size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
                      <span className="font-medium text-slate-900">{ride.userId?.phone || "N/A"}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Ride Status</span>
                      <span className="font-medium capitalize text-slate-900">{ride.status}</span>
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Pickup Location</span>
                      <span className="font-medium text-slate-900">{ride.pickupLocation}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Drop-off Location</span>
                      <span className="font-medium text-slate-900">{ride.dropoffLocation}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <ClipboardList size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Trip Type</span>
                      <span className="font-medium text-slate-900">{tripTypeLabels[ride.tripType] || ride.tripType}</span>
                    </span>
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <ClipboardList size={15} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Mobility</span>
                      <span className="font-medium text-slate-900">{mobilityTypeLabels[ride.mobilityType] || ride.mobilityType}</span>
                    </span>
                  </p>
                </div>

                {ride.notes ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dispatch Notes</p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">{ride.notes}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
