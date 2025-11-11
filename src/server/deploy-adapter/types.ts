// Deploy Orchestrator TypeScript type definitions

export interface RunRequest {
  plugId: string;
  scenarios: string[];
  environment?: 'staging' | 'production';
}

export interface RunResponse {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  results?: TestResult[];
}

export interface TestResult {
  scenarioId: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface ExportRequest {
  plugId: string;
  workspaceBundle: {
    files: Record<string, string>;
  };
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
  };
}

export interface ExportResponse {
  plugId: string;
  prUrl: string;
  previewUrl?: string;
  status: 'pending' | 'building' | 'deployed';
}
