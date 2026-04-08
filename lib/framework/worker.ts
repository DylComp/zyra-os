import Anthropic from "@anthropic-ai/sdk";
import type { MicroTask, WorkerResult } from "@/types";
import { createContextWindow, addToContext, getMessages } from "./context";
import { withRetry, withTimeout } from "./recovery";

const WORKER_SYSTEM = `You are a code-writing agent for ZyraOS. You implement one micro-task at a time.

Rules:
- Write complete, working code — no placeholders or TODOs
- Output your response in this format:
  1. Brief explanation of what you're implementing (1-2 sentences)
  2. Code blocks with filename comments: // filename: path/to/file.ts
  3. Each code block is a complete file

Be precise and concise. Write production-quality TypeScript.`;

export async function executeTask(
  client: Anthropic,
  task: MicroTask,
  model: string,
  agentName: string,
  previousContext?: string
): Promise<WorkerResult> {
  const ctx = createContextWindow(agentName, model);

  const prompt = previousContext
    ? `Previous context:\n${previousContext}\n\nNow implement this task:\nTask: ${task.title}\nDescription: ${task.description}`
    : `Implement this task:\nTask: ${task.title}\nDescription: ${task.description}`;

  const ctxWithPrompt = addToContext(ctx, "user", prompt);
  const messages = getMessages(ctxWithPrompt);

  const result = await withRetry(
    async (m) => {
      return withTimeout(
        client.messages.create({
          model: m,
          max_tokens: 4096,
          system: WORKER_SYSTEM,
          messages,
        }),
        120000
      );
    },
    model
  );

  const text = result.content[0].type === "text" ? result.content[0].text : "";

  const filePattern = /\/\/ filename: (.+)\n/g;
  const filesCreated: string[] = [];
  let match;
  while ((match = filePattern.exec(text)) !== null) {
    filesCreated.push(match[1].trim());
  }

  return {
    taskId: task.id,
    success: true,
    output: text,
    filesCreated,
  };
}
