import Anthropic from "@anthropic-ai/sdk";
import { planProject } from "./framework";
import {
  getState,
  setState,
  addMessage,
  addFile,
  addCommit,
} from "./store";
import type { AgentMessage, FileNode, Commit, MicroTask, WorkerResult } from "@/types";

let running = false;
let messageCounter = 0;
let turnCounter = 0;

function generateId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

function generateSha(): string {
  return Math.random().toString(16).slice(2, 9);
}

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
  };
  return map[ext] || "text";
}

function extractFiles(output: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  const regex = /\/\/ filename: (.+)\n([\s\S]*?)(?=\/\/ filename:|$)/g;
  let match;

  while ((match = regex.exec(output)) !== null) {
    files.push({
      path: match[1].trim(),
      content: match[2].trim(),
    });
  }

  if (files.length === 0) {
    const blockRegex = /```\w*\s*\n?\/\/ (.+?)\n([\s\S]*?)```/g;
    while ((match = blockRegex.exec(output)) !== null) {
      files.push({
        path: match[1].trim(),
        content: match[2].trim(),
      });
    }
  }

  return files;
}

export async function startOrchestration(prompt: string) {
  if (running) return;
  running = true;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    setState({ status: "error" });
    addMessage({
      id: generateId(),
      agent: "Yami",
      turn: 0,
      timestamp: new Date().toISOString(),
      content: "Error: ANTHROPIC_API_KEY not set",
    });
    running = false;
    return;
  }

  setState({ status: "planning" });

  try {
    await planProject({
      prompt,
      apiKey,
      onTaskStart: (task: MicroTask, agent: string, model: string) => {
        turnCounter++;
        addMessage({
          id: generateId(),
          agent,
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content: `[${model}] Starting: ${task.title}\n${task.description}`,
        });
      },
      onTaskComplete: (task: MicroTask, result: WorkerResult) => {
        const files = extractFiles(result.output);
        const filePaths: string[] = [];

        for (const f of files) {
          const lang = detectLanguage(f.path);
          const fileNode: FileNode = {
            name: f.path.split("/").pop() || f.path,
            path: f.path,
            type: "file",
            content: f.content,
            language: lang,
          };
          addFile(fileNode);
          filePaths.push(f.path);
        }

        if (filePaths.length > 0) {
          const commit: Commit = {
            sha: generateSha(),
            message: task.title,
            description: task.description,
            agent: task.assignedAgent || "Rei",
            timestamp: new Date().toISOString(),
            files: filePaths,
          };
          addCommit(commit);
        }

        turnCounter++;
        const msg: AgentMessage = {
          id: generateId(),
          agent: task.assignedAgent || "Rei",
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content: result.output.split("\n").slice(0, 3).join("\n"),
        };

        if (files.length > 0) {
          msg.codeBlock = {
            filename: files[0].path,
            language: detectLanguage(files[0].path),
            code: files[0].content.slice(0, 2000),
          };
        }

        addMessage(msg);
      },
      onMessage: (agent: string, content: string) => {
        addMessage({
          id: generateId(),
          agent,
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content,
        });
      },
    });

    setState({ status: "completed" });
  } catch (error) {
    setState({ status: "error" });
    addMessage({
      id: generateId(),
      agent: "Yami",
      turn: turnCounter,
      timestamp: new Date().toISOString(),
      content: `Orchestration error: ${error instanceof Error ? error.message : String(error)}`,
    });
  } finally {
    running = false;
  }
}

export function isRunning() {
  return running;
}
