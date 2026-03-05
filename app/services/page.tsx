import Link from "next/link";
import { createAuroraClient } from "@/lib/aurora";
import { Clock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format((cents ?? 0) / 100);
}

async function getServices() {
  const client = createAuroraClient();
  const { data } = await client.tables("services").records.list({
    limit: 50,
    sort: "name",
    order: "asc",
  });
  return data ?? [];
}

export default async function ServicesPage() {
  let services: Record<string, unknown>[] = [];
  let error: string | null = null;

  try {
    services = await getServices();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unable to load services";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Browse services</h1>
        <p className="text-aurora-muted">
          Find and book appointments with trusted providers.
        </p>
      </div>

      {error ? (
        <div className="rounded-container bg-aurora-surface border border-aurora-border p-8 text-center">
          <p className="text-aurora-muted mb-4">{error}</p>
          <p className="text-sm text-aurora-muted">
            Ensure AURORA_API_URL and AURORA_API_KEY are set. Provision schema with{" "}
            <code className="text-aurora-accent">pnpm schema:provision</code>.
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-container bg-aurora-surface border border-aurora-border p-12 text-center">
          <p className="text-aurora-muted mb-2">No services yet</p>
          <p className="text-sm text-aurora-muted max-w-md mx-auto">
            Add services in Aurora Studio, or run the seed script to populate demo data.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const id = String(s.id ?? "");
            const name = String(s.name ?? "");
            const description = String(s.description ?? "");
            const price = s.price != null ? Number(s.price) : null;
            const duration = s.duration_minutes != null ? Number(s.duration_minutes) : null;
            const imageUrl = s.image_url ? String(s.image_url) : null;
            return (
              <Link
                key={id}
                href={`/services/${id}`}
                className="group rounded-container overflow-hidden bg-aurora-surface border border-aurora-border hover:border-aurora-accent/40 hover:shadow-xl transition-all"
              >
                <div className="aspect-[16/10] bg-aurora-surface-hover overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-aurora-muted/50">
                      <MapPin className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg mb-2 group-hover:text-aurora-accent transition-colors">
                    {name}
                  </h2>
                  {description ? (
                    <p className="text-aurora-muted text-sm mb-3 line-clamp-2">{description}</p>
                  ) : null}
                  <div className="flex items-center justify-between text-sm">
                    {duration ? (
                      <span className="flex items-center gap-1.5 text-aurora-muted">
                        <Clock className="w-4 h-4" />
                        {duration} min
                      </span>
                    ) : null}
                    {price != null && price > 0 ? (
                      <span className="font-semibold text-aurora-accent">
                        {formatPrice(price)}
                      </span>
                    ) : (
                      <span className="text-aurora-muted">Price on request</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
