"use client";

import type { FileNode } from "@/types";

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect: (node: FileNode) => void;
  depth?: number;
}

function FileIcon({ type }: { type: "file" | "directory" }) {
  if (type === "directory") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 2H13.5C14.33 4 15 4.67 15 5.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"
          fill="var(--color-secondary)"
          opacity="0.6"
        />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 1.5C3 0.67 3.67 0 4.5 0H9.5L13 3.5V14.5C13 15.33 12.33 16 11.5 16H4.5C3.67 16 3 15.33 3 14.5V1.5Z"
        fill="var(--color-tertiary)"
      />
    </svg>
  );
}

export default function FileTree({ nodes, selectedPath, onSelect, depth = 0 }: FileTreeProps) {
  return (
    <div>
      {nodes.map((node, i) => (
        <div key={`${depth}-${i}-${node.name}`}>
          <button
            onClick={() => onSelect(node)}
            className="w-full flex items-center gap-2 py-1 text-[13px] transition-fast text-left"
            style={{
              paddingLeft: `${16 + depth * 16}px`,
              color: selectedPath === node.path ? "var(--color-accent)" : "var(--color-secondary)",
              backgroundColor: selectedPath === node.path ? "rgba(204, 0, 0, 0.06)" : "transparent",
              borderLeft: selectedPath === node.path ? "2px solid var(--color-primary)" : "2px solid transparent",
            }}
          >
            <FileIcon type={node.type} />
            <span>{node.name}</span>
          </button>
          {node.type === "directory" && node.children && (
            <FileTree
              nodes={node.children}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
