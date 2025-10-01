import fetch from "node-fetch";
const BASE = "https://api.samsara.com";
const TOKEN = process.env.SAMSARA_API_TOKEN!;
if (!TOKEN) throw new Error("Missing SAMSARA_API_TOKEN");

// You can override via .env if your org needs different names
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
    throw new Error(`Samsara ${res.status}: ${text}`);
  }
  return res.json();
}

export const listVehicles = (): Promise<any> => sFetch("/fleet/vehicles");

export async function bulkVehicleStats(ids: string[], types: string[]): Promise<any> {
  if (!ids.length) return { data: [] };
  const t = encodeURIComponent(types.join(","));
  try {
    return await sFetch(`/fleet/vehicles/stats?ids=${ids.join(",")}&types=${t}`);
  } catch {
    return await sFetch(`/fleet/vehicles/stats?vehicleIds=${ids.join(",")}&types=${t}`);
  }
}

export async function currentAssignmentsByVehicle(ids: string[]): Promise<Record<string, string>> {
  const since = new Date(Date.now() - 6 * 3600_000).toISOString();
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

export async function vehicleStatsFlexible(id: string): Promise<{ok: boolean; path?: string; data?: any; error?: string;}> {
  const t = encodeURIComponent(TYPES.join(","));
  const tries = [
    `/fleet/vehicles/stats?ids=${id}&types=${t}`,
    `/fleet/vehicles/stats?vehicleIds=${id}&types=${t}`,
    `/fleet/vehicles/${id}`,
    `/fleet/vehicles/locations?ids=${id}`,
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
