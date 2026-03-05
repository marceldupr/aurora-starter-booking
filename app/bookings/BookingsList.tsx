"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  created_at?: string;
  status: string;
  service_id?: string;
  time_slot_id?: string;
};

type EnrichedBooking = Booking & {
  serviceName?: string;
  slotTime?: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatStatus(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BookingsList({
  bookings: initialBookings,
  studioUrl,
}: {
  bookings: EnrichedBooking[];
  studioUrl: string | null;
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (b: EnrichedBooking) => {
    if (b.status === "cancelled") return;
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(b.id);
    try {
      const res = await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      setBookings((prev) =>
        prev.map((x) =>
          x.id === b.id ? { ...x, status: "cancelled" } : x
        )
      );
      router.refresh();
    } catch {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-container bg-aurora-surface border border-aurora-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="min-w-0">
              {b.serviceName ? (
                <p className="font-semibold text-aurora-accent mb-0.5">
                  {b.serviceName}
                </p>
              ) : null}
              <p className="font-medium">{b.customer_name}</p>
              <p className="text-sm text-aurora-muted">{b.customer_email}</p>
              {b.slotTime ? (
                <p className="text-sm text-aurora-muted mt-1">{b.slotTime}</p>
              ) : b.created_at ? (
                <p className="text-sm text-aurora-muted mt-1">
                  Booked {formatDate(b.created_at)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href={`/bookings/${b.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-aurora-accent hover:underline"
              >
                View details
                <ExternalLink className="w-4 h-4" />
              </Link>
              <span
                className={`px-3 py-1 rounded-component text-sm font-medium ${
                  b.status === "confirmed"
                    ? "bg-green-500/20 text-green-400"
                    : b.status === "cancelled"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-aurora-accent/20 text-aurora-accent"
                }`}
              >
                {formatStatus(b.status)}
              </span>
              {b.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => handleCancel(b)}
                  disabled={cancellingId === b.id}
                  className="px-3 py-1.5 rounded-component border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {studioUrl && (
        <div className="mt-10 pt-8 border-t border-aurora-border">
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-aurora-accent hover:underline text-sm"
          >
            Manage all bookings in Aurora Studio →
          </a>
        </div>
      )}
    </>
  );
}
