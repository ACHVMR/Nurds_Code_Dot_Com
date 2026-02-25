"use client";

import { useState } from "react";
import { useMillStore } from "@/lib/use-mill-store";

export function PromptInput() {
  const prompt = useMillStore((s) => s.prompt);
  const setPrompt = useMillStore((s) => s.setPrompt);
  const startPipeline = useMillStore((s) => s.startPipeline);
  const isRunning = useMillStore((s) => s.isRunning);
  const stage = useMillStore((s) => s.stage);
  const files = useMillStore((s) => s.files);
  const reset = useMillStore((s) => s.reset);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (prompt.trim() && !isRunning) {
      startPipeline();
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleDownload = async () => {
    const res = await fetch("/api/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: null }),
    });

    // Use files from store directly for download
    const fileData = files.reduce<Record<string, string>>((acc, f) => {
      acc[f.path] = f.content;
      return acc;
    }, {});

    const blob = new Blob([JSON.stringify(fileData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-files.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="border-t"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isRunning
                ? "var(--neon-cyan)"
                : stage === "complete"
                ? "var(--neon-green)"
                : stage === "failed"
                ? "var(--neon-red)"
                : "var(--text-muted)",
              boxShadow: isRunning ? "0 0 6px var(--neon-cyan)" : "none",
            }}
          />
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {isRunning ? "RUNNING" : stage === "complete" ? "DONE" : "READY"}
          </span>
        </div>

        {/* Input */}
        {isExpanded ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app... (Ctrl+Enter to start)"
            autoFocus
            rows={3}
            className="flex-1 resize-none px-3 py-2 text-sm font-mono rounded outline-none"
            style={{
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-active)",
            }}
          />
        ) : (
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Think it. Prompt it. Ship it."
            disabled={isRunning}
            className="flex-1 px-3 py-1.5 text-sm font-mono rounded outline-none"
            style={{
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="px-2 py-1.5 text-xs font-mono rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              ESC
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={isRunning || !prompt.trim()}
            className="px-4 py-1.5 text-xs font-mono font-bold rounded transition-all"
            style={{
              background: isRunning ? "var(--border)" : "var(--neon-green)",
              color: isRunning ? "var(--text-muted)" : "#000",
              cursor: isRunning ? "not-allowed" : "pointer",
            }}
          >
            {isRunning ? "MILLING..." : "START MILL"}
          </button>

          {stage === "complete" && files.length > 0 && (
            <>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs font-mono rounded"
                style={{
                  background: "var(--neon-cyan)",
                  color: "#000",
                }}
              >
                DOWNLOAD
              </button>
              <button
                onClick={reset}
                className="px-2 py-1.5 text-xs font-mono rounded"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                NEW
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
