// ═══════════════════════════════════════════════════════════════
// GET /api/projects - List all projects
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { listProjects, getProject } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const project = getProject(id);
    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return Response.json(project);
  }

  const projects = listProjects().map((p) => ({
    id: p.id,
    prompt: p.prompt.slice(0, 100),
    stage: p.stage,
    name: p.spec?.name || "untitled",
    framework: p.spec?.framework || "unknown",
    fileCount: p.files.length,
    createdAt: p.createdAt,
  }));

  return Response.json(projects);
}
