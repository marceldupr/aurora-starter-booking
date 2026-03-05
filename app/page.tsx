import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero - Booking.com style */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden min-h-[420px]">
        <div className="absolute inset-0 bg-gradient-to-b from-aurora-surface/40 to-transparent" />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "url(https://placehold.co/1920x1080/1e293b/94a3b8?text=Find+and+book+services)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl">
            Find and book the best services
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-10 drop-shadow max-w-2xl">
            Consultations, wellness, appointments and more — from trusted providers in your area.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* Quick links */}
      <section className="py-16 px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-component bg-aurora-surface border border-aurora-border hover:bg-aurora-surface-hover hover:border-aurora-accent/30 transition-all font-semibold"
          >
            Browse all services
          </Link>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-component border-2 border-aurora-accent/50 text-aurora-accent font-semibold hover:bg-aurora-accent/10 transition-all"
          >
            View my bookings
          </Link>
        </div>
      </section>
    </div>
  );
}
