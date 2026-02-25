"use client";

import { useMillStore } from "@/lib/use-mill-store";
import type { PipelineStage } from "@/lib/types";

const STAGES: { key: PipelineStage; label: string; icon: string }[] = [
  { key: "intake", label: "INTAKE", icon: "⎔" },
  { key: "architect", label: "ARCHITECT", icon: "◈" },
  { key: "implement", label: "IMPLEMENT", icon: "⟨/⟩" },
  { key: "test", label: "REVIEW", icon: "◎" },
  { key: "build", label: "BUILD", icon: "⚙" },
  { key: "complete", label: "DEPLOYED", icon: "✦" },
];

function stageIndex(stage: PipelineStage | null): number {
  if (!stage) return -1;
  return STAGES.findIndex((s) => s.key === stage);
}

export function PipelineBar() {
  const stage = useMillStore((s) => s.stage);
  const isRunning = useMillStore((s) => s.isRunning);
  const current = stageIndex(stage);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b"
         style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
      {STAGES.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const isFuture = i > current;

        return (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all duration-300 ${
                isActive
                  ? "animate-pulse-glow"
                  : ""
              }`}
              style={{
                color: isDone
                  ? "var(--neon-green)"
                  : isActive
                  ? "var(--neon-cyan)"
                  : "var(--text-muted)",
                background: isActive ? "rgba(0, 217, 255, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(0, 217, 255, 0.2)" : "1px solid transparent",
              }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className="w-6 h-px mx-1"
                style={{
                  background: isDone ? "var(--neon-green)" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}

      {stage === "failed" && (
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono"
             style={{ color: "var(--neon-red)", background: "rgba(239, 68, 68, 0.08)" }}>
          <span>✕</span>
          <span>FAILED</span>
        </div>
      )}

      {isRunning && (
        <div className="ml-auto h-1 w-24 rounded overflow-hidden"
             style={{ background: "var(--border)" }}>
          <div className="h-full w-full animate-shimmer rounded" />
        </div>
      )}
    </div>
  );
}
