// ═══════════════════════════════════════════════════════════════
// Store - In-memory project store (swap for DB in production)
// ═══════════════════════════════════════════════════════════════

import type { Project } from "./types";

const projects = new Map<string, Project>();

export function getProject(id: string): Project | undefined {
  return projects.get(id);
}

export function saveProject(project: Project): void {
  projects.set(project.id, project);
}

export function listProjects(): Project[] {
  return Array.from(projects.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function deleteProject(id: string): boolean {
  return projects.delete(id);
}
