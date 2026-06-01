import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Gauge,
  Play,
  RefreshCcw,
  Sparkles,
  Waypoints
} from "lucide-react";
import "./styles.css";

type AgentSpan = {
  id: string;
  name: string;
  status: "ok" | "error";
  startedAt: string;
  durationMs: number;
  attributes: Record<string, string | number | boolean>;
  output: string;
};

type Evaluation = {
  label: string;
  score: number;
  rationale: string;
};

type AgentRun = {
  id: string;
  goal: string;
  mode: "demo" | "live";
  status: "running" | "complete" | "error";
  createdAt: string;
  summary: string;
  plan: string[];
  finalAnswer: string;
  selfImprovement: string;
  spans: AgentSpan[];
  evaluations: Evaluation[];
};

const sampleGoal =
  "A production support agent gave a vague incident answer. Diagnose the missing evidence, produce a safer action plan, and improve the next run using trace evaluations.";

function scoreColor(score: number) {
  if (score >= 0.9) return "var(--green)";
  if (score >= 0.8) return "var(--blue)";
  return "var(--amber)";
}

function App() {
  const [goal, setGoal] = useState(sampleGoal);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [run, setRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<{ geminiConfigured: boolean; telemetryConfigured: boolean } | null>(null);
  const isRecording = new URLSearchParams(window.location.search).get("recording") === "1";

  const avgScore = useMemo(() => {
    if (!run?.evaluations.length) return 0;
    return run.evaluations.reduce((sum, item) => sum + item.score, 0) / run.evaluations.length;
  }, [run]);

  async function startRun(nextGoal = goal, nextMode = mode) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: nextGoal, mode: nextMode })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ? JSON.stringify(payload.error) : "Run failed");
      }
      setRun(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoplay = params.get("autoplay");
    if (autoplay !== "live" && autoplay !== "demo") return;

    const nextMode = autoplay;
    setMode(nextMode);
    const timer = window.setTimeout(() => {
      void startRun(sampleGoal, nextMode);
    }, isRecording ? 1800 : 500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="app-shell">
      {isRecording && (
        <div className="recording-banner">
          <strong>TraceCoach live demo</strong>
          <span>Gemini: {health?.geminiConfigured ? "connected" : "checking"}</span>
          <span>Phoenix OTLP: {health?.telemetryConfigured ? "exporting traces" : "checking"}</span>
          <span>{run ? "Self-improvement memo generated" : loading ? "Running observed loop" : "Starting"}</span>
        </div>
      )}
      <section className="workspace">
        <aside className="control-panel">
          <div className="brand">
            <div className="brand-mark">
              <Waypoints size={24} />
            </div>
            <div>
              <p>Rapid Agent Builder Hackathon</p>
              <h1>TraceCoach Agent</h1>
            </div>
          </div>

          <div className="pitch">
            <h2>Agents should learn from their own traces.</h2>
            <p>
              TraceCoach uses Gemini to act, Arize Phoenix traces to evaluate behavior, and a
              self-improvement loop that turns failed spans into the next prompt experiment.
            </p>
          </div>

          <label className="field">
            <span>Mission</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={7} />
          </label>

          <div className="mode-row">
            <button className={mode === "demo" ? "selected" : ""} onClick={() => setMode("demo")}>
              Demo
            </button>
            <button className={mode === "live" ? "selected" : ""} onClick={() => setMode("live")}>
              Gemini live
            </button>
          </div>

          <button className="run-button" onClick={() => void startRun()} disabled={loading}>
            {loading ? <RefreshCcw className="spin" size={18} /> : <Play size={18} />}
            {loading ? "Running observed loop" : "Run observed loop"}
          </button>

          {error && <p className="error">{error}</p>}
        </aside>

        <section className="results">
          <div className="topbar">
            <div>
              <p className="eyebrow">Observe → Evaluate → Improve</p>
              <h2>Judge-ready agent trace</h2>
            </div>
            <div className="status-pill">
              <Activity size={16} />
              {run ? run.status : "ready"}
            </div>
          </div>

          {!run ? (
            <EmptyState onStart={() => void startRun()} />
          ) : (
            <div className="result-grid">
              <section className="panel wide">
                <div className="panel-title">
                  <Brain size={18} />
                  <h3>Agent plan</h3>
                </div>
                <ol className="plan-list">
                  {run.plan.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="panel score-panel">
                <div className="panel-title">
                  <Gauge size={18} />
                  <h3>Eval score</h3>
                </div>
                <div className="score-ring" style={{ borderColor: scoreColor(avgScore) }}>
                  {(avgScore * 100).toFixed(0)}
                </div>
                <p>Average Phoenix-style evaluation score after trace review.</p>
              </section>

              <section className="panel wide">
                <div className="panel-title">
                  <CheckCircle2 size={18} />
                  <h3>Controlled answer</h3>
                </div>
                <pre>{run.finalAnswer}</pre>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <BadgeCheck size={18} />
                  <h3>Evaluations</h3>
                </div>
                <div className="eval-list">
                  {run.evaluations.map((item) => (
                    <div className="eval-item" key={item.label}>
                      <div>
                        <strong>{item.label}</strong>
                        <p>{item.rationale}</p>
                      </div>
                      <span style={{ color: scoreColor(item.score) }}>{(item.score * 100).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <Sparkles size={18} />
                  <h3>Self-improvement memo</h3>
                </div>
                <pre>{run.selfImprovement}</pre>
              </section>

              <section className="panel wide">
                <div className="panel-title">
                  <Activity size={18} />
                  <h3>Trace spans</h3>
                </div>
                <div className="span-timeline">
                  {run.spans.map((span) => (
                    <article key={span.id} className="span-row">
                      <div>
                        <strong>{span.name}</strong>
                        <span>{span.durationMs} ms</span>
                      </div>
                      <p>{span.output}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="empty-state">
      <Sparkles size={32} />
      <h3>Ready to run the demo loop</h3>
      <p>
        Start with the sample mission to show the complete Arize/Phoenix story without needing a
        live key, then switch to Gemini live for the submitted build.
      </p>
      <button onClick={onStart}>
        <Play size={18} />
        Start sample run
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
