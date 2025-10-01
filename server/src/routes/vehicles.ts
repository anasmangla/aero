import { Router } from "express";
import { listVehicles, vehicleStats } from "../lib/samsara";

const r = Router();

// Sanity test route: confirms router is mounted
r.get("/test", (_req, res) => {
  res.json([{ id: "veh-1", name: "Test Vehicle" }]);
});

r.get("/", async (_req, res) => {
  try {
    const data: any = await listVehicles();

    // Samsara often returns { data: [...] }. If not, try the root.
    const raw = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!Array.isArray(raw)) {
      return res.json([]); // graceful fallback
    }

    const vehicles = raw.map((v: any) => ({
      id: v.id ?? v.vehicleId ?? v.externalIds?.vin ?? "unknown",
      name: v.name ?? v.label ?? v.vehicleName ?? "Unnamed",
      vin: v.vin ?? v.externalIds?.vin ?? null,
      plate: v.licensePlate ?? v.licensePlateNumber ?? null,
    }));

    res.json(vehicles);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to list vehicles" });
  }
});

r.get("/:id/stats", async (req, res) => {
  try {
    const id = req.params.id;
    const stats: any = await vehicleStats([id]);
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to get stats" });
  }
});

export default r;
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/** List rules for a vehicle */
r.get("/:id/maintenance-rules", async (req, res) => {
  try {
    const rules = await prisma.vehicleMaintenanceRule.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { type: "asc" }
    });
    res.json(rules);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/** Create a rule for a vehicle */
r.post("/:id/maintenance-rules", async (req, res) => {
  const vehicleId = req.params.id;
  const { type, dueDate, dueMiles, dueHours, thresholdDays, thresholdMiles, thresholdHours } = req.body || {};
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
        thresholdHours: thresholdHours ?? null
      }
    });
    res.json(created);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

