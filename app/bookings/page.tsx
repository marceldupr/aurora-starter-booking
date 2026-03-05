import Link from "next/link";
import { Suspense } from "react";
import { createAuroraClient } from "@/lib/aurora";
import { Calendar, ArrowRight } from "lucide-react";
import { BookingsList } from "./BookingsList";
import { EmailLookupForm } from "./EmailLookupForm";

export const dynamic = "force-dynamic";

async function getBookings(email?: string | null) {
  const client = createAuroraClient();
  const opts: { limit: number; sort: string; order: "desc"; customer_email?: string } = {
    limit: 50,
    sort: "created_at",
    order: "desc",
  };
  if (email?.trim()) {
    opts.customer_email = email.trim();
  }
  const { data } = await client.tables("bookings").records.list(opts);
  return data ?? [];
}

async function enrichBookings(bookings: Record<string, unknown>[]) {
  const serviceIds = new Set<string>();
  const slotIds = new Set<string>();
  for (const b of bookings) {
    const sid = b.service_id ? String(b.service_id) : null;
    const tid = b.time_slot_id ? String(b.time_slot_id) : null;
    if (sid) serviceIds.add(sid);
    if (tid) slotIds.add(tid);
  }
  const client = createAuroraClient();
  const [servicesRes, slotsRes] = await Promise.all([
    client.tables("services").records.list({ limit: 100 }),
    client.tables("time_slots").records.list({ limit: 200 }),
  ]);
  const services = (servicesRes as { data?: Record<string, unknown>[] })?.data ?? [];
  const slots = (slotsRes as { data?: Record<string, unknown>[] })?.data ?? [];
  const serviceMap = new Map(services.map((s) => [String(s.id), s]));
  const slotMap = new Map(slots.map((s) => [String(s.id), s]));

  return bookings.map((b) => {
    const sid = b.service_id ? String(b.service_id) : null;
    const tid = b.time_slot_id ? String(b.time_slot_id) : null;
    const service = sid ? serviceMap.get(sid) : null;
    const slot = tid ? slotMap.get(tid) : null;
    return {
      ...b,
      serviceName: service?.name ? String(service.name) : undefined,
      slotTime: slot?.start_time
        ? new Date(String(slot.start_time)).toLocaleString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    };
  });
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const studioUrl =
    process.env.NEXT_PUBLIC_AURORA_API_URL && process.env.NEXT_PUBLIC_TENANT_SLUG
      ? `${process.env.NEXT_PUBLIC_AURORA_API_URL.replace("/api", "")}/${process.env.NEXT_PUBLIC_TENANT_SLUG}/app/sections/bookings`
      : null;

  let bookings: Record<string, unknown>[] = [];
  let error: string | null = null;
  try {
    bookings = await getBookings(email);
    bookings = await enrichBookings(bookings);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unable to load bookings";
  }

  // When no email provided, show lookup form only (don't leak all bookings)
  if (!email?.trim()) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">My bookings</h1>
        <p className="text-aurora-muted mb-10">
          Enter the email you used when booking to view and manage your appointments.
        </p>
        <div className="max-w-md">
          <Suspense fallback={<div className="h-12 rounded-component bg-aurora-surface animate-pulse" />}>
            <EmailLookupForm defaultEmail="" />
          </Suspense>
        </div>
        <div className="mt-12 pt-8 border-t border-aurora-border">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-aurora-accent hover:underline"
          >
            Browse services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">My bookings</h1>
      <p className="text-aurora-muted mb-6">
        View and manage your appointments for <strong className="text-white">{email}</strong>.
      </p>

      <div className="mb-8">
        <Suspense fallback={<div className="h-12 rounded-component bg-aurora-surface animate-pulse" />}>
          <EmailLookupForm defaultEmail={email} />
        </Suspense>
      </div>

      {error ? (
        <div className="rounded-container bg-aurora-surface border border-aurora-border p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-container bg-aurora-surface border border-aurora-border p-12 text-center">
          <Calendar className="w-16 h-16 text-aurora-muted/50 mx-auto mb-4" />
          <p className="text-aurora-muted mb-2">No bookings found</p>
          <p className="text-sm text-aurora-muted mb-6">
            No appointments for this email. Book a service to get started.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 transition-opacity"
          >
            Browse services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <BookingsList
          bookings={bookings as { id: string; customer_name: string; customer_email: string; created_at?: string; status: string; service_id?: string; time_slot_id?: string; serviceName?: string; slotTime?: string }[]}
          studioUrl={studioUrl}
        />
      )}
    </div>
  );
}
