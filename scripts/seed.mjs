#!/usr/bin/env node
/**
 * Seed script for aurora-starter-booking.
 * Run after schema provisioning. Uses Picsum for varied images.
 *
 * Usage:
 *   AURORA_API_URL=... AURORA_API_KEY=... node scripts/seed.mjs
 */

const apiUrl = process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL;
const apiKey = process.env.AURORA_API_KEY;

if (!apiUrl || !apiKey) {
  console.error("Set AURORA_API_URL and AURORA_API_KEY");
  process.exit(1);
}

const base = apiUrl.replace(/\/$/, "");

function imageUrl(seed, width = 600, height = 400) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

async function createRecord(table, data) {
  const res = await fetch(`${base}/v1/tables/${table}/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`${table} create failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function seed() {
  console.log("Seeding aurora-starter-booking...");

  // Create providers
  const providers = [
    { name: "Sarah Chen", email: "sarah@wellness.studio" },
    { name: "James Miller", email: "james@consult.co" },
    { name: "Elena Rossi", email: "elena@relax.spa" },
    { name: "Marcus Okonkwo", email: "marcus@therapies.co" },
    { name: "Priya Sharma", email: "priya@holistic.london" },
  ];
  const createdProviders = [];
  for (const p of providers) {
    const rec = await createRecord("providers", p);
    createdProviders.push(rec);
    console.log("  Created provider:", p.name);
  }

  // Create services with rich variety, categories, and real imagery
  const services = [
    {
      name: "Deep Tissue Massage",
      category: "Wellness",
      description: "Relieve chronic tension and improve circulation with our signature deep tissue massage. Perfect for athletes and desk workers.",
      duration_minutes: 60,
      price: 7500,
      image_url: imageUrl("massage-spa-1"),
    },
    {
      name: "30-Min Consultation",
      category: "Consultation",
      description: "Initial discovery call to understand your needs and goals. We'll create a tailored plan for your wellness journey.",
      duration_minutes: 30,
      price: 5000,
      image_url: imageUrl("consultation-1"),
    },
    {
      name: "Spa & Wellness Package",
      category: "Wellness",
      description: "Full relaxation package including facial, aromatherapy, and scalp massage. Leave feeling refreshed and rejuvenated.",
      duration_minutes: 90,
      price: 12000,
      image_url: imageUrl("spa-wellness-1"),
    },
    {
      name: "Sports Rehabilitation",
      category: "Therapy",
      description: "Targeted therapy for injury recovery and performance enhancement. Combine massage with expert movement assessment.",
      duration_minutes: 75,
      price: 9500,
      image_url: imageUrl("sports-therapy-1"),
    },
    {
      name: "Hot Stone Massage",
      category: "Wellness",
      description: "Warm basalt stones melt away muscle tension. A deeply relaxing experience that improves circulation and reduces stress.",
      duration_minutes: 60,
      price: 8500,
      image_url: imageUrl("hot-stone-1"),
    },
    {
      name: "Executive Coaching Session",
      category: "Consultation",
      description: "One-on-one coaching for leadership development, career transition, or strategic planning. Confidential and results-focused.",
      duration_minutes: 60,
      price: 15000,
      image_url: imageUrl("coaching-1"),
    },
    {
      name: "Quick Check-in",
      category: "Consultation",
      description: "15-minute follow-up or brief consultation. Ideal for ongoing clients who need a quick touch base.",
      duration_minutes: 15,
      price: 2000,
      image_url: imageUrl("checkin-1"),
    },
    {
      name: "Aromatherapy Session",
      category: "Wellness",
      description: "Custom blends of essential oils combined with gentle massage. Boost mood, reduce anxiety, and promote restful sleep.",
      duration_minutes: 45,
      price: 5500,
      image_url: imageUrl("aromatherapy-1"),
    },
  ];
  const createdServices = [];
  for (const s of services) {
    const rec = await createRecord("services", s);
    createdServices.push(rec);
    console.log("  Created service:", s.name);
  }

  // Create time slots (next 14 days, varied times, more density)
  const now = new Date();
  let slotCount = 0;
  for (let d = 0; d < 14; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(9, 0, 0, 0);
    for (let h = 9; h < 18; h += 1) {
      const start = new Date(date);
      start.setHours(h, 0, 0, 0);
      if (start <= now) continue;
      const end = new Date(start);
      end.setHours(h + 1, 0, 0);
      const provider = createdProviders[d % createdProviders.length];
      const service = createdServices[(d + h) % createdServices.length];
      await createRecord("time_slots", {
        provider_id: provider.id,
        service_id: service.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "available",
      });
      slotCount++;
    }
  }
  console.log(`  Created ${slotCount} time slots`);

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
