"use client";

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

export function HeroSearch() {
  return (
    <div className="w-full max-w-3xl rounded-component overflow-hidden bg-white/95 shadow-2xl">
      <Link href="/services" className="block">
        <div className="flex flex-col sm:flex-row cursor-pointer">
          <div className="flex-1 flex items-center gap-3 px-4 py-4 border-b sm:border-b-0 sm:border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
            <MapPin className="w-5 h-5 text-aurora-accent shrink-0" />
            <span className="flex-1 text-slate-500 text-base">Service or location</span>
          </div>
          <div className="flex-1 flex items-center gap-3 px-4 py-4 border-b sm:border-b-0 sm:border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
            <Calendar className="w-5 h-5 text-aurora-accent shrink-0" />
            <span className="flex-1 text-slate-500 text-base">Select dates</span>
          </div>
          <div className="flex-1 flex items-center gap-3 px-4 py-4 hover:bg-slate-50/50 transition-colors">
            <Users className="w-5 h-5 text-aurora-accent shrink-0" />
            <span className="flex-1 text-slate-500 text-base">1 person</span>
          </div>
        </div>
        <div className="py-4 bg-aurora-accent text-aurora-bg font-bold text-center hover:opacity-90 transition-opacity">
          Search
        </div>
      </Link>
    </div>
  );
}
