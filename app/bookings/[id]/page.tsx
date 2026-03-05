import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuroraClient } from "@/lib/aurora";
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format((cents ?? 0) / 100);
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getBookingWithDetails(id: string) {
  const client = createAuroraClient();
  let booking: Record<string, unknown>;
  try {
    booking = (await client.tables("bookings").records.get(id)) as Record<string, unknown>;
  } catch {
    return null;
  }
  const serviceId = booking?.service_id ? String(booking.service_id) : null;
  const slotId = booking?.time_slot_id ? String(booking.time_slot_id) : null;
  let service: Record<string, unknown> | null = null;
  let slot: Record<string, unknown> | null = null;
  if (serviceId) {
    try {
      service = (await client.tables("services").records.get(serviceId)) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  if (slotId) {
    try {
      slot = (await client.tables("time_slots").records.get(slotId)) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  return { booking, service, slot };
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getBookingWithDetails(id);
  if (!result) notFound();

  const { booking, service, slot } = result;
  const status = String(booking?.status ?? "confirmed");
  const customerName = String(booking?.customer_name ?? "");
  const customerEmail = String(booking?.customer_email ?? "");
  const serviceName = String(service?.name ?? "Your service");
  const price = service?.price != null ? Number(service.price) : null;
  const duration = service?.duration_minutes != null ? Number(service.duration_minutes) : null;
  const startTime = slot?.start_time ? String(slot.start_time) : null;
  const imageUrl = service?.image_url ? String(service.image_url) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="rounded-container bg-aurora-surface border border-aurora-border overflow-hidden">
        <div className="p-10 text-center border-b border-aurora-border">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Booking confirmed</h1>
          <p className="text-aurora-muted mb-4">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-aurora-muted">
            Reference: <code className="text-aurora-accent">{id}</code>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="w-16 h-16 rounded-component object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-component bg-aurora-surface-hover flex items-center justify-center shrink-0">
                <MapPin className="w-8 h-8 text-aurora-muted" />
              </div>
            )}
            <div className="text-left">
              <h2 className="font-semibold text-lg">{serviceName}</h2>
              {price != null && price > 0 ? (
                <p className="text-aurora-accent font-medium">{formatPrice(price)}</p>
              ) : null}
              {duration ? (
                <p className="text-sm text-aurora-muted flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {duration} minutes
                </p>
              ) : null}
            </div>
          </div>

          {startTime ? (
            <div className="flex items-center gap-2 text-aurora-muted">
              <Calendar className="w-5 h-5 text-aurora-accent shrink-0" />
              <span>{formatSlotTime(startTime)}</span>
            </div>
          ) : null}

          <div className="pt-4 border-t border-aurora-border space-y-1">
            <p className="text-sm text-aurora-muted">Booked for</p>
            <p className="font-medium">{customerName}</p>
            <p className="text-sm text-aurora-muted">{customerEmail}</p>
          </div>

          <div
            className={`inline-flex px-3 py-1 rounded-component text-sm font-medium ${
              status === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : status === "cancelled"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-aurora-accent/20 text-aurora-accent"
            }`}
          >
            {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/bookings?email=${encodeURIComponent(customerEmail)}`}
            className="flex-1 px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 transition-opacity text-center"
          >
            View my bookings
          </Link>
          <Link
            href="/services"
            className="flex-1 px-6 py-3 rounded-component border border-aurora-border hover:bg-aurora-surface transition-colors text-center"
          >
            Book another
          </Link>
        </div>
      </div>
    </div>
  );
}
