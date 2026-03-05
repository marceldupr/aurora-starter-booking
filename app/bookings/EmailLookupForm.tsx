"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function EmailLookupForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(defaultEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("email", trimmed);
    router.push(`/bookings?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-3 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder-aurora-muted outline-none focus:border-aurora-accent"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        View my bookings
      </button>
    </form>
  );
}
