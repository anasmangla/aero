import { Router } from "express";
import { listVehicles, vehicleStatsFlexible } from "../lib/samsara";

const r = Router();

r.get("/test", (_req, res) => {
  res.json([{ id: "veh-1", name: "Test Vehicle" }]);
});

r.get("/", async (_req, res) => {
  try {
    const data: any = await listVehicles();
    const raw = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!Array.isArray(raw)) return res.json([]);

    const vehicles = raw.map((v: any) => ({
      id:        v.id ?? v.vehicleId ?? v.externalIds?.vin ?? "unknown",
      name:      v.name ?? v.label ?? v.vehicleName ?? "Unnamed",
      vin:       v.vin ?? v.externalIds?.vin ?? null,
      plate:     v.licensePlate ?? v.licensePlateNumber ?? null,
    }));

    res.json(vehicles);
  } catch (e: any) {
    console.error("vehicles list error:", e);
    res.status(500).json({ error: e.message || "Failed to list vehicles" });
  }
});

r.get("/:id/stats", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await vehicleStatsFlexible(id);
    if (result.ok) {
      return res.json({ source: result.path, stats: result.data });
    }
    // Fallback: don't 500; return a friendly payload so UI can render
    console.warn("vehicle stats fallback:", result.error);
    return res.status(200).json({ source: "fallback", stats: null, error: result.error });
  } catch (e: any) {
    console.error("vehicle stats error:", e);
    // Still return 200 with a null stats payload so the UI isn't broken
    res.status(200).json({ source: "catch", stats: null, error: e.message || "Stats unavailable" });
  }
});

export default r;
