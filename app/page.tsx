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
  const [activeTab, setActiveTab] = useState<TabName>("code");
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
    } catch { /* ignore */ }
  }, []);

  const fetchCommits = useCallback(async () => {
    try {
      const res = await fetch("/api/commits");
      const data = await res.json();
      setCommits(data.commits || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStatus("running");

    fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Build a blockchain from scratch in TypeScript." }),
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
            }
          } catch { /* ignore */ }
        }
      }
    }).catch(() => setStatus("error"));

    // Poll files/commits every 3s instead of on every message
    const poll = setInterval(() => {
      fetchFiles();
      fetchCommits();
    }, 3000);
    return () => clearInterval(poll);
  }, [fetchFiles, fetchCommits]);

  const flatFileCount = countFiles(files);
  const counts = { code: flatFileCount, agents: messages.length, commits: commits.length };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", overflow: "hidden", width: "100vw", maxWidth: "100vw" }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {/* Sub-header */}
      <div style={{
        position: "fixed", top: 48, left: 0, right: 0, zIndex: 40, height: 48,
        display: "flex", alignItems: "center", padding: "0 20px",
        borderBottom: "1px solid var(--color-tertiary)", backgroundColor: "var(--bg-tertiary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LivePulse />
          <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>
            {status === "running" ? "Agents building blockchain..." :
             status === "completed" ? "Build complete" :
             status === "error" ? "Error occurred" : "Initializing..."}
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {flatFileCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--color-secondary)" }}>{flatFileCount} files</span>
          )}
          <a href="https://x.com/zyraosagent" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: "var(--color-secondary)", textDecoration: "none" }}>
            @zyraosagent
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar files={files} selectedPath={selectedFile?.path}
        onSelect={(node) => { setSelectedFile(node); setActiveTab("code"); }} />

      {/* Main content */}
      <main style={{
        paddingTop: 96, marginLeft: "var(--sidebar-width, 0px)",
        width: "calc(100vw - var(--sidebar-width, 0px))",
        maxWidth: "calc(100vw - var(--sidebar-width, 0px))",
        minHeight: "100vh", overflow: "hidden", backgroundColor: "var(--bg-primary)",
      }}>
        {/* Hero section */}
        <div style={{
          borderBottom: "1px solid var(--color-tertiary)",
          padding: "24px 24px 20px",
        }}>
          {/* CA Banner */}
          <div style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid var(--color-tertiary)",
            backgroundColor: "var(--bg-secondary)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontSize: 12, color: "var(--color-secondary)", fontWeight: 500 }}>CA:</span>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-primary)", letterSpacing: "0.5px" }}>
              Coming soon
            </span>
          </div>

          {/* Mascot + Info */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Anime girl mascot */}
            <div style={{
              width: 280,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--color-tertiary)",
              boxShadow: "0 4px 24px rgba(204, 0, 0, 0.1)",
              flexShrink: 0,
            }}>
              <img
                src="/zyra.os.jpg"
                alt="ZyraOS"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* Description */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                fontWeight: 600,
                color: "var(--color-primary)",
                textShadow: "0 0 24px rgba(204, 0, 0, 0.3)",
                margin: "0 0 12px",
                letterSpacing: "1px",
              }}>
                ZyraOS
              </h1>
              <p style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--color-secondary)",
                margin: "0 0 8px",
              }}>
                She builds while you watch. Autonomous agent framework for workflows that take days, not minutes.
              </p>
              <p style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--color-secondary)",
                margin: "0 0 20px",
              }}>
                This page doubles as a live demo. Four agents are building a blockchain from scratch, iteratively, using ZyraOS.
              </p>

              {/* Download button */}
              <a
                href="/api/download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                  borderRadius: 6,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  backgroundColor: "rgba(204, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(204, 0, 0, 0.15)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(204, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(204, 0, 0, 0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 12l-4-4h2.5V2h3v6H12L8 12zM2 14h12v-1.5H2V14z"/>
                </svg>
                Download ZyraOS
              </a>
            </div>
          </div>
        </div>

        {/* Tab bar inside content (like HomerOS) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 24px",
          borderBottom: "1px solid var(--color-tertiary)",
        }}>
          {([
            { name: "code" as TabName, label: "Code", icon: "<>" },
            { name: "agents" as TabName, label: "Agents", count: messages.length },
            { name: "commits" as TabName, label: "Commits", count: commits.length },
          ]).map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-mono)",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                  cursor: "pointer",
                  color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                  backgroundColor: "transparent",
                }}
              >
                {tab.icon && <span style={{ fontSize: 11 }}>{tab.icon}</span>}
                {tab.label}
                {(tab.count ?? 0) > 0 && (
                  <span style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 999,
                    backgroundColor: "rgba(204, 0, 0, 0.15)",
                    color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "code" && (
            <CodeView files={files} selectedFile={selectedFile} onFileSelect={setSelectedFile} />
          )}
          {activeTab === "agents" && <AgentsView messages={messages} />}
          {activeTab === "commits" && <CommitsView commits={commits} />}
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          :root { --sidebar-width: 300px; }
        }
      `}</style>
    </div>
  );
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count++;
    if (node.children) count += countFiles(node.children);
  }
  return count;
}
