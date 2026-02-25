"use client";

import dynamic from "next/dynamic";
import { useMillStore } from "@/lib/use-mill-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full font-mono text-xs"
         style={{ color: "var(--text-muted)", background: "var(--bg-primary)" }}>
      Loading editor...
    </div>
  ),
});

export function CodeEditor() {
  const files = useMillStore((s) => s.files);
  const activeFile = useMillStore((s) => s.activeFile);
  const updateFileContent = useMillStore((s) => s.updateFileContent);

  const file = files.find((f) => f.path === activeFile);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4"
           style={{ background: "var(--bg-primary)" }}>
        <div className="text-6xl opacity-10">⟨/⟩</div>
        <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          Select a file or start the mill
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div
        className="flex items-center border-b overflow-x-auto"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-r"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--neon-green)",
          }}
        >
          <span style={{ color: "var(--neon-green)", fontSize: "6px" }}>●</span>
          {file.path.split("/").pop()}
        </div>
        <div
          className="ml-auto px-3 py-1.5 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {file.language}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={file.language}
          value={file.content}
          onChange={(value) => {
            if (value !== undefined) {
              updateFileContent(file.path, value);
            }
          }}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "off",
          }}
        />
      </div>
    </div>
  );
}
