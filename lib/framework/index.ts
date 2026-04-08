import Anthropic from "@anthropic-ai/sdk";
import type { TaskPlan, MicroTask, WorkerResult } from "@/types";
import { decompose } from "./planner";
import { routeTask } from "./router";
import { executeTask } from "./worker";

export interface PlanProjectOptions {
  prompt: string;
  apiKey: string;
  onTaskStart?: (task: MicroTask, agent: string, model: string) => void;
  onTaskComplete?: (task: MicroTask, result: WorkerResult) => void;
  onMessage?: (agent: string, content: string) => void;
}

export async function planProject(
  options: PlanProjectOptions
): Promise<{ plan: TaskPlan; results: WorkerResult[] }> {
  const client = new Anthropic({ apiKey: options.apiKey });

  options.onMessage?.("Yami", `Decomposing prompt: "${options.prompt}"`);
  const plan = await decompose(client, options.prompt);
  options.onMessage?.("Yami", `Created ${plan.tasks.length} micro-tasks with dependency graph`);

  for (const task of plan.tasks) {
    routeTask(task);
  }

  const results: WorkerResult[] = [];
  const completed = new Set<string>();
  let contextSummary = "";

  while (completed.size < plan.tasks.length) {
    const ready = plan.tasks.filter(
      (t) => t.status === "pending" && t.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0 && completed.size < plan.tasks.length) {
      throw new Error("Deadlock: no tasks ready but not all complete");
    }

    for (const task of ready) {
      task.status = "in_progress";
      const agent = task.assignedAgent || "Rei";
      const model = task.assignedModel || "claude-sonnet-4-6-20250514";

      options.onTaskStart?.(task, agent, model);
      options.onMessage?.(agent, `Starting task: ${task.title}`);

      try {
        const result = await executeTask(client, task, model, agent, contextSummary);
        task.status = "completed";
        completed.add(task.id);
        results.push(result);
        contextSummary += `\nCompleted: ${task.title}\n${result.output.slice(0, 500)}\n`;
        options.onTaskComplete?.(task, result);
        options.onMessage?.(agent, `Completed: ${task.title}${result.filesCreated?.length ? ` (files: ${result.filesCreated.join(", ")})` : ""}`);
      } catch (error) {
        task.status = "failed";
        const errMsg = error instanceof Error ? error.message : String(error);
        results.push({ taskId: task.id, success: false, output: "", error: errMsg });
        options.onMessage?.(agent, `Failed: ${task.title} — ${errMsg}`);
        completed.add(task.id);
      }
    }
  }

  return { plan, results };
}

export { decompose } from "./planner";
export { routeTask, getAgents } from "./router";
export { executeTask } from "./worker";
