"use client";

import { useState, useEffect } from "react";
import CodeViewer from "./CodeViewer";

interface FrameworkFile {
  name: string;
  content: string;
}

export default function FrameworkBrowser() {
  const [files, setFiles] = useState<FrameworkFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("index.ts");

  useEffect(() => {
    const fileNames = ["index.ts", "planner.ts", "router.ts", "worker.ts", "context.ts", "recovery.ts"];

    Promise.all(
      fileNames.map(async (name) => {
        try {
          const res = await fetch(`/api/framework-source?file=${name}`);
          const data = await res.json();
          return { name, content: data.content || "// File not found" };
        } catch {
          return { name, content: "// Failed to load" };
        }
      })
    ).then(setFiles);
  }, []);

  const currentFile = files.find((f) => f.name === activeFile);

  return (
    <div
      className="border rounded-lg overflow-hidden my-6"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="flex flex-col md:flex-row">
        <div
          className="md:w-[200px] border-b md:border-b-0 md:border-r"
          style={{ borderColor: "var(--color-tertiary)" }}
        >
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className="w-full text-left px-4 py-2 text-[13px] transition-fast border-b md:border-b-0"
              style={{
                borderColor: "rgba(45, 26, 77,0.2)",
                color: activeFile === file.name ? "var(--color-accent)" : "var(--color-secondary)",
                backgroundColor: activeFile === file.name ? "rgba(123, 79, 191,0.06)" : "transparent",
                borderLeft: activeFile === file.name ? "2px solid var(--color-primary)" : "2px solid transparent",
              }}
            >
              {file.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto max-h-[500px]">
          {currentFile && (
            <CodeViewer
              code={currentFile.content}
              language="typescript"
              filename={currentFile.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
