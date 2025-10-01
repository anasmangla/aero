import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  listVehicles,
  bulkVehicleStats,
  currentAssignmentsByVehicle,
} from "../lib/samsara";

const r = Router();
const prisma = new PrismaClient();
r.get("/__ping", (_req, res) => res.json({ ok: true, from: "vehicles.ts you just edited" }));

// Sanity
r.get("/test", (_req, res) => res.json([{ id: "veh-1", name: "Test Vehicle" }]));

// ---- SUMMARY FIRST (for left tiles) ----
type TileBase = { id: string; name: string; plate: string | null };

r.get("/summary", async (_req, res) => {
  try {
    // 1) base vehicles
    const data: any = await listVehicles();
    const raw: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    const base: TileBase[] = (raw || [])
      .map((v: any): TileBase => ({
        id: String(v.id ?? v.vehicleId ?? v.externalIds?.vin ?? ""),
        name: v.name ?? v.label ?? v.vehicleName ?? "Unnamed",
        plate: v.licensePlate ?? v.licensePlateNumber ?? null,
      }))
      .filter((v: TileBase) => !!v.id);

    const ids: string[] = base.map((v: TileBase) => v.id);

    // 2) stats (odometer + engine state) — best effort
    const TYPES = (process.env.SAMSARA_STATS_TYPES ??
      "obdOdometerMeters,engineHourMeters,fuelPercents,engineStates")
      .split(",").map(s => s.trim()).filter(Boolean);

    let statsById: Record<string, any> = {};
    try {
      const sres: any = await bulkVehicleStats(ids, TYPES);
      const sItems: any[] = Array.isArray(sres?.data) ? sres.data : [];
      for (const item of sItems) {
        const vid = String(item?.vehicle?.id ?? item?.vehicleId ?? "");
        if (vid) statsById[vid] = item;
      }
    } catch { statsById = {}; }

    // 3) current driver (best effort)
    let driverByVehicle: Record<string, string> = {};
    try { driverByVehicle = await currentAssignmentsByVehicle(ids); }
    catch { driverByVehicle = {}; }

    // 4) registration due date (DB rule type="registration")
    const regs = await prisma.vehicleMaintenanceRule.findMany({
      where: { type: "registration", vehicleId: { in: ids } },
      select: { vehicleId: true, dueDate: true },
    });
    const regMap: Record<string, string | null> = Object.fromEntries(
      regs.map(r => [r.vehicleId, r.dueDate?.toISOString() ?? null]),
    );

    // 5) merge
    const tiles = base.map((v: TileBase) => {
      const s = statsById[v.id] || {};
      let status: "moving" | "on" | "idle" | "off" | "unknown" = "unknown";
      const st = s?.engineStates?.[0]?.value ?? s?.engineState ?? s?.engine?.state;
      if (["Moving", "moving"].includes(st)) status = "moving";
      else if (["On", "on"].includes(st)) status = "on";
      else if (["Idle", "idle"].includes(st)) status = "idle";
      else if (["Off", "off"].includes(st)) status = "off";

      const odometer: number | undefined =
        s?.obdOdometerMeters?.[0]?.value ??
        s?.odometerMeters?.[0]?.value ??
        undefined;

      return {
        id: v.id,
        name: v.name,
        plate: v.plate,
        driverName: driverByVehicle[v.id],
        status,
        odometer,
        regDue: regMap[v.id] ?? null,
      };
    });

    res.json(tiles);
  } catch (e: any) {
    console.error("summary error:", e);
    res.json([]); // keep UI alive
  }
});

// ---- BASIC LIST ----
r.get("/", async (_req, res) => {
  try {
    const data: any = await listVehicles();
    const raw: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    const vehicles = Array.isArray(raw)
      ? raw.map((v: any) => ({
          id: v.id ?? v.vehicleId ?? v.externalIds?.vin ?? "unknown",
          name: v.name ?? v.label ?? v.vehicleName ?? "Unnamed",
          vin: v.vin ?? v.externalIds?.vin ?? null,
          plate: v.licensePlate ?? v.licensePlateNumber ?? null,
        }))
      : [];
    res.json(vehicles);
  } catch (e: any) {
    console.error("vehicles list error:", e);
    res.json([]); // don’t 500; return empty list
  }
});

// ---- STATS (SELF-CONTAINED; includes &types=) ----
r.get("/:id/stats", async (req, res) => {
  const id = req.params.id;

  // Build the 'types' here so we don't depend on lib mismatches
  const TYPES = (process.env.SAMSARA_STATS_TYPES ??
    "obdOdometerMeters,engineHourMeters,fuelPercents,engineStates")
    .split(",").map(s => s.trim()).filter(Boolean);

  const t = encodeURIComponent(TYPES.join(","));

  // Minimal internal fetch to avoid helper drift
  async function sFetch(path: string) {
    const resp = await fetch(`https://api.samsara.com${path}`, {
      headers: {
        "Authorization": `Bearer ${process.env.SAMSARA_API_TOKEN}`,
        "Content-Type": "application/json",
      }
    } as any);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Samsara ${resp.status}: ${text}`);
    }
    return resp.json();
  }

  try {
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
        return res.json({ source: p, stats: data });
      } catch (e: any) {
        lastErr = String(e?.message || e);
      }
    }
    return res.json({ source: "fallback", stats: null, error: lastErr });
  } catch (e: any) {
    return res.json({ source: "catch", stats: null, error: e.message || "Stats unavailable" });
  }
});

// ---- MAINTENANCE RULES ----
r.get("/:id/maintenance-rules", async (req, res) => {
  try {
    const rules = await prisma.vehicleMaintenanceRule.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { type: "asc" },
    });
    res.json(rules);
  } catch (e: any) {
    console.error("rules get error:", e);
    res.json([]); // keep UI alive
  }
});

r.post("/:id/maintenance-rules", async (req, res) => {
  const vehicleId = req.params.id;
  const {
    type,
    dueDate,
    dueMiles,
    dueHours,
    thresholdDays,
    thresholdMiles,
    thresholdHours,
  } = req.body || {};
  if (!type) return res.status(400).json({ error: "type is required" });

  try {
    const created = await prisma.vehicleMaintenanceRule.create({
      data: {
        vehicleId,
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueMiles: dueMiles ?? null,
        dueHours: dueHours ?? null,
        thresholdDays: thresholdDays ?? null,
        thresholdMiles: thresholdMiles ?? null,
        thresholdHours: thresholdHours ?? null,
      },
    });
    res.json(created);
  } catch (e: any) {
    res.status(200).json({ error: e.message || "Could not create rule" });
  }
});

export default r;
