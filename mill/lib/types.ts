// ═══════════════════════════════════════════════════════════════
// Agentic Mill - Core Type Definitions
// ═══════════════════════════════════════════════════════════════

export type AgentRole =
  | "orchestrator"   // ACHEEVY - decomposes intent, manages pipeline
  | "architect"      // Architect_Ang - system design, file structure
  | "coder"          // Coding_Ang - code generation via Claude tool use
  | "tester"         // Testing_Ang - test generation and execution
  | "reviewer"       // Review_Ang - code review, quality gates
  | "deployer";      // Forge_Ang - build and deployment

export type PipelineStage =
  | "intake"       // Parse prompt, extract requirements
  | "architect"    // Design system, pick stack, define structure
  | "implement"    // Generate code files
  | "test"         // Run tests, validate
  | "build"        // Bundle/compile
  | "deploy"       // Push to Vercel/Cloudflare
  | "complete"
  | "failed";

export type MessageType =
  | "system"
  | "thinking"
  | "tool_use"
  | "tool_result"
  | "output"
  | "error"
  | "stage_change"
  | "file_write"
  | "file_update"
  | "command_run"
  | "deploy_url";

export interface AgentMessage {
  id: string;
  projectId: string;
  agent: AgentRole;
  type: MessageType;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface ProjectSpec {
  name: string;
  description: string;
  framework: string;
  features: string[];
  files: ProjectFile[];
  buildCommand?: string;
  devCommand?: string;
  outputDir?: string;
}

export interface Project {
  id: string;
  prompt: string;
  stage: PipelineStage;
  spec: ProjectSpec | null;
  files: ProjectFile[];
  messages: AgentMessage[];
  deployUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface PipelineEvent {
  type: "message" | "stage" | "file" | "done" | "error";
  data: AgentMessage | { stage: PipelineStage } | ProjectFile | { error: string };
}
