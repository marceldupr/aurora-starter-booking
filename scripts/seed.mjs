#!/usr/bin/env node
/**
 * Seed script for aurora-starter-booking.
 * Run after schema provisioning. Uses placeholder images.
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

function placeholderImage(w, h, text) {
  return `https://placehold.co/${w}x${h}/1e293b/94a3b8?text=${encodeURIComponent(text || "Image")}`;
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

  const spaImg = placeholderImage(600, 400, "Spa");
  const consultImg = placeholderImage(600, 400, "Consultation");
  const massageImg = placeholderImage(600, 400, "Massage");

  // 2. Create providers
  const providers = [
    { name: "Sarah Chen", email: "sarah@wellness.studio" },
    { name: "James Miller", email: "james@consult.co" },
    { name: "Elena Rossi", email: "elena@relax.spa" },
  ];
  const createdProviders = [];
  for (const p of providers) {
    const rec = await createRecord("providers", p);
    createdProviders.push(rec);
    console.log("  Created provider:", p.name);
  }

  // 3. Create services
  const services = [
    {
      name: "30-Min Consultation",
      description: "Initial discovery call to understand your needs and goals.",
      duration_minutes: 30,
      price: 5000, // £50 in cents
      image_url: consultImg,
    },
    {
      name: "Deep Tissue Massage",
      description: "Relieve tension and improve circulation with expert massage.",
      duration_minutes: 60,
      price: 7500,
      image_url: massageImg,
    },
    {
      name: "Spa & Wellness Session",
      description: "Full relaxation package including facial and aromatherapy.",
      duration_minutes: 90,
      price: 12000,
      image_url: spaImg,
    },
    {
      name: "Quick Check-in",
      description: "15-minute follow-up or brief consultation.",
      duration_minutes: 15,
      price: 2000,
    },
  ];
  const createdServices = [];
  for (const s of services) {
    const rec = await createRecord("services", s);
    createdServices.push(rec);
    console.log("  Created service:", s.name);
  }

  // 4. Create time slots (next 7 days, varied times)
  const now = new Date();
  let slotCount = 0;
  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(9, 0, 0, 0);
    for (let h = 9; h < 17; h += 2) {
      const start = new Date(date);
      start.setHours(h, 0, 0, 0);
      if (start <= now) continue;
      const end = new Date(start);
      end.setHours(h + 1, 0, 0, 0);
      const provider = createdProviders[d % createdProviders.length];
      const service = createdServices[d % createdServices.length];
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
