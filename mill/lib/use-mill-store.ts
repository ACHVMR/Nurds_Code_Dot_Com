// ═══════════════════════════════════════════════════════════════
// Mill Store - Zustand state management for the Mill dashboard
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import type { AgentMessage, PipelineEvent, PipelineStage, ProjectFile } from "./types";

interface MillState {
  // Pipeline
  isRunning: boolean;
  stage: PipelineStage | null;
  prompt: string;
  projectId: string | null;

  // Files
  files: ProjectFile[];
  activeFile: string | null;

  // Agent feed
  messages: AgentMessage[];

  // Actions
  setPrompt: (prompt: string) => void;
  startPipeline: () => Promise<void>;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  reset: () => void;
}

export const useMillStore = create<MillState>((set, get) => ({
  isRunning: false,
  stage: null,
  prompt: "",
  projectId: null,
  files: [],
  activeFile: null,
  messages: [],

  setPrompt: (prompt) => set({ prompt }),

  startPipeline: async () => {
    const { prompt } = get();
    if (!prompt.trim()) return;

    set({
      isRunning: true,
      stage: "intake",
      files: [],
      activeFile: null,
      messages: [],
      projectId: null,
    });

    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event: PipelineEvent = JSON.parse(jsonStr);

            switch (event.type) {
              case "message": {
                const msg = event.data as AgentMessage;
                set((s) => ({ messages: [...s.messages, msg] }));
                break;
              }
              case "stage": {
                const { stage } = event.data as { stage: PipelineStage };
                set({ stage });
                break;
              }
              case "file": {
                const file = event.data as ProjectFile;
                set((s) => {
                  const existing = s.files.findIndex((f) => f.path === file.path);
                  const newFiles = [...s.files];
                  if (existing >= 0) {
                    newFiles[existing] = file;
                  } else {
                    newFiles.push(file);
                  }
                  return {
                    files: newFiles,
                    activeFile: s.activeFile || file.path,
                  };
                });
                break;
              }
              case "done": {
                set({ isRunning: false, stage: "complete" });
                break;
              }
              case "error": {
                set({ isRunning: false, stage: "failed" });
                break;
              }
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (err) {
      set({ isRunning: false, stage: "failed" });
    }
  },

  setActiveFile: (path) => set({ activeFile: path }),

  updateFileContent: (path, content) => {
    set((s) => ({
      files: s.files.map((f) =>
        f.path === path ? { ...f, content } : f
      ),
    }));
  },

  reset: () =>
    set({
      isRunning: false,
      stage: null,
      prompt: "",
      projectId: null,
      files: [],
      activeFile: null,
      messages: [],
    }),
}));
