export interface AgentInfo {
  name: string;
  role: string;
  dotColor: string;
}

export interface AgentMessage {
  id: string;
  agent: string;
  turn: number;
  timestamp: string;
  content: string;
  codeBlock?: {
    filename: string;
    language: string;
    code: string;
  };
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface Commit {
  sha: string;
  message: string;
  description?: string;
  agent: string;
  timestamp: string;
  files: string[];
}

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  complexity: "low" | "medium" | "high" | "critical";
  assignedModel?: string;
  assignedAgent?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: string;
}

export interface TaskPlan {
  prompt: string;
  tasks: MicroTask[];
  createdAt: string;
}

export interface WorkerResult {
  taskId: string;
  success: boolean;
  output: string;
  filesCreated?: string[];
  error?: string;
}

export interface OrchestratorState {
  status: "idle" | "planning" | "running" | "completed" | "error";
  plan?: TaskPlan;
  messages: AgentMessage[];
  files: FileNode[];
  commits: Commit[];
  currentTask?: string;
}

export type TabName = "code" | "agents" | "commits";
