// ═══════════════════════════════════════════════════════════════
// Pipeline - The Agentic Mill orchestration engine
// Prompt → Spec → Architecture → Code → Review → Build → Deploy
// ═══════════════════════════════════════════════════════════════

import { nanoid } from "nanoid";
import { callOrchestrator, callArchitect, callCoder, callReviewer } from "./agents";
import type { AgentCallOptions } from "./agents";
import { Workspace } from "./workspace";
import type {
  Project,
  ProjectSpec,
  PipelineStage,
  AgentMessage,
  PipelineEvent,
  MessageType,
  AgentRole,
} from "./types";

function parseJSON(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
  return JSON.parse(cleaned);
}

type Emitter = (event: PipelineEvent) => void;

function emitMessage(
  emit: Emitter,
  projectId: string,
  agent: AgentRole,
  type: MessageType,
  content: string,
  metadata?: Record<string, unknown>
): void {
  emit({
    type: "message",
    data: {
      id: nanoid(),
      projectId,
      agent,
      type,
      content,
      metadata,
      timestamp: Date.now(),
    },
  });
}

function emitStage(emit: Emitter, stage: PipelineStage): void {
  emit({ type: "stage", data: { stage } });
}

// ── Pipeline Runner ────────────────────────────────────────

export async function runPipeline(
  prompt: string,
  emit: Emitter,
  agentOptions?: AgentCallOptions
): Promise<Project> {
  const projectId = nanoid();
  const workspace = new Workspace();

  const project: Project = {
    id: projectId,
    prompt,
    stage: "intake",
    spec: null,
    files: [],
    messages: [],
    deployUrl: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    // ── STAGE 1: Intake ──────────────────────────────────
    emitStage(emit, "intake");
    emitMessage(emit, projectId, "orchestrator", "thinking",
      `ACHEEVY analyzing prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"`);

    const specRaw = await callOrchestrator(prompt, agentOptions);
    let spec: ProjectSpec;
    try {
      const parsed = parseJSON(specRaw) as Record<string, unknown>;
      spec = {
        name: (parsed.name as string) || "untitled-project",
        description: (parsed.description as string) || prompt,
        framework: (parsed.framework as string) || "react-vite",
        features: (parsed.features as string[]) || [],
        files: [],
        buildCommand: (parsed.buildCommand as string) || "npm run build",
        devCommand: (parsed.devCommand as string) || "npm run dev",
        outputDir: (parsed.outputDir as string) || "dist",
      };
    } catch {
      emitMessage(emit, projectId, "orchestrator", "error",
        "Failed to parse project spec, using defaults");
      spec = {
        name: "generated-project",
        description: prompt,
        framework: "react-vite",
        features: [],
        files: [],
        buildCommand: "npm run build",
        devCommand: "npm run dev",
        outputDir: "dist",
      };
    }

    project.spec = spec;
    project.stage = "architect";
    emitMessage(emit, projectId, "orchestrator", "output",
      `Project: ${spec.name} | Framework: ${spec.framework} | Features: ${spec.features.join(", ")}`);

    // ── STAGE 2: Architect ───────────────────────────────
    emitStage(emit, "architect");
    emitMessage(emit, projectId, "architect", "thinking",
      "Architect_Ang designing system architecture...");

    const archRaw = await callArchitect(JSON.stringify(spec, null, 2), agentOptions);
    let archPlan: {
      files: { path: string; purpose: string; order: number }[];
      installDeps: string[];
      devDeps: string[];
      notes: string;
    };

    try {
      archPlan = parseJSON(archRaw) as typeof archPlan;
    } catch {
      emitMessage(emit, projectId, "architect", "error",
        "Failed to parse architecture plan, deriving from spec");
      archPlan = {
        files: [
          { path: "package.json", purpose: "Project dependencies", order: 0 },
          { path: "src/index.ts", purpose: "Entry point", order: 1 },
        ],
        installDeps: [],
        devDeps: [],
        notes: "",
      };
    }

    // Sort files by implementation order
    const sortedFiles = [...archPlan.files].sort((a, b) => a.order - b.order);

    emitMessage(emit, projectId, "architect", "output",
      `Architecture: ${sortedFiles.length} files planned. ${archPlan.notes || ""}`);

    // ── STAGE 3: Implement ───────────────────────────────
    emitStage(emit, "implement");
    project.stage = "implement";

    for (const filePlan of sortedFiles) {
      emitMessage(emit, projectId, "coder", "thinking",
        `Coding_Ang writing: ${filePlan.path}`);

      const code = await callCoder(
        JSON.stringify(spec, null, 2),
        filePlan.path,
        filePlan.purpose,
        workspace.getProjectFiles(),
        agentOptions
      );

      workspace.writeFile(filePlan.path, code);

      emit({
        type: "file",
        data: {
          path: filePlan.path,
          content: code,
          language: filePlan.path.endsWith(".ts") || filePlan.path.endsWith(".tsx")
            ? "typescript"
            : "javascript",
        },
      });

      emitMessage(emit, projectId, "coder", "file_write",
        `Wrote ${filePlan.path} (${code.length} chars)`,
        { path: filePlan.path });
    }

    // ── STAGE 4: Review ──────────────────────────────────
    emitStage(emit, "test");
    project.stage = "test";

    emitMessage(emit, projectId, "reviewer", "thinking",
      "Review_Ang auditing project for completeness...");

    const reviewRaw = await callReviewer(
      JSON.stringify(spec, null, 2),
      workspace.getProjectFiles(),
      agentOptions
    );

    let review: {
      status: string;
      issues: { file: string; line: string; fix: string }[];
      missingFiles: string[];
    };

    try {
      review = parseJSON(reviewRaw) as typeof review;
    } catch {
      review = { status: "pass", issues: [], missingFiles: [] };
    }

    if (review.status === "fail" && review.issues.length > 0) {
      emitMessage(emit, projectId, "reviewer", "output",
        `Found ${review.issues.length} issue(s). Fixing...`);

      // Fix cycle: re-generate files that have issues
      const filesToFix = new Set(review.issues.map((i) => i.file));
      for (const fixPath of filesToFix) {
        const issue = review.issues.find((i) => i.file === fixPath);
        if (!issue) continue;

        emitMessage(emit, projectId, "coder", "thinking",
          `Fixing ${fixPath}: ${issue.line}`);

        const fixedCode = await callCoder(
          JSON.stringify(spec, null, 2),
          fixPath,
          `Fix: ${issue.fix}`,
          workspace.getProjectFiles(),
          agentOptions
        );

        workspace.writeFile(fixPath, fixedCode);

        emit({
          type: "file",
          data: {
            path: fixPath,
            content: fixedCode,
            language: "typescript",
          },
        });
      }

      // Handle missing files
      for (const missingPath of review.missingFiles || []) {
        emitMessage(emit, projectId, "coder", "thinking",
          `Generating missing file: ${missingPath}`);

        const newCode = await callCoder(
          JSON.stringify(spec, null, 2),
          missingPath,
          "Missing file identified during review",
          workspace.getProjectFiles(),
          agentOptions
        );

        workspace.writeFile(missingPath, newCode);

        emit({
          type: "file",
          data: {
            path: missingPath,
            content: newCode,
            language: "typescript",
          },
        });
      }
    }

    emitMessage(emit, projectId, "reviewer", "output",
      review.status === "pass"
        ? "All files pass review. Project is complete."
        : `Fixed ${review.issues.length} issues. Project updated.`);

    // ── STAGE 5: Complete ────────────────────────────────
    emitStage(emit, "build");
    project.stage = "build";

    emitMessage(emit, projectId, "deployer", "output",
      `Project ready. ${workspace.listFiles().length} files generated. Run '${spec.devCommand}' to start.`);

    project.files = workspace.getProjectFiles();
    project.stage = "complete";
    project.updatedAt = Date.now();

    emitStage(emit, "complete");
    emit({ type: "done", data: { stage: "complete" } });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    project.stage = "failed";
    emitStage(emit, "failed");
    emitMessage(emit, projectId, "orchestrator", "error", `Pipeline failed: ${errMsg}`);
    emit({ type: "error", data: { error: errMsg } });
  }

  return project;
}
