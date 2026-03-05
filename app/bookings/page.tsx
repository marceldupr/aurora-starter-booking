import Link from "next/link";
import { createAuroraClient } from "@/lib/aurora";
import { Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

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

async function getBookings() {
  const client = createAuroraClient();
  const { data } = await client.tables("bookings").records.list({
    limit: 50,
    sort: "created_at",
    order: "desc",
  });
  return data ?? [];
}

export default async function BookingsPage() {
  const studioUrl =
    process.env.NEXT_PUBLIC_AURORA_API_URL && process.env.NEXT_PUBLIC_TENANT_SLUG
      ? `${process.env.NEXT_PUBLIC_AURORA_API_URL.replace("/api", "")}/${process.env.NEXT_PUBLIC_TENANT_SLUG}/app/sections/bookings`
      : null;

  let bookings: Record<string, unknown>[] = [];
  try {
    bookings = await getBookings();
  } catch {
    /* show empty or studio link */
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">My bookings</h1>
      <p className="text-aurora-muted mb-10">
        View and manage your appointments.
      </p>

      {bookings.length === 0 ? (
        <div className="rounded-container bg-aurora-surface border border-aurora-border p-12 text-center">
          <Calendar className="w-16 h-16 text-aurora-muted/50 mx-auto mb-4" />
          <p className="text-aurora-muted mb-2">No bookings yet</p>
          <p className="text-sm text-aurora-muted mb-6">
            Book a service to see your appointments here.
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
        <div className="space-y-4">
          {bookings.map((b) => {
            const id = String(b.id ?? "");
            const status = String(b.status ?? "");
            const createdAt = b.created_at ? String(b.created_at) : "";
            const customerName = String(b.customer_name ?? "");
            const customerEmail = String(b.customer_email ?? "");
            return (
              <div
                key={id}
                className="rounded-container bg-aurora-surface border border-aurora-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{customerName}</p>
                  <p className="text-sm text-aurora-muted">{customerEmail}</p>
                  {createdAt ? (
                    <p className="text-sm text-aurora-muted mt-1">
                      Booked {formatDate(createdAt)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-component text-sm font-medium ${
                      status === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-aurora-accent/20 text-aurora-accent"
                    }`}
                  >
                    {formatStatus(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
