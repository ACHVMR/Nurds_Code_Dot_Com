// ═══════════════════════════════════════════════════════════════
// POST /api/deploy - Package project files for download
// Future: deploy to Vercel/Cloudflare programmatically
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { getProject } from "@/lib/store";

export async function POST(request: NextRequest) {
  const { projectId } = await request.json();

  const project = getProject(projectId);
  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (project.files.length === 0) {
    return new Response(JSON.stringify({ error: "No files to deploy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Package files as a downloadable JSON bundle
  // In production, this would push to Vercel API or Cloudflare Pages API
  const bundle = {
    name: project.spec?.name || "project",
    framework: project.spec?.framework || "unknown",
    buildCommand: project.spec?.buildCommand || "npm run build",
    outputDir: project.spec?.outputDir || "dist",
    files: project.files.map((f) => ({
      path: f.path,
      content: f.content,
    })),
    instructions: [
      "1. Extract files into a new directory",
      "2. Run: npm install",
      `3. Run: ${project.spec?.devCommand || "npm run dev"}`,
      `4. Build: ${project.spec?.buildCommand || "npm run build"}`,
      "5. Deploy the output directory to your host of choice",
    ],
  };

  return Response.json(bundle);
}
