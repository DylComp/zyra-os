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

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center px-4 py-2 border-b text-[12px]"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--color-tertiary)",
          color: "var(--color-secondary)",
        }}
      >
        <span>zyraos-blockchain</span>
        <span className="mx-2 opacity-30">/</span>
        <span>{selectedFile?.path || "src"}</span>
      </div>

      {selectedFile?.content ? (
        <div className="flex-1 overflow-auto p-4">
          <CodeViewer
            code={selectedFile.content}
            language={selectedFile.language}
            filename={selectedFile.path}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {flatFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => onFileSelect(file)}
              className="w-full flex items-center px-4 py-2 border-b text-left transition-fast"
              style={{
                borderColor: "rgba(77, 0, 0, 0.3)",
                color: "var(--color-primary)",
              }}
            >
              <span className="text-[13px]">{file.name}</span>
              <span className="ml-auto text-[11px]" style={{ color: "var(--color-dim)" }}>
                {file.language || "text"}
              </span>
            </button>
          ))}

          {flatFiles.length === 0 && (
            <div className="flex items-center justify-center h-48 text-[13px]" style={{ color: "var(--color-dim)" }}>
              Waiting for agents to generate files...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      result.push(node);
    }
    if (node.children) {
      result.push(...flattenFiles(node.children));
    }
  }
  return result;
}
