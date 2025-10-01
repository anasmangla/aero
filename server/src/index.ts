import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import vehicles from "./routes/vehicles";
import drivers from "./routes/drivers";
import docs from "./routes/docs";
import alerts from "./routes/alerts";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Health checks
app.get("/", (_req, res) => res.send("Aero API is running"));
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Mount routers — these MUST succeed or you'll see a compile error
app.use("/api/vehicles", vehicles);
app.use("/api/drivers", drivers);
app.use("/api/docs", docs);
app.use("/api/alerts", alerts);

// 404 fallback so you can see misses
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
