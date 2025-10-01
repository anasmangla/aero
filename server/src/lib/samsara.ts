import fetch from "node-fetch";
const BASE = "https://api.samsara.com";
const TOKEN = process.env.SAMSARA_API_TOKEN!;
if (!TOKEN) throw new Error("Missing SAMSARA_API_TOKEN");

// Allow override from .env; otherwise, use a practical default set.
// If your org doesn't support one of these, Samsara will usually ignore it.
const TYPES = (process.env.SAMSARA_STATS_TYPES ??
  "obdOdometerMeters,engineHourMeters,fuelPercents,engineStates"
).split(",").map(s => s.trim()).filter(Boolean);

async function sFetch(path: string, init: any = {}): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${path} -> ${text}`);
  }
  return res.json();
}

export const listVehicles = (): Promise<any> => sFetch("/fleet/vehicles");

// Try multiple shapes; return the first that works
export async function vehicleStatsFlexible(id: string): Promise<{ok: boolean; path?: string; data?: any; error?: string;}> {
  const t = encodeURIComponent(TYPES.join(","));
  const tries = [
    `/fleet/vehicles/stats?ids=${id}&types=${t}`,
    `/fleet/vehicles/stats?vehicleIds=${id}&types=${t}`,
    // Fallbacks
    `/fleet/vehicles/${id}`,                 // vehicle detail (might carry some data)
    `/fleet/vehicles/locations?ids=${id}`,   // last known location
  ];
  let lastErr = "";
  for (const p of tries) {
    try {
      const data = await sFetch(p);
      return { ok: true, path: p, data };
    } catch (e: any) {
      lastErr = String(e?.message || e);
    }
  }
  return { ok: false, error: lastErr };
}
export async function bulkVehicleStats(ids: string[], types: string[]): Promise<any> {
  if (!ids.length) return { data: [] };
  const t = encodeURIComponent(types.join(","));
  // Try ids=... (some orgs expect vehicleIds=...)
  try {
    return await sFetch(`/fleet/vehicles/stats?ids=${ids.join(",")}&types=${t}`);
  } catch {
    return await sFetch(`/fleet/vehicles/stats?vehicleIds=${ids.join(",")}&types=${t}`);
  }
}

/** Get current driver assignments in a time window (last ~6 hours) */
export async function currentAssignmentsByVehicle(ids: string[]): Promise<Record<string, string>> {
  const since = new Date(Date.now() - 6 * 3600_000).toISOString();
  // If your org has a better "current" endpoint, swap it here.
  const map: Record<string, string> = {};
  for (const vid of ids) {
    try {
      const res = await sFetch(`/fleet/driver-vehicle-assignments?vehicleIds=${vid}&startTime=${since}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      const last = list[list.length - 1];
      if (last?.driver?.name) map[vid] = last.driver.name;
    } catch { /* ignore */ }
  }
  return map;
}
