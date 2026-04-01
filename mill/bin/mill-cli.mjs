#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    url: process.env.MILL_API_URL ?? "http://localhost:3000",
    out: "./generated-project",
    model: undefined,
    models: undefined,
    prompt: "",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--url") args.url = argv[++i];
    else if (token === "--out") args.out = argv[++i];
    else if (token === "--model") args.model = argv[++i];
    else if (token === "--models") args.models = argv[++i];
    else if (token === "--help" || token === "-h") args.help = true;
    else args.prompt = args.prompt ? `${args.prompt} ${token}` : token;
  }

  return args;
}

function printHelp() {
  console.log(`Nurds Agentic Mill CLI

Usage:
  npm run cli -- "build me a notes app"
  npm run cli -- --url http://localhost:3000 --out ./tmp/project "todo app with auth"
  npm run cli -- --model openai/gpt-5.4 "portfolio site"

Options:
  --url    Base URL where the mill app is running (default: http://localhost:3000)
  --out    Output folder for generated files (default: ./generated-project)
  --model  Optional model override; sent as x-openrouter-model header
  --models Optional fallback model list (comma-separated); sent as x-openrouter-models
  -h, --help  Show this help
`);
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeProjectFile(outputRoot, file) {
  const normalizedPath = String(file.path || "").replace(/^\/+/, "");
  const targetPath = path.join(outputRoot, normalizedPath);
  const resolvedRoot = path.resolve(outputRoot);
  const resolvedTarget = path.resolve(targetPath);

  if (!resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`) && resolvedTarget !== resolvedRoot) {
    throw new Error(`Unsafe file path received from pipeline: ${file.path}`);
  }

  await ensureDir(targetPath);
  await fs.writeFile(targetPath, file.content, "utf8");
  console.log(`📄 wrote ${normalizedPath}`);
}

async function run() {
  const args = parseArgs(process.argv);

  if (args.help || !args.prompt) {
    printHelp();
    if (!args.prompt && !args.help) process.exitCode = 1;
    return;
  }

  const endpoint = `${args.url.replace(/\/$/, "")}/api/orchestrate`;
  const headers = { "content-type": "application/json" };

  if (args.model) {
    headers["x-openrouter-model"] = args.model;
  }

  if (args.models) {
    headers["x-openrouter-models"] = args.models;
  }

  console.log(`🚀 Calling ${endpoint}`);
  console.log(`🧠 Prompt: ${args.prompt}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: args.prompt }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  await fs.mkdir(args.out, { recursive: true });

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      if (!frame.startsWith("data:")) continue;
      const payload = frame.slice(5).trim();
      if (!payload) continue;

      let event;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }

      if (event.type === "stage") {
        console.log(`\n🔄 stage: ${event.data.stage}`);
      }

      if (event.type === "message") {
        const { agent, type, content } = event.data;
        console.log(`💬 [${agent}:${type}] ${content}`);
      }

      if (event.type === "file") {
        await writeProjectFile(args.out, event.data);
      }

      if (event.type === "error") {
        throw new Error(event.data.error || "Pipeline error");
      }

      if (event.type === "done") {
        console.log(`\n✅ Done. Files saved to ${path.resolve(args.out)}`);
      }
    }
  }
}

run().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
