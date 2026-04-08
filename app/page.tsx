"use client";

import { useState, useEffect } from "react";
import type { TabName, AgentMessage, FileNode, Commit } from "@/types";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeView from "@/components/CodeView";
import AgentsView from "@/components/AgentsView";
import CommitsView from "@/components/CommitsView";
import LivePulse from "@/components/LivePulse";
import { DEMO_MESSAGES } from "@/lib/demo-messages";
import { DEMO_FILES, DEMO_COMMITS } from "@/lib/demo-data";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabName>("code");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");

  useEffect(() => {
    // Reset state on every page load
    setMessages([]);
    setFiles([]);
    setCommits([]);
    setStatus("running");

    // Load files immediately
    setFiles(DEMO_FILES);

    // Stream messages and commits together
    let cancelled = false;
    let msgIdx = 0;
    let commitIdx = 0;
    const baseTime = Date.now();

    // Every ~2 messages, drop a batch of commits (to get through 301 commits across 156 messages)
    const commitsPerMessage = Math.ceil(DEMO_COMMITS.length / DEMO_MESSAGES.length);

    function nextMessage() {
      if (cancelled) return;
      if (msgIdx >= DEMO_MESSAGES.length) {
        // Flush remaining commits
        if (commitIdx < DEMO_COMMITS.length) {
          const remaining = DEMO_COMMITS.slice(commitIdx).map((c) => ({
            ...c,
            timestamp: new Date(Date.now()).toISOString(),
          }));
          setCommits((prev) => [...prev, ...remaining]);
        }
        setStatus("completed");
        return;
      }

      const template = DEMO_MESSAGES[msgIdx];
      const now = new Date(baseTime + msgIdx * 3000).toISOString();
      const msg: AgentMessage = {
        id: `msg-${msgIdx + 1}`,
        agent: template.agent,
        turn: template.turn,
        timestamp: now,
        content: template.content,
        codeBlock: template.codeBlock,
      };

      setMessages((prev) => [...prev, msg]);

      // Drop linked commits from the same agent or next in queue
      const batchSize = commitsPerMessage + (msgIdx % 3 === 0 ? 1 : 0);
      const end = Math.min(commitIdx + batchSize, DEMO_COMMITS.length);
      if (commitIdx < end) {
        const batch = DEMO_COMMITS.slice(commitIdx, end).map((c) => ({
          ...c,
          timestamp: now,
        }));
        setCommits((prev) => [...prev, ...batch]);
        commitIdx = end;
      }

      msgIdx++;

      // Fast delays to feel snappy
      const delay = msgIdx < 3 ? 300 : msgIdx < 10 ? 500 : 700;
      setTimeout(nextMessage, delay + Math.random() * 300);
    }

    // Start immediately
    nextMessage();

    return () => { cancelled = true; };
  }, []);

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
             "Initializing..."}
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {flatFileCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--color-secondary)" }}>{flatFileCount} files</span>
          )}
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
        <div style={{ borderBottom: "1px solid var(--color-tertiary)", padding: "24px 24px 20px" }}>
          {/* Mascot + Info */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{
              width: 280, borderRadius: 8, overflow: "hidden",
              border: "1px solid var(--color-tertiary)",
              boxShadow: "0 4px 24px rgba(204, 0, 0, 0.1)", flexShrink: 0,
            }}>
              <img src="/zyra.os.jpg" alt="ZyraOS" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{
                fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600,
                color: "var(--color-primary)", textShadow: "0 0 24px rgba(204, 0, 0, 0.3)",
                margin: "0 0 12px", letterSpacing: "1px",
              }}>
                ZyraOS
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-secondary)", margin: "0 0 8px" }}>
                She builds while you watch. Autonomous agent framework for workflows that take days, not minutes.
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-secondary)", margin: "0 0 20px" }}>
                This page doubles as a live demo. Four agents are building a blockchain from scratch, iteratively, using ZyraOS.
              </p>

              <a href="/api/download" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", fontSize: 13, fontWeight: 600,
                fontFamily: "var(--font-mono)", color: "var(--color-primary)",
                border: "1px solid var(--color-primary)", borderRadius: 6,
                textDecoration: "none", transition: "all 0.15s ease",
                backgroundColor: "rgba(204, 0, 0, 0.05)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(204, 0, 0, 0.15)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(204, 0, 0, 0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(204, 0, 0, 0.05)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 12l-4-4h2.5V2h3v6H12L8 12zM2 14h12v-1.5H2V14z"/>
                </svg>
                Download ZyraOS
              </a>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4, padding: "0 24px",
          borderBottom: "1px solid var(--color-tertiary)",
        }}>
          {([
            { name: "code" as TabName, label: "Code", icon: "<>" },
            { name: "agents" as TabName, label: "Agents", count: messages.length },
            { name: "commits" as TabName, label: "Commits", count: commits.length },
          ]).map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "12px 16px", fontSize: 13, fontWeight: 500,
                  fontFamily: "var(--font-mono)", border: "none",
                  borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                  color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                  backgroundColor: "transparent",
                }}>
                {tab.icon && <span style={{ fontSize: 11 }}>{tab.icon}</span>}
                {tab.label}
                {(tab.count ?? 0) > 0 && (
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 999,
                    backgroundColor: "rgba(204, 0, 0, 0.15)",
                    color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                  }}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "code" && <CodeView files={files} selectedFile={selectedFile} onFileSelect={setSelectedFile} />}
          {activeTab === "agents" && <AgentsView messages={messages} />}
          {activeTab === "commits" && <CommitsView commits={commits} />}
        </div>
      </main>

      <style>{`@media (min-width: 1024px) { :root { --sidebar-width: 300px; } }`}</style>
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
