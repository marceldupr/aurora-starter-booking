import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="rounded-container bg-aurora-surface border border-aurora-border p-10">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Booking confirmed</h1>
        <p className="text-aurora-muted mb-6">
          Your booking has been confirmed. You will receive a confirmation email shortly.
        </p>
        <p className="text-sm text-aurora-muted mb-8">
          Reference: <code className="text-aurora-accent">{id}</code>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bookings"
            className="px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 transition-opacity"
          >
            View my bookings
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 rounded-component border border-aurora-border hover:bg-aurora-surface transition-colors"
          >
            Book another
          </Link>
        </div>
      </div>
    </div>
  );
}
