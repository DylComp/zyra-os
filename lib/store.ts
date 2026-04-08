import type { AgentMessage, FileNode, Commit, OrchestratorState } from "@/types";

let state: OrchestratorState = {
  status: "idle",
  messages: [],
  files: [],
  commits: [],
};

let listeners: Array<(msg: AgentMessage) => void> = [];

export function getState(): OrchestratorState {
  return state;
}

export function setState(partial: Partial<OrchestratorState>) {
  state = { ...state, ...partial };
}

export function addMessage(msg: AgentMessage) {
  state.messages.push(msg);
  listeners.forEach((fn) => fn(msg));
}

export function addFile(file: FileNode) {
  const existing = findFile(state.files, file.path);
  if (existing) {
    existing.content = file.content;
    existing.language = file.language;
  } else {
    insertFile(state.files, file);
  }
}

export function addCommit(commit: Commit) {
  state.commits.unshift(commit);
}

export function subscribe(fn: (msg: AgentMessage) => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function resetState() {
  state = { status: "idle", messages: [], files: [], commits: [] };
  listeners = [];
}

function findFile(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function insertFile(nodes: FileNode[], file: FileNode) {
  const parts = file.path.split("/");
  if (parts.length === 1) {
    nodes.push(file);
    return;
  }

  const dirName = parts[0];
  let dir = nodes.find((n) => n.name === dirName && n.type === "directory");
  if (!dir) {
    dir = { name: dirName, path: dirName, type: "directory", children: [] };
    nodes.push(dir);
  }

  const childFile: FileNode = {
    ...file,
    path: parts.slice(1).join("/"),
    name: parts[parts.length - 1],
  };
  insertFile(dir.children!, childFile);
}
