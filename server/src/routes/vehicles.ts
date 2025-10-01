import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  listVehicles,
  vehicleStatsFlexible,
  bulkVehicleStats,
  currentAssignmentsByVehicle,
} from "../lib/samsara";

const r = Router();
const prisma = new PrismaClient();

// Simple sanity route
r.get("/test", (_req, res) => res.json([{ id: "veh-1", name: "Test Vehicle" }]));

/** Basic tile shape for the left sidebar */
type TileBase = { id: string; name: string; plate: string | null };

/**
 * GET /api/vehicles/summary
 * Tiles data for the left sidebar: name, status dot, current driver, odometer, reg due.
 * (Intentionally declared BEFORE any `/:id/...` routes)
 */
r.get("/summary", async (_req, res) => {
  try {
    // 1) Base vehicles from Samsara
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

    // 2) Stats in bulk (status + odometer)
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
    } catch {
      statsById = {};
    }

    // 3) Current driver names (best-effort)
    let driverByVehicle: Record<string, string> = {};
    try {
      driverByVehicle = await currentAssignmentsByVehicle(ids);
    } catch {
      driverByVehicle = {};
    }

    // 4) Registration due (from DB rule type="registration")
    const regs = await prisma.vehicleMaintenanceRule.findMany({
      where: { type: "registration", vehicleId: { in: ids } },
      select: { vehicleId: true, dueDate: true },
    });
    const regMap: Record<string, string | null> = Object.fromEntries(
      regs.map(r => [r.vehicleId, r.dueDate?.toISOString() ?? null]),
    );

    // 5) Merge tiles
    const tiles = base.map((v: TileBase) => {
      const s = statsById[v.id] || {};
      // Normalize engine state → status
      let status: "moving" | "on" | "idle" | "off" | "unknown" = "unknown";
      const st = s?.engineStates?.[0]?.value ?? s?.engineState ?? s?.engine?.state;
      if (["Moving", "moving"].includes(st)) status = "moving";
      else if (["On", "on"].includes(st)) status = "on";
      else if (["Idle", "idle"].includes(st)) status = "idle";
      else if (["Off", "off"].includes(st)) status = "off";

      // Odometer in meters if present
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

/** GET /api/vehicles
 * Basic list (used in other places)
 */
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

/** GET /api/vehicles/:id/stats
 * Resilient stats: always 200; returns { source, stats, error? }
 */
r.get("/:id/stats", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await vehicleStatsFlexible(id);
    if (result.ok) return res.json({ source: result.path, stats: result.data });
    console.warn("stats fallback", result.error);
    return res.json({ source: "fallback", stats: null, error: result.error });
  } catch (e: any) {
    console.error("stats error:", e);
    return res.json({ source: "catch", stats: null, error: e.message || "Stats unavailable" });
  }
});

/** GET /api/vehicles/:id/maintenance-rules */
r.get("/:id/maintenance-rules", async (req, res) => {
  try {
    const rules = await prisma.vehicleMaintenanceRule.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { type: "asc" },
    });
    res.json(rules);
  } catch (e: any) {
    console.error("rules get error:", e);
    res.json([]); // return empty if DB unhappy
  }
});

/** POST /api/vehicles/:id/maintenance-rules */
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
    // If you see a foreign key error here, seed a Vehicle row (id = Samsara id) or relax FK.
    console.error("rules create error:", e);
    res.status(200).json({ error: e.message || "Could not create rule" });
  }
});

export default r;
