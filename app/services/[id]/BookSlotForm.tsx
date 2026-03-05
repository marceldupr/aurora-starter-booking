"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookSlotForm({
  serviceId,
  serviceName,
  slots,
}: {
  serviceId: string;
  serviceName: string;
  slots: Record<string, unknown>[];
}) {
  const router = useRouter();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError("Please select a time slot");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_slot_id: selectedSlotId,
          service_id: serviceId,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim() || undefined,
          status: "confirmed",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Booking failed");
      }
      const data = (await res.json()) as { id?: string };
      router.push(`/bookings/${data.id ?? "success"}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {slots.length === 0 ? (
        <p className="text-aurora-muted text-sm">
          No available slots at the moment. Check back later or contact the provider.
        </p>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Select a time</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {slots.map((s) => {
              const id = String(s.id ?? "");
              const startTime = s.start_time ? String(s.start_time) : "";
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedSlotId(id)}
                  className={`w-full text-left px-4 py-3 rounded-component border transition-colors ${
                    selectedSlotId === id
                      ? "border-aurora-accent bg-aurora-accent/20 text-white"
                      : "border-aurora-border hover:border-aurora-accent/50 hover:bg-aurora-surface-hover"
                  }`}
                >
                  {formatSlotTime(startTime)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {slots.length > 0 && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder-aurora-muted outline-none focus:border-aurora-accent"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder-aurora-muted outline-none focus:border-aurora-accent"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder-aurora-muted outline-none focus:border-aurora-accent"
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || slots.length === 0}
            className="w-full py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Booking…" : `Book ${serviceName}`}
          </button>
        </>
      )}
    </form>
  );
}
