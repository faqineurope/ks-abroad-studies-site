import path from "path";

/**
 * Writable runtime store (students, applications, uploads).
 * On Vercel the deploy filesystem is read-only — use /tmp.
 * Note: /tmp is per-instance and ephemeral; use a DB for durable portal data.
 */
export function runtimeDataDir() {
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return path.join("/tmp", "ks-abroad-data");
  }
  return path.join(process.cwd(), "data");
}
