#!/usr/bin/env node
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiUrl = process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL;
const apiKey = process.env.AURORA_API_KEY;

if (!apiUrl || !apiKey) {
  console.error("Usage: AURORA_API_URL=... AURORA_API_KEY=... pnpm schema:provision");
  process.exit(1);
}

const schema = JSON.parse(readFileSync(join(__dirname, "../init/schema.json"), "utf8"));
const base = apiUrl.replace(/\/$/, "");
const res = await fetch(`${base}/v1/provision-schema`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
  body: JSON.stringify({ schema, base: "base" }),
});

if (!res.ok) {
  console.error("Provision failed:", res.status, await res.text());
  process.exit(1);
}
console.log("Schema provisioned:", JSON.stringify(await res.json(), null, 2));
