import fetch from "node-fetch";
const BASE = "https://api.samsara.com";
const TOKEN = process.env.SAMSARA_API_TOKEN!;
if (!TOKEN) throw new Error("Missing SAMSARA_API_TOKEN");

async function sFetch(path: string, init: any = {}): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  // Try to include the API's error body in the thrown message
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${path} -> ${text}`);
  }
  return res.json();
}

export const listVehicles = (): Promise<any> => sFetch("/fleet/vehicles");

// Try several shapes in order; return first success
export async function vehicleStatsFlexible(id: string): Promise<any> {
  const tries = [
    `/fleet/vehicles/stats?ids=${id}`,
    `/fleet/vehicles/stats?vehicleIds=${id}`,
    // fallbacks that sometimes exist (shape differs)
    `/fleet/vehicles/${id}`,                    // single vehicle detail
    `/fleet/vehicles/locations?ids=${id}`,      // last known location
  ];
  let lastErr: any = null;
  for (const p of tries) {
    try {
      const data = await sFetch(p);
      return { ok: true, path: p, data };
    } catch (e: any) {
      lastErr = e;
      // continue
    }
  }
  return { ok: false, error: String(lastErr) };
}
