import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// ---- QUICK TEST ROUTES ----
app.get("/", (_req, res) => {
  res.send("Aero API is running");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---- REAL ROUTES (comment out temporarily if they crash) ----
try {
  // If these files don't exist yet, comment these 4 lines temporarily
  // and the server will still start and show the health routes.
  // import here to catch missing-file errors clearly:
  const vehicles = require("./routes/vehicles").default;
  const drivers = require("./routes/drivers").default;
  const docs = require("./routes/docs").default;
  const alerts = require("./routes/alerts").default;

  app.use("/api/vehicles", vehicles);
  app.use("/api/drivers", drivers);
  app.use("/api/docs", docs);
  app.use("/api/alerts", alerts);
} catch (e) {
  console.warn("Routes not loaded:", (e as Error).message);
}

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
