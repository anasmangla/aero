import fetch from "node-fetch";
const BASE = "https://api.samsara.com";
const TOKEN = process.env.SAMSARA_API_TOKEN!;
if (!TOKEN) throw new Error("Missing SAMSARA_API_TOKEN");

async function sFetch(path: string, init: any = {}) {
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

export const listVehicles = () => sFetch("/fleet/vehicles"); // v2
export const vehicleStats = (ids: string[]) =>
  sFetch(`/fleet/vehicles/stats?ids=${ids.join(",")}`);
