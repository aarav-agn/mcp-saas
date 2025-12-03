import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestLogger } from "./config/logger";
import { initTelemetry } from "./config/telemetry";

import mainRouter from "./routes";

initTelemetry();

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(requestLogger);

// health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// API routes
app.use("/api", mainRouter);

export default app;
