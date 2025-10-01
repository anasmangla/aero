import { Router } from "express";
const r = Router();
r.get("/", async (_req, res) => res.json({ vehiclesDue: 0, driversDue: 0 }));
export default r;
