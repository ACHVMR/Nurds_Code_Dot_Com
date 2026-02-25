// ═══════════════════════════════════════════════════════════════
// GET /api/workspace?id=... - Get project files
// POST /api/workspace - Update a file in a project
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { getProject, saveProject } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const project = getProject(id);
  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return Response.json({ files: project.files });
}

export async function POST(request: NextRequest) {
  const { projectId, path, content } = await request.json();

  const project = getProject(projectId);
  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileIndex = project.files.findIndex((f) => f.path === path);
  if (fileIndex >= 0) {
    project.files[fileIndex].content = content;
  } else {
    project.files.push({ path, content, language: "plaintext" });
  }

  project.updatedAt = Date.now();
  saveProject(project);

  return Response.json({ success: true });
}
