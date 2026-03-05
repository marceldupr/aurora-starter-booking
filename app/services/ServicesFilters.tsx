"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

const CATEGORIES = ["Wellness", "Consultation", "Therapy"];

export function ServicesFilters({
  query,
  sort,
  order,
  category,
}: {
  query?: string;
  sort: string;
  order: string;
  category?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query ?? "");

  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    startTransition(() => router.push(`/services?${params.toString()}`));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchValue.trim() || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "name_asc") updateUrl({ sort: "name", order: "asc" });
    else if (val === "name_desc") updateUrl({ sort: "name", order: "desc" });
    else if (val === "price_asc") updateUrl({ sort: "price", order: "asc" });
    else if (val === "price_desc") updateUrl({ sort: "price", order: "desc" });
    else if (val === "duration_asc") updateUrl({ sort: "duration_minutes", order: "asc" });
    else if (val === "duration_desc") updateUrl({ sort: "duration_minutes", order: "desc" });
  };

  const sortValue =
    sort === "name"
      ? order === "asc"
        ? "name_asc"
        : "name_desc"
      : sort === "price"
        ? order === "asc"
          ? "price_asc"
          : "price_desc"
        : sort === "duration_minutes"
          ? order === "asc"
            ? "duration_asc"
            : "duration_desc"
          : "name_asc";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-aurora-muted mr-1">Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => updateUrl({ category: category === cat ? undefined : cat })}
            className={`px-3 py-1.5 rounded-component text-sm font-medium transition-colors ${
              category === cat
                ? "bg-aurora-accent text-aurora-bg"
                : "bg-aurora-surface border border-aurora-border hover:border-aurora-accent/50"
            }`}
          >
            {cat}
          </button>
        ))}
        {category && (
          <button
            type="button"
            onClick={() => updateUrl({ category: undefined })}
            className="px-3 py-1.5 rounded-component text-sm text-aurora-muted hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-12 pr-4 py-2.5 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder-aurora-muted outline-none focus:border-aurora-accent"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="ml-2 px-6 py-2.5 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Search
        </button>
      </form>
      <select
        value={sortValue}
        onChange={handleSortChange}
        className="px-4 py-2.5 rounded-component bg-aurora-bg border border-aurora-border text-white outline-none focus:border-aurora-accent min-w-[180px]"
      >
        <option value="name_asc">Name A–Z</option>
        <option value="name_desc">Name Z–A</option>
        <option value="price_asc">Price: Low to high</option>
        <option value="price_desc">Price: High to low</option>
        <option value="duration_asc">Duration: Short first</option>
        <option value="duration_desc">Duration: Long first</option>
      </select>
      </div>
    </div>
  );
}
