/**
 * First-run schema provisioning for Aurora.
 */
export const AURORA_BASE = "base" as const;

export type SchemaShape = {
  tables: unknown[];
  reports?: unknown[];
  workflows?: unknown[];
};

export async function runFirstRunProvision(): Promise<void> {
  const apiUrl = process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL;
  const apiKey = process.env.AURORA_API_KEY;
  if (!apiUrl || !apiKey) return;
  const baseUrl = apiUrl.replace(/\/$/, "");
  // Always provision: importSchemaForTenant merges (skips existing tables/fields).
  const schema = loadSchema();
  const result = await provisionSchema(baseUrl, apiKey, schema);
  if (result.tablesCreated > 0) {
    console.log("[aurora] Schema provisioned on first run:", result.message);
  }
}

export async function tenantHasTables(baseUrl: string, apiKey: string): Promise<boolean> {
  const res = await fetch(`${baseUrl}/v1/tables`, { headers: { "X-Api-Key": apiKey } });
  if (!res.ok) return false;
  const tables = (await res.json()) as Array<{ slug?: string }>;
  return Array.isArray(tables) && tables.length > 0;
}

export function loadSchema(): SchemaShape {
  const fs = require("fs") as typeof import("node:fs");
  const path = require("path") as typeof import("node:path");
  const schemaPath = path.join(process.cwd(), "init", "schema.json");
  return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}

export async function provisionSchema(
  baseUrl: string,
  apiKey: string,
  schema: SchemaShape
): Promise<{ tablesCreated: number; message?: string }> {
  const res = await fetch(`${baseUrl}/v1/provision-schema`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({ schema, base: AURORA_BASE }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
  return res.json();
}
