export type AgentSpan = {
  id: string;
  name: string;
  status: "ok" | "error";
  startedAt: string;
  durationMs: number;
  attributes: Record<string, string | number | boolean>;
  output: string;
};

export type Evaluation = {
  label: string;
  score: number;
  rationale: string;
};

export type AgentRun = {
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

const runs = new Map<string, AgentRun>();

export function saveRun(run: AgentRun) {
  runs.set(run.id, run);
}

export function getRun(id: string) {
  return runs.get(id);
}

export function listRuns() {
  return Array.from(runs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
