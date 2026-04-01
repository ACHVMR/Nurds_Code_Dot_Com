// ═══════════════════════════════════════════════════════════════
// POST /api/orchestrate - Start the Agentic Mill pipeline
// Streams agent activity as Server-Sent Events
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import { saveProject } from "@/lib/store";
import type { PipelineEvent } from "@/lib/types";

export async function POST(request: NextRequest) {
  let prompt: unknown;
  try {
    const body = await request.json();
    prompt = body?.prompt;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedPrompt = prompt.trim();

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const modelOverride = request.headers.get("x-openrouter-model")?.trim() || undefined;
  const fallbackModelsHeader = request.headers.get("x-openrouter-models")?.trim() || "";
  const fallbackModelsOverride = fallbackModelsHeader
    ? fallbackModelsHeader.split(",").map((m) => m.trim()).filter(Boolean)
    : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: PipelineEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        const project = await runPipeline(normalizedPrompt, emit, {
          modelOverride,
          fallbackModelsOverride,
        });
        saveProject(project);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", data: { error: msg } })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
