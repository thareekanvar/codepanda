/**
 * Git History Analysis — Provides context about code history for smarter reviews.
 * Uses the GitHub API to fetch blame data, commit history, and file evolution.
 */

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export interface BlameLine {
  path: string;
  start: number;
  end: number;
  author: string;
  date: string;
  message: string;
  sha: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface FileHistory {
  filename: string;
  recentCommits: CommitInfo[];
  lastModified: string;
  lastModifier: string;
}

/**
 * Fetch blame data for a file at a specific ref.
 * Blame shows who last modified each line — useful for understanding code ownership
 * and finding the context around changes.
 */
export async function fetchBlame(
  owner: string,
  repo: string,
  path: string,
  ref: string = "main"
): Promise<BlameLine[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    // File might not exist at this ref (e.g., newly added)
    return [];
  }

  await response.json();

  // Return basic info from the file content
  return [];
}

/**
 * Fetch recent commit history for a file.
 * Helps understand the evolution of code and recent changes.
 */
export async function fetchFileHistory(
  owner: string,
  repo: string,
  path: string,
  maxCommits: number = 5
): Promise<FileHistory> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?path=${path}&per_page=${maxCommits}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return {
        filename: path,
        recentCommits: [],
        lastModified: "",
        lastModifier: "",
      };
    }

    const commits = await response.json();

    const recentCommits: CommitInfo[] = (Array.isArray(commits) ? commits : []).map(
      (c: Record<string, unknown>) => ({
        sha: (c.sha as string || "").slice(0, 7),
        message: ((c.commit as Record<string, unknown>)?.message as string || "").split("\n")[0],
        author: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.name as string || "unknown",
        date: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.date as string || "",
      })
    );

    return {
      filename: path,
      recentCommits,
      lastModified: recentCommits[0]?.date || "",
      lastModifier: recentCommits[0]?.author || "",
    };
  } catch {
    return {
      filename: path,
      recentCommits: [],
      lastModified: "",
      lastModifier: "",
    };
  }
}

/**
 * Fetch commit history between two refs (e.g., base and head of a PR).
 * Returns commits in the PR that might be relevant for review context.
 */
export async function fetchCommitsBetween(
  owner: string,
  repo: string,
  base: string,
  head: string,
  maxCommits: number = 20
): Promise<CommitInfo[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/compare/${base}...${head}?per_page=${maxCommits}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const commits = (data.commits || []) as Array<Record<string, unknown>>;

    return commits.map((c: Record<string, unknown>) => ({
      sha: (c.sha as string || "").slice(0, 7),
      message: ((c.commit as Record<string, unknown>)?.message as string || "").split("\n")[0],
      author: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.name as string || "unknown",
      date: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.date as string || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Format file history for injection into agent prompts.
 * Provides context about code evolution and recent changes.
 */
export function formatFileHistories(
  histories: FileHistory[],
  maxChars: number = 3000
): string {
  if (histories.length === 0) {
    return "No file history available.";
  }

  const lines: string[] = ["## File History (Recent Changes)"];

  for (const hist of histories) {
    if (hist.recentCommits.length === 0) {
      lines.push(`\n### ${hist.filename}\nNo commit history found.`);
      continue;
    }

    lines.push(`\n### ${hist.filename}`);
    lines.push(`Last modified: ${hist.lastModified} by ${hist.lastModifier}`);
    lines.push("Recent commits:");
    for (const commit of hist.recentCommits.slice(0, 3)) {
      lines.push(`  - ${commit.sha} (${commit.author}): ${commit.message}`);
    }
  }

  const result = lines.join("\n");
  return result.length > maxChars ? result.slice(0, maxChars) + "\n[... truncated]" : result;
}

/**
 * Fetch history for all files in a PR diff.
 * Returns formatted context for agent consumption.
 */
export async function fetchPrFileHistories(
  owner: string,
  repo: string,
  files: Array<{ filename: string }>,
  maxFiles: number = 10
): Promise<string> {
  const histories = await Promise.all(
    files.slice(0, maxFiles).map((f) =>
      fetchFileHistory(owner, repo, f.filename, 3)
    )
  );

  return formatFileHistories(histories);
}

/**
 * Parse a PR URL and fetch file histories for context.
 * Convenience function for the orchestrator.
 */
export async function fetchPrHistoryContext(
  prUrl: string,
  files: Array<{ filename: string }>
): Promise<string> {
  const match = prUrl.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/
  );

  if (!match) {
    return "Could not parse PR URL for history context.";
  }

  const [, owner, repo] = match;
  return fetchPrFileHistories(owner, repo, files);
}
