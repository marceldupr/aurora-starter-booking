"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (date) params.set("date", date);
    if (guests > 1) params.set("guests", String(guests));
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-component overflow-hidden bg-white/95 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-slate-200">
          <MapPin className="w-5 h-5 text-aurora-accent shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Service or location"
            className="flex-1 min-w-0 bg-transparent text-slate-800 placeholder-slate-500 text-base outline-none"
          />
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-slate-200">
          <Calendar className="w-5 h-5 text-aurora-accent shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="flex-1 min-w-0 bg-transparent text-slate-800 placeholder-slate-500 text-base outline-none"
          />
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3">
          <Users className="w-5 h-5 text-aurora-accent shrink-0" />
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="flex-1 min-w-0 bg-transparent text-slate-800 text-base outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-4 bg-aurora-accent text-aurora-bg font-bold text-center hover:opacity-90 transition-opacity"
      >
        Search
      </button>
    </form>
  );
}
