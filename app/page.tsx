"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TabName, AgentMessage, FileNode, Commit } from "@/types";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeView from "@/components/CodeView";
import AgentsView from "@/components/AgentsView";
import CommitsView from "@/components/CommitsView";
import LivePulse from "@/components/LivePulse";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabName>("agents");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const startedRef = useRef(false);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchCommits = useCallback(async () => {
    try {
      const res = await fetch("/api/commits");
      const data = await res.json();
      setCommits(data.commits || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    setStatus("running");

    fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Build a blockchain from scratch in TypeScript. Include: block structure with SHA-256 hashing, a chain validator, proof-of-work consensus, a transaction system with digital signatures, a peer-to-peer networking layer, and a simple CLI interface." }),
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "done") {
              setStatus(data.status);
            } else if (data.id) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === data.id)) return prev;
                return [...prev, data];
              });
              fetchFiles();
              fetchCommits();
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }).catch(() => {
      setStatus("error");
    });

    return () => {};
  }, [fetchFiles, fetchCommits]);

  const counts = {
    code: files.length,
    agents: messages.length,
    commits: commits.length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {/* Sub-header */}
      <div
        className="fixed top-[48px] left-0 right-0 z-40 h-[48px] flex items-center px-4 border-b"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--color-tertiary)",
        }}
      >
        <div className="flex items-center gap-3">
          <LivePulse />
          <span className="text-[12px]" style={{ color: "var(--color-secondary)" }}>
            {status === "running" ? "Agents building blockchain..." :
             status === "completed" ? "Build complete" :
             status === "error" ? "Error occurred" :
             "Initializing..."}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: "var(--color-dim)" }}>
            CA: Coming soon
          </span>
          <a
            href="https://x.com/zyraosagent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] transition-base no-underline"
            style={{ color: "var(--color-secondary)" }}
          >
            @zyraosagent
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        files={files}
        selectedPath={selectedFile?.path}
        onSelect={(node) => {
          setSelectedFile(node);
          setActiveTab("code");
        }}
      />

      {/* Main content */}
      <main
        className="pt-[96px] lg:ml-[300px] min-h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {activeTab === "code" && (
          <CodeView
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        )}
        {activeTab === "agents" && <AgentsView messages={messages} />}
        {activeTab === "commits" && <CommitsView commits={commits} />}
      </main>
    </div>
  );
}
