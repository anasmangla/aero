import { Router } from "express";

const r = Router();

// Minimal placeholder route so the module compiles
r.get("/", (_req, res) => {
  res.json([{ id: "drv-1", name: "Test Driver" }]);
});

export default r;
