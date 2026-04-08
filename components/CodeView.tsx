"use client";

import type { FileNode } from "@/types";
import CodeViewer from "./CodeViewer";

interface CodeViewProps {
  files: FileNode[];
  selectedFile?: FileNode;
  onFileSelect: (node: FileNode) => void;
}

export default function CodeView({ files, selectedFile, onFileSelect }: CodeViewProps) {
  const flatFiles = flattenFiles(files);

  if (selectedFile?.content) {
    return (
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-tertiary)",
          backgroundColor: "var(--bg-tertiary)",
          fontSize: 12,
        }}>
          <button onClick={() => onFileSelect(undefined!)}
            style={{ color: "var(--color-secondary)", background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            root
          </button>
          <span style={{ margin: "0 8px", color: "var(--color-tertiary)" }}>/</span>
          <span style={{ color: "var(--color-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedFile.path}
          </span>
          <button onClick={() => onFileSelect(undefined!)}
            style={{
              marginLeft: "auto", padding: "2px 8px", fontSize: 11, borderRadius: 4,
              border: "1px solid var(--color-tertiary)", color: "var(--color-secondary)",
              background: "none", fontFamily: "var(--font-mono)",
            }}>
            Back
          </button>
        </div>
        <div style={{ padding: 16 }}>
          <CodeViewer code={selectedFile.content} language={selectedFile.language} filename={selectedFile.name} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        borderBottom: "1px solid var(--color-tertiary)",
        backgroundColor: "var(--bg-tertiary)",
        fontSize: 12,
      }}>
        <span style={{ color: "var(--color-secondary)" }}>zyraos-blockchain</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-secondary)" }}>
          {flatFiles.length} files
        </span>
      </div>

      <div>
        {flatFiles.map((file, i) => (
          <div
            key={`${file.path}-${i}`}
            onClick={() => onFileSelect(file)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-tertiary)",
              overflow: "hidden",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M3 1.5C3 0.67 3.67 0 4.5 0H9.5L13 3.5V14.5C13 15.33 12.33 16 11.5 16H4.5C3.67 16 3 15.33 3 14.5V1.5Z" fill="var(--color-tertiary)" />
            </svg>
            <span title={file.path} style={{ fontSize: 13, color: "var(--color-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {file.path}
            </span>
            <span style={{ fontSize: 11, flexShrink: 0, color: "var(--color-secondary)" }}>
              {file.language || "text"}
            </span>
          </div>
        ))}
        {flatFiles.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 192, fontSize: 13, color: "var(--color-secondary)" }}>
            Waiting for agents to generate files...
          </div>
        )}
      </div>
    </div>
  );
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") result.push(node);
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}
