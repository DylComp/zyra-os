import Anthropic from "@anthropic-ai/sdk";
import type { MicroTask, TaskPlan } from "@/types";

const PLANNER_SYSTEM = `You are Yami, the task planner for ZyraOS. You decompose prompts into 15-40 micro-tasks with dependency graphs.

Output ONLY valid JSON — no markdown, no explanation. Format:
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Short task title",
      "description": "What this task accomplishes",
      "dependencies": []
    }
  ]
}

Rules:
- Each task must be a single, concrete action
- Dependencies reference other task IDs
- Order tasks so dependencies come first
- Cover: architecture, core logic, data structures, networking, testing, integration
- Be specific — "Implement SHA-256 hashing for block headers" not "Add hashing"`;

export async function decompose(
  client: Anthropic,
  prompt: string
): Promise<TaskPlan> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: PLANNER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Decompose this into micro-tasks:\n\n${prompt}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: { tasks: Array<{ id: string; title: string; description: string; dependencies: string[] }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try extracting from markdown fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      parsed = JSON.parse(fenceMatch[1]);
    } else {
      // Try extracting the first JSON object from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse planner output as JSON");
      }
    }
  }

  const tasks: MicroTask[] = parsed.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dependencies: t.dependencies || [],
    complexity: "medium",
    status: "pending",
  }));

  return {
    prompt,
    tasks,
    createdAt: new Date().toISOString(),
  };
}
