import { simpleGit } from "simple-git";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
  ".cache",
  "__pycache__",
  ".turbo",
  ".vercel",
  ".output",
  "vendor",
  "target",
]);

const IGNORED_EXTENSIONS = new Set([
  ".lock",
  ".map",
  ".min.js",
  ".min.css",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".wav",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".DS_Store",
]);

const MAX_FILE_SIZE = 100 * 1024; // 100KB max per file
const MAX_FILES = 500; // Max files to scan

export interface ScannedFile {
  path: string;
  content: string;
  extension: string;
  sizeBytes: number;
}

export interface RepositoryScan {
  repoPath: string;
  files: ScannedFile[];
  fileTree: string[];
  packageJson?: Record<string, unknown>;
  configFiles: Record<string, string>;
  totalFiles: number;
  scannedFiles: number;
}

/**
 * Clone a GitHub repository into a temp directory.
 * Uses shallow clone (depth=1) for speed.
 */
export async function cloneRepository(url: string): Promise<string> {
  const tmpDir = path.join("/tmp", "ai-pair-engineer", uuidv4());
  await fs.mkdir(tmpDir, { recursive: true });

  const git = simpleGit();

  // Normalize URL - add .git suffix if missing
  const cloneUrl = url.endsWith(".git") ? url : `${url}.git`;

  await git.clone(cloneUrl, tmpDir, ["--depth", "1", "--single-branch"]);

  return tmpDir;
}

/**
 * Recursively scan a repository directory.
 */
export async function scanRepository(repoPath: string): Promise<RepositoryScan> {
  const files: ScannedFile[] = [];
  const fileTree: string[] = [];
  const configFiles: Record<string, string> = {};
  let totalFiles = 0;

  const configFileNames = new Set([
    "next.config.js",
    "next.config.ts",
    "next.config.mjs",
    "angular.json",
    "vue.config.js",
    "nuxt.config.ts",
    "nuxt.config.js",
    "vite.config.ts",
    "vite.config.js",
    "tsconfig.json",
    "tailwind.config.ts",
    "tailwind.config.js",
    ".eslintrc.js",
    ".eslintrc.json",
    "eslint.config.mjs",
    "Dockerfile",
    "docker-compose.yml",
    "nest-cli.json",
  ]);

  async function walk(dir: string, depth: number = 0): Promise<void> {
    if (depth > 10) return; // Max depth limit

    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= MAX_FILES) return;

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(repoPath, fullPath);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;

        fileTree.push(`${"  ".repeat(depth)}📁 ${entry.name}/`);
        await walk(fullPath, depth + 1);
      } else {
        totalFiles++;
        const ext = path.extname(entry.name).toLowerCase();

        if (IGNORED_EXTENSIONS.has(ext)) continue;

        fileTree.push(`${"  ".repeat(depth)}📄 ${entry.name}`);

        try {
          const stat = await fs.stat(fullPath);
          if (stat.size > MAX_FILE_SIZE) continue;

          const content = await fs.readFile(fullPath, "utf-8");

          files.push({
            path: relativePath,
            content,
            extension: ext,
            sizeBytes: stat.size,
          });

          // Capture config files
          if (configFileNames.has(entry.name)) {
            configFiles[entry.name] = content;
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  await walk(repoPath);

  // Parse package.json if exists
  let packageJson: Record<string, unknown> | undefined;
  try {
    const pkgContent = await fs.readFile(
      path.join(repoPath, "package.json"),
      "utf-8"
    );
    packageJson = JSON.parse(pkgContent);
  } catch {
    // No package.json
  }

  return {
    repoPath,
    files,
    fileTree,
    packageJson,
    configFiles,
    totalFiles,
    scannedFiles: files.length,
  };
}

/**
 * Clean up a cloned repository.
 */
export async function cleanupRepository(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch {
    console.error(`Failed to cleanup ${repoPath}`);
  }
}
