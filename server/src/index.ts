import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runAgent, RunRequestSchema } from "./agent.js";
import { getRun, listRuns } from "./store.js";
import { shutdownTelemetry, startTelemetry } from "./telemetry.js";

startTelemetry();

const app = express();
const port = Number(process.env.PORT || 8080);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, "../web");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GOOGLE_API_KEY),
    telemetryConfigured: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  });
});

app.post("/api/run", async (req, res) => {
  const parsed = RunRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const run = await runAgent(parsed.data);
  res.status(run.status === "error" ? 500 : 200).json(run);
});

app.get("/api/runs", (_req, res) => {
  res.json(listRuns());
});

app.get("/api/runs/:id", (req, res) => {
  const run = getRun(req.params.id);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json(run);
});

app.use(express.static(webDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(webDist, "index.html"));
});

const server = app.listen(port, () => {
  console.log(`TraceCoach Agent listening on http://localhost:${port}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await shutdownTelemetry();
});
