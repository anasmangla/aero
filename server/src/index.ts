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

app.use("/api/vehicles", vehicles);
app.use("/api/drivers", drivers);
app.use("/api/docs", docs);
app.use("/api/alerts", alerts);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
