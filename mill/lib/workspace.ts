// ═══════════════════════════════════════════════════════════════
// Workspace - In-memory virtual file system for project generation
// ═══════════════════════════════════════════════════════════════

import type { ProjectFile } from "./types";

const EXT_TO_LANG: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescriptreact",
  ".js": "javascript",
  ".jsx": "javascriptreact",
  ".json": "json",
  ".html": "html",
  ".css": "css",
  ".md": "markdown",
  ".toml": "toml",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".sh": "shell",
  ".py": "python",
  ".sql": "sql",
  ".env": "plaintext",
  ".gitignore": "plaintext",
};

function detectLanguage(path: string): string {
  const ext = path.slice(path.lastIndexOf("."));
  const basename = path.split("/").pop() || "";
  if (basename === ".gitignore" || basename === ".env" || basename === ".env.local") {
    return "plaintext";
  }
  return EXT_TO_LANG[ext] || "plaintext";
}

export class Workspace {
  private files: Map<string, string> = new Map();

  writeFile(path: string, content: string): void {
    // Normalize path - strip leading slash
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    this.files.set(normalized, content);
  }

  readFile(path: string): string | null {
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    return this.files.get(normalized) ?? null;
  }

  deleteFile(path: string): boolean {
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    return this.files.delete(normalized);
  }

  listFiles(): string[] {
    return Array.from(this.files.keys()).sort();
  }

  getProjectFiles(): ProjectFile[] {
    return this.listFiles().map((path) => ({
      path,
      content: this.files.get(path)!,
      language: detectLanguage(path),
    }));
  }

  toJSON(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const [path, content] of this.files) {
      obj[path] = content;
    }
    return obj;
  }

  static fromJSON(data: Record<string, string>): Workspace {
    const ws = new Workspace();
    for (const [path, content] of Object.entries(data)) {
      ws.writeFile(path, content);
    }
    return ws;
  }
}
