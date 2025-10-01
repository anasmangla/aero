import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { listVehicles, vehicleStats } from "../lib/samsara";
const prisma = new PrismaClient();
const r = Router();

r.get("/", async (_req, res) => {
  const samsara = await listVehicles();
  res.json(samsara);
});

r.get("/:id/stats", async (req, res) => {
  const { id } = req.params;
  const stats = await vehicleStats([id]);
  res.json(stats);
});

export default r;
