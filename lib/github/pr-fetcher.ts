import type { PrMetadata, PrFile, PrData, ParsedPrUrl } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(accept?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept || "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Parse a GitHub PR URL into owner, repo, and pull number.
 * Supports formats:
 * - https://github.com/owner/repo/pull/123
 * - https://github.com/owner/repo/pull/123/files
 * - https://github.com/owner/repo/pull/123/commits
 */
export function parsePrUrl(url: string): ParsedPrUrl {
  const match = url.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/
  );

  if (!match) {
    throw new Error(
      `Invalid GitHub PR URL: ${url}. Expected format: https://github.com/owner/repo/pull/123`
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3], 10),
  };
}

/**
 * Fetch PR metadata (title, body, author, branches, etc.)
 */
export async function fetchPrMetadata(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PrMetadata> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to fetch PR metadata: ${response.status} ${response.statusText} - ${error}`
    );
  }

  const data = await response.json();

  return {
    title: data.title || "",
    body: data.body || "",
    state: data.state || "unknown",
    labels: (data.labels || []).map(
      (l: { name: string }) => l.name
    ),
    author: data.user?.login || "unknown",
    baseBranch: data.base?.ref || "",
    headBranch: data.head?.ref || "",
    createdAt: data.created_at || "",
    updatedAt: data.updated_at || "",
    additions: data.additions || 0,
    deletions: data.deletions || 0,
    changedFiles: data.changed_files || 0,
  };
}

/**
 * Fetch the unified diff for the entire PR.
 * Uses Accept: application/vnd.github.diff header.
 */
export async function fetchPrDiff(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`,
    { headers: getHeaders("application/vnd.github.diff") }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch PR diff: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

/**
 * Fetch the list of changed files with per-file patches.
 */
export async function fetchPrFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PrFile[]> {
  const files: PrFile[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=${perPage}&page=${page}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PR files: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) break;

    for (const file of data) {
      files.push({
        filename: file.filename,
        status: file.status,
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0,
        patch: file.patch,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return files;
}

/**
 * Fetch all PR data in one call: metadata, diff, and files.
 */
export async function fetchPrData(url: string): Promise<PrData> {
  const { owner, repo, pullNumber } = parsePrUrl(url);

  const [metadata, diff, files] = await Promise.all([
    fetchPrMetadata(owner, repo, pullNumber),
    fetchPrDiff(owner, repo, pullNumber),
    fetchPrFiles(owner, repo, pullNumber),
  ]);

  return { metadata, diff, files };
}
