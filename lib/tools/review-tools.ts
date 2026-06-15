/**
 * Tool Registry — Defines all tools available to review agents.
 * Agents can now read files, search git history, query GitHub, and more.
 */

import { tool } from "ai";
import { z } from "zod";
import { simpleGit } from "simple-git";

const GITHUB_API = "https://api.github.com";

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

export interface ToolContext {
  repoPath?: string;
  owner?: string;
  repo?: string;
  prNumber?: number;
}

/**
 * Build the full tool set for review agents.
 */
export function buildReviewTools(ctx: ToolContext) {
  return {
    // ─── File System Tools ─────────────────────────────────────

    readFile: tool({
      description:
        "Read the full contents of a file in the repository. Use this to understand the full context of a changed file beyond just the diff.",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Relative file path from the repo root"),
      }),
      execute: async ({ path }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const fs = await import("fs/promises");
        const fullPath = `${ctx.repoPath}/${path}`;
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const lines = content.split("\n");
          return {
            path,
            totalLines: lines.length,
            content:
              content.length > 20000
                ? content.slice(0, 20000) + "\n[...truncated]"
                : content,
          };
        } catch {
          return { error: `File not found: ${path}` };
        }
      },
    }),

    listDirectory: tool({
      description:
        "List files and subdirectories in a directory. Use to understand project structure.",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Relative directory path from the repo root"),
      }),
      execute: async ({ path }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const fs = await import("fs/promises");
        const fullPath = `${ctx.repoPath}/${path}`;
        try {
          const entries = await fs.readdir(fullPath, {
            withFileTypes: true,
          });
          return {
            path,
            entries: entries.map((e) => ({
              name: e.name,
              type: e.isDirectory() ? "directory" : "file",
            })),
          };
        } catch {
          return { error: `Directory not found: ${path}` };
        }
      },
    }),

    searchInFiles: tool({
      description:
        "Search for a pattern across all files in the repository. Use grep-like search to find usages, definitions, or patterns.",
      inputSchema: z.object({
        pattern: z
          .string()
          .describe("Regex pattern to search for"),
        filePattern: z
          .string()
          .optional()
          .describe("Glob pattern to filter files, e.g. *.ts or src/**/*.ts"),
      }),
      execute: async ({ pattern, filePattern }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const { execSync } = await import("child_process");
        try {
          const includeArg = filePattern
            ? `--include='${filePattern}'`
            : "--include='*.{ts,tsx,js,jsx,py,go,rs,java}'";
          const cmd = `grep -rn ${includeArg} '${pattern}' ${ctx.repoPath} --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git 2>/dev/null | head -50`;
          const output = execSync(cmd, { encoding: "utf-8", timeout: 10000 });
          const matches = output
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const relPath = line.replace(ctx.repoPath + "/", "");
              return relPath;
            });
          return {
            pattern,
            matchCount: matches.length,
            matches: matches.slice(0, 30),
          };
        } catch {
          return { pattern, matchCount: 0, matches: [] };
        }
      },
    }),

    // ─── Git Tools ─────────────────────────────────────────────

    gitLog: tool({
      description:
        "Get recent git commit history for a file or the whole repo. Use to understand code evolution and recent changes.",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("File path to get history for (omit for full repo history)"),
        maxCount: z
          .number()
          .optional()
          .describe("Maximum number of commits to return (default 10)"),
      }),
      execute: async ({ path, maxCount }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const git = simpleGit(ctx.repoPath);
        try {
          const log = await git.log({
            maxCount: maxCount || 10,
            file: path,
          });
          return {
            path: path || "(whole repo)",
            commits: log.all.map((c) => ({
              hash: c.hash.slice(0, 7),
              message: c.message,
              author: c.author_name,
              date: c.date,
            })),
          };
        } catch {
          return { error: "Git log failed" };
        }
      },
    }),

    gitBlame: tool({
      description:
        "Show who last modified each line of a file (git blame). Use to understand code ownership and find the context around changes.",
      inputSchema: z.object({
        path: z.string().describe("File path to blame"),
        startLine: z
          .number()
          .optional()
          .describe("Start line number (for large files)"),
        endLine: z
          .number()
          .optional()
          .describe("End line number (for large files)"),
      }),
      execute: async ({ path, startLine, endLine }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const { execSync } = await import("child_process");
        try {
          const cmd = `git -C ${ctx.repoPath} blame -L ${startLine || 1},${endLine || 99999} --porcelain ${path}`;
          const output = execSync(cmd, {
            encoding: "utf-8",
            timeout: 10000,
          });
          // Parse porcelain format
          const lines = output.split("\n");
          const authors: Record<string, number> = {};
          for (const line of lines) {
            if (line.startsWith("author ")) {
              const author = line.slice(7);
              authors[author] = (authors[author] || 0) + 1;
            }
          }
          return {
            path,
            lineRange: `${startLine || 1}-${endLine || "?"}`,
            authors: Object.entries(authors)
              .sort((a, b) => b[1] - a[1])
              .map(([name, lines]) => ({ name, lines })),
          };
        } catch {
          return { error: "Git blame failed" };
        }
      },
    }),

    gitSearchHistory: tool({
      description:
        "Search git history for commits that added/removed a specific string. Use to trace when code was introduced or deleted.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("String to search for in git history (like git log -S)"),
        maxCount: z
          .number()
          .optional()
          .describe("Maximum number of commits to return (default 10)"),
      }),
      execute: async ({ query, maxCount }) => {
        if (!ctx.repoPath) return { error: "No repo path available" };
        const git = simpleGit(ctx.repoPath);
        try {
          const log = await git.log({
            maxCount: maxCount || 10,
            "--S": query,
          });
          return {
            query,
            commits: log.all.map((c) => ({
              hash: c.hash.slice(0, 7),
              message: c.message,
              author: c.author_name,
              date: c.date,
            })),
          };
        } catch {
          return { error: "Git search failed" };
        }
      },
    }),

    // ─── GitHub API Tools ──────────────────────────────────────

    githubGetFile: tool({
      description:
        "Fetch the full content of a file from GitHub at a specific ref. Use to read files that aren't in the local clone.",
      inputSchema: z.object({
        path: z.string().describe("File path in the repo"),
        ref: z
          .string()
          .optional()
          .describe("Git ref (branch, tag, commit SHA). Default: PR head branch"),
      }),
      execute: async ({ path, ref }) => {
        if (!ctx.owner || !ctx.repo)
          return { error: "No GitHub repo info available" };
        const branch = ref || "main";
        try {
          const resp = await fetch(
            `${GITHUB_API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}?ref=${branch}`,
            { headers: githubHeaders() }
          );
          if (!resp.ok) return { error: `File not found: ${path}` };
          const data = await resp.json();
          const content = Buffer.from(
            (data as { content: string }).content,
            "base64"
          ).toString("utf-8");
          return {
            path,
            ref: branch,
            content:
              content.length > 20000
                ? content.slice(0, 20000) + "\n[...truncated]"
                : content,
          };
        } catch {
          return { error: `Failed to fetch file: ${path}` };
        }
      },
    }),

    githubGetPrFiles: tool({
      description:
        "Get the list of files changed in a PR with their patches. Use to understand the full scope of changes.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!ctx.owner || !ctx.repo || !ctx.prNumber)
          return { error: "No PR info available" };
        try {
          const resp = await fetch(
            `${GITHUB_API}/repos/${ctx.owner}/${ctx.repo}/pulls/${ctx.prNumber}/files?per_page=100`,
            { headers: githubHeaders() }
          );
          if (!resp.ok) return { error: "Failed to fetch PR files" };
          const files = await resp.json();
          return {
            files: (files as Array<Record<string, unknown>>).map((f) => ({
              filename: f.filename,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
              patch:
                typeof f.patch === "string"
                  ? f.patch.slice(0, 2000)
                  : undefined,
            })),
          };
        } catch {
          return { error: "Failed to fetch PR files" };
        }
      },
    }),

    githubSearchCode: tool({
      description:
        "Search for code across the GitHub repository. Use to find implementations, usages, or patterns.",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
      }),
      execute: async ({ query }) => {
        if (!ctx.owner || !ctx.repo)
          return { error: "No GitHub repo info available" };
        try {
          const searchQuery = `${query} repo:${ctx.owner}/${ctx.repo}`;
          const resp = await fetch(
            `${GITHUB_API}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=10`,
            { headers: githubHeaders() }
          );
          if (!resp.ok) return { error: "Search failed" };
          const data = await resp.json();
          return {
            query,
            totalCount: (data as { total_count: number }).total_count,
            results: (
              (data as { items: Array<Record<string, unknown>> }).items || []
            ).map((item) => ({
              path: item.path,
              name: item.name,
            })),
          };
        } catch {
          return { error: "GitHub search failed" };
        }
      },
    }),

    githubGetIssue: tool({
      description:
        "Fetch GitHub issue or PR details including body, labels, and comments. Use to understand requirements.",
      inputSchema: z.object({
        issueNumber: z
          .number()
          .optional()
          .describe("Issue/PR number (defaults to current PR)"),
      }),
      execute: async ({ issueNumber }) => {
        if (!ctx.owner || !ctx.repo)
          return { error: "No GitHub repo info available" };
        const num = issueNumber || ctx.prNumber;
        if (!num) return { error: "No issue number" };
        try {
          const resp = await fetch(
            `${GITHUB_API}/repos/${ctx.owner}/${ctx.repo}/issues/${num}`,
            { headers: githubHeaders() }
          );
          if (!resp.ok) return { error: "Issue not found" };
          const data = await resp.json();
          return {
            number: num,
            title: (data as { title: string }).title,
            body: ((data as { body: string }).body || "").slice(0, 5000),
            labels: (
              (data as { labels: Array<{ name: string }> }).labels || []
            ).map((l) => l.name),
            state: (data as { state: string }).state,
            author: (data as { user: { login: string } })?.user?.login,
          };
        } catch {
          return { error: "Failed to fetch issue" };
        }
      },
    }),

    // ─── Analysis Tools ────────────────────────────────────────

    getDiffStats: tool({
      description:
        "Get detailed statistics about the diff — which files changed, how many lines added/removed, and the risk score per file.",
      inputSchema: z.object({
        diff: z.string().describe("The unified diff to analyze"),
      }),
      execute: async ({ diff }) => {
        const files = diff.split(/^diff --git /m).filter(Boolean);
        const stats = files.map((f) => {
          const nameMatch = f.match(/b\/(.+?)$/m);
          const added = (f.match(/^\+[^+]/gm) || []).length;
          const removed = (f.match(/^-[^-]/gm) || []).length;
          const name = nameMatch?.[1] || "unknown";
          // Risk heuristic: config files and security-sensitive files are higher risk
          const highRiskPatterns =
            /auth|secret|config|env|token|password|credential|security/i;
          const risk = highRiskPatterns.test(name)
            ? "high"
            : added + removed > 100
              ? "medium"
              : "low";
          return { file: name, added, removed, risk };
        });
        return {
          totalFiles: stats.length,
          totalAdded: stats.reduce((s, f) => s + f.added, 0),
          totalRemoved: stats.reduce((s, f) => s + f.removed, 0),
          highRiskFiles: stats.filter((f) => f.risk === "high").map((f) => f.file),
          fileStats: stats,
        };
      },
    }),

    analyzeComplexity: tool({
      description:
        "Analyze code complexity of a file — cyclomatic complexity, nesting depth, function count, and lines of code.",
      inputSchema: z.object({
        content: z.string().describe("Source code content to analyze"),
      }),
      execute: async ({ content }) => {
        const lines = content.split("\n");
        const totalLines = lines.length;

        // Count functions
        const functionPatterns =
          /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(|(?:async\s+)?\w+\s*\([^)]*\)\s*(?::\s*\w+\s*)?{)/g;
        const functions = (content.match(functionPatterns) || []).length;

        // Estimate complexity via branching keywords
        const branches =
          (content.match(/\b(if|else if|else|switch|case|catch|for|while|do)\b/g) ||
            []).length;

        // Nesting depth
        let maxNesting = 0;
        let currentNesting = 0;
        for (const line of lines) {
          for (const char of line) {
            if (char === "{" || char === "(") {
              currentNesting++;
              maxNesting = Math.max(maxNesting, currentNesting);
            }
            if (char === "}" || char === ")") {
              currentNesting--;
            }
          }
        }

        // Complexity score (lower is better, 100 = perfectly simple)
        const complexityScore = Math.max(
          0,
          100 -
            branches * 2 -
            functions * 0.5 -
            maxNesting * 5 -
            (totalLines > 300 ? 20 : 0) -
            (totalLines > 500 ? 30 : 0)
        );

        return {
          totalLines,
          functions,
          branches,
          maxNesting,
          complexityScore: Math.round(complexityScore),
          assessment:
            complexityScore > 80
              ? "Good"
              : complexityScore > 60
                ? "Moderate"
                : complexityScore > 40
                  ? "Complex"
                  : "Very Complex",
        };
      },
    }),

    // ─── Web Search Tool ───────────────────────────────────────

    webSearch: tool({
      description:
        "Search the web for information about APIs, libraries, security vulnerabilities, or best practices. Use to verify external claims.",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
      }),
      execute: async ({ query }) => {
        try {
          // Use a simple web search via a public API
          const resp = await fetch(
            `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
            {
              headers: {
                Accept: "application/json",
                ...(process.env.BRAVE_API_KEY
                  ? { "X-Subscription-Token": process.env.BRAVE_API_KEY }
                  : {}),
              },
            }
          );
          if (!resp.ok) {
            // Fallback: just acknowledge the search was attempted
            return {
              query,
              results: [],
              note: "Web search not available — use your training knowledge instead.",
            };
          }
          const data = await resp.json();
          return {
            query,
            results: (
              (data as { web?: { results?: Array<{ title: string; url: string; description: string }> } }).web
                ?.results || []
            ).map(
              (r: { title: string; url: string; description: string }) => ({
                title: r.title,
                url: r.url,
                snippet: r.description?.slice(0, 200),
              })
            ),
          };
        } catch {
          return {
            query,
            results: [],
            note: "Web search unavailable.",
          };
        }
      },
    }),
  };
}

export type ReviewTools = ReturnType<typeof buildReviewTools>;
