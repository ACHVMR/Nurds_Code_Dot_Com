"use client";

import { useMillStore } from "@/lib/use-mill-store";

const FILE_ICONS: Record<string, string> = {
  ts: "TS",
  tsx: "TX",
  js: "JS",
  jsx: "JX",
  json: "{}",
  html: "<>",
  css: "#",
  md: "MD",
  toml: "TM",
  yaml: "YM",
  yml: "YM",
  sh: "$",
  py: "PY",
  sql: "DB",
  gitignore: "GI",
  env: "EN",
};

function getIcon(path: string): string {
  const ext = path.split(".").pop() || "";
  const basename = path.split("/").pop() || "";
  if (basename.startsWith(".")) return FILE_ICONS[basename.slice(1)] || "··";
  return FILE_ICONS[ext] || "··";
}

function getColor(path: string): string {
  const ext = path.split(".").pop() || "";
  switch (ext) {
    case "ts":
    case "tsx":
      return "#3178c6";
    case "js":
    case "jsx":
      return "#f0db4f";
    case "json":
      return "#8bc34a";
    case "html":
      return "#e44d26";
    case "css":
      return "#264de4";
    case "md":
      return "#888888";
    default:
      return "var(--text-secondary)";
  }
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of paths) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join("/");

      let node = current.find((n) => n.name === name);
      if (!node) {
        node = {
          name,
          path: fullPath,
          isDir: !isLast,
          children: [],
        };
        current.push(node);
      }
      current = node.children;
    }
  }

  return root;
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const activeFile = useMillStore((s) => s.activeFile);
  const setActiveFile = useMillStore((s) => s.setActiveFile);
  const isActive = activeFile === node.path;

  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono cursor-default"
          style={{
            paddingLeft: `${depth * 12 + 8}px`,
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ fontSize: "8px" }}>▾</span>
          <span>{node.name}</span>
        </div>
        {node.children
          .sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .map((child) => (
            <TreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveFile(node.path)}
      className="w-full flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono text-left transition-colors"
      style={{
        paddingLeft: `${depth * 12 + 8}px`,
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
      }}
    >
      <span
        className="text-[9px] font-bold shrink-0 w-4 text-center"
        style={{ color: getColor(node.path) }}
      >
        {getIcon(node.path)}
      </span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree() {
  const files = useMillStore((s) => s.files);
  const tree = buildTree(files.map((f) => f.path));

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs font-mono border-b"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        EXPLORER
        <span className="ml-auto" style={{ color: "var(--text-muted)" }}>
          {files.length} files
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="px-3 py-4 text-xs font-mono text-center"
               style={{ color: "var(--text-muted)" }}>
            No files yet
          </div>
        ) : (
          tree
            .sort((a, b) => {
              if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((node) => (
              <TreeItem key={node.path} node={node} depth={0} />
            ))
        )}
      </div>
    </div>
  );
}
