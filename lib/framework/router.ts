import type { MicroTask } from "@/types";

interface RouteResult {
  model: string;
  agent: string;
  reasoning: string;
}

const AGENTS = [
  { name: "Yami", role: "planner", models: ["claude-opus-4-6"] },
  { name: "Akira", role: "architect", models: ["claude-opus-4-6", "claude-sonnet-4-6"] },
  { name: "Rei", role: "builder", models: ["claude-sonnet-4-6", "claude-haiku-4-5"] },
  { name: "Kira", role: "tester", models: ["claude-sonnet-4-6", "claude-haiku-4-5"] },
];

const COMPLEXITY_MODELS: Record<string, string> = {
  critical: "claude-opus-4-6",
  high: "claude-sonnet-4-6",
  medium: "claude-sonnet-4-6",
  low: "claude-haiku-4-5",
};

function scoreComplexity(task: MicroTask): MicroTask["complexity"] {
  const text = `${task.title} ${task.description}`.toLowerCase();
  const criticalPatterns = ["architect", "design", "plan", "decompos", "system"];
  const highPatterns = ["implement", "build", "create", "core", "consensus", "crypto"];
  const mediumPatterns = ["test", "validate", "debug", "fix", "refactor"];

  if (criticalPatterns.some((p) => text.includes(p))) return "critical";
  if (highPatterns.some((p) => text.includes(p))) return "high";
  if (mediumPatterns.some((p) => text.includes(p))) return "medium";
  return "low";
}

function assignAgent(task: MicroTask): typeof AGENTS[number] {
  const text = `${task.title} ${task.description}`.toLowerCase();
  if (text.includes("plan") || text.includes("decompos") || text.includes("break down")) return AGENTS[0];
  if (text.includes("architect") || text.includes("design") || text.includes("structure")) return AGENTS[1];
  if (text.includes("test") || text.includes("valid") || text.includes("debug")) return AGENTS[3];
  return AGENTS[2];
}

export function routeTask(task: MicroTask): RouteResult {
  const complexity = scoreComplexity(task);
  task.complexity = complexity;
  const agent = assignAgent(task);
  const model = COMPLEXITY_MODELS[complexity];
  task.assignedModel = model;
  task.assignedAgent = agent.name;
  return {
    model,
    agent: agent.name,
    reasoning: `Task "${task.title}" scored as ${complexity} complexity, assigned to ${agent.name} (${agent.role}) using ${model}`,
  };
}

export function getAgents() {
  return AGENTS;
}
