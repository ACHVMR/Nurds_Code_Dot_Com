"use client";

import { useEffect, useRef } from "react";
import { useMillStore } from "@/lib/use-mill-store";
import type { AgentRole } from "@/lib/types";

const AGENT_LABELS: Record<AgentRole, string> = {
  orchestrator: "ACHEEVY",
  architect: "Architect_Ang",
  coder: "Coding_Ang",
  tester: "Testing_Ang",
  reviewer: "Review_Ang",
  deployer: "Forge_Ang",
};

const AGENT_COLORS: Record<AgentRole, string> = {
  orchestrator: "var(--neon-green)",
  architect: "var(--neon-cyan)",
  coder: "var(--neon-orange)",
  tester: "var(--neon-purple)",
  reviewer: "var(--neon-purple)",
  deployer: "var(--neon-cyan)",
};

export function AgentFeed() {
  const messages = useMillStore((s) => s.messages);
  const isRunning = useMillStore((s) => s.isRunning);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs font-mono border-b"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <span style={{ color: "var(--neon-green)" }}>●</span>
        AGENT_FEED
        <span className="ml-auto" style={{ color: "var(--text-muted)" }}>
          {messages.length} events
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
        style={{ background: "var(--bg-primary)" }}
      >
        {messages.length === 0 && !isRunning && (
          <div className="text-center py-8 text-xs font-mono"
               style={{ color: "var(--text-muted)" }}>
            Enter a prompt to start the mill
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 text-xs font-mono leading-relaxed">
            <span
              className="shrink-0 font-bold"
              style={{ color: AGENT_COLORS[msg.agent] || "var(--text-muted)" }}
            >
              [{AGENT_LABELS[msg.agent] || msg.agent}]
            </span>
            <span
              style={{
                color:
                  msg.type === "error"
                    ? "var(--neon-red)"
                    : msg.type === "thinking"
                    ? "var(--text-muted)"
                    : "var(--text-primary)",
                fontStyle: msg.type === "thinking" ? "italic" : "normal",
              }}
            >
              {msg.type === "thinking" && "▸ "}
              {msg.content}
            </span>
          </div>
        ))}

        {isRunning && (
          <div className="flex gap-2 text-xs font-mono animate-pulse-glow"
               style={{ color: "var(--neon-cyan)" }}>
            <span>⟳</span>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
