/**
 * Deploy Adapter Index
 * Re-exports all Deploy Orchestrator client functions and types
 */

export { runTests, exportPlug, getRunStatus, generateTraceId } from './client';
export type { RunRequest, RunResponse, ExportRequest, ExportResponse, TestResult } from './types';
