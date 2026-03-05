import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuroraClient } from "@/lib/aurora";
import { BookSlotForm } from "./BookSlotForm";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format((cents ?? 0) / 100);
}

async function getServiceAndSlots(id: string, dateFilter?: string | null) {
  const client = createAuroraClient();
  const [serviceRes, slotsRes] = await Promise.all([
    client.tables("services").records.get(id),
    client.tables("time_slots").records.list({
      limit: 200,
      sort: "start_time",
      order: "asc",
    }),
  ]);

  const service = serviceRes as Record<string, unknown> | null;
  const allSlots = (slotsRes as { data?: Record<string, unknown>[] })?.data ?? [];
  const now = new Date();

  // Parse optional date filter (YYYY-MM-DD)
  const filterDate = dateFilter
    ? (() => {
        const d = new Date(dateFilter + "T00:00:00");
        return isNaN(d.getTime()) ? null : d;
      })()
    : null;

  const availableSlots = allSlots.filter((s) => {
    if (String(s.service_id ?? "") !== id) return false;
    const status = String(s.status ?? "");
    const start = s.start_time ? new Date(String(s.start_time)) : null;
    if (!(status === "available" || !status) || !start || start <= now) return false;
    if (filterDate) {
      const slotDate = new Date(start);
      if (slotDate.getFullYear() !== filterDate.getFullYear() ||
          slotDate.getMonth() !== filterDate.getMonth() ||
          slotDate.getDate() !== filterDate.getDate()) return false;
    }
    return true;
  });

  return { service, slots: availableSlots };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;

  let service: Record<string, unknown> | null = null;
  let slots: Record<string, unknown>[] = [];
  try {
    const result = await getServiceAndSlots(id, date);
    service = result.service;
    slots = result.slots ?? [];
  } catch {
    notFound();
  }

  if (!service) notFound();

  const name = String(service.name ?? "");
  const description = String(service.description ?? "");
  const price = service.price != null ? Number(service.price) : null;
  const duration = service.duration_minutes != null ? Number(service.duration_minutes) : null;
  const imageUrl = service.image_url ? String(service.image_url) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/services" className="text-aurora-muted hover:text-white text-sm mb-6 inline-block">
        ← Back to services
      </Link>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="rounded-container overflow-hidden bg-aurora-surface border border-aurora-border mb-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-aurora-surface-hover flex items-center justify-center text-aurora-muted/50">
                Service image
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{name}</h1>
          {description ? (
            <p className="text-aurora-muted leading-relaxed mb-6">{description}</p>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {duration ? (
              <span className="flex items-center gap-2 px-4 py-2 rounded-component bg-aurora-surface border border-aurora-border">
                <Clock className="w-5 h-5 text-aurora-accent" />
                {duration} minutes
              </span>
            ) : null}
            {price != null && price > 0 ? (
              <span className="px-4 py-2 rounded-component bg-aurora-accent/20 text-aurora-accent font-semibold">
                {formatPrice(price)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-container bg-aurora-surface border border-aurora-border p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Book this service</h2>
            <BookSlotForm
              serviceId={id}
              serviceName={name}
              slots={slots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
