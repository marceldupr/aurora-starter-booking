import { runFirstRunProvision } from "./provision";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    await runFirstRunProvision();
  } catch (err) {
    console.warn("[aurora] First-run provision skipped:", err instanceof Error ? err.message : err);
  }
}
