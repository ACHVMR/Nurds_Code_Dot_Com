"use client";

import { PipelineBar } from "./(components)/pipeline-bar";
import { AgentFeed } from "./(components)/agent-feed";
import { FileTree } from "./(components)/file-tree";
import { CodeEditor } from "./(components)/code-editor";
import { PromptInput } from "./(components)/prompt-input";

export default function MillPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar: Branding + Pipeline Progress */}
      <header
        className="flex items-center border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="font-mono font-bold text-sm tracking-wider"
            style={{ color: "var(--neon-green)" }}
          >
            NURDS
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            AGENTIC MILL
          </span>
        </div>
        <PipelineBar />
      </header>

      {/* Main Content: 3-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel: File Tree */}
        <div
          className="w-56 shrink-0 border-r flex flex-col"
          style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}
        >
          <FileTree />
        </div>

        {/* Center Panel: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <CodeEditor />
        </div>

        {/* Right Panel: Agent Feed */}
        <div
          className="w-80 shrink-0 border-l flex flex-col"
          style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}
        >
          <AgentFeed />
        </div>
      </div>

      {/* Bottom Bar: Prompt Input */}
      <div className="shrink-0">
        <PromptInput />
      </div>
    </div>
  );
}
