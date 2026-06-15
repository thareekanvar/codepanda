/**
 * Diff Chunker — Splits large diffs into manageable chunks per-file.
 * Each agent gets the full diff, but truncated intelligently per file
 * rather than a hard cut at N characters.
 */

export interface DiffChunk {
  files: Array<{
    filename: string;
    status: string;
    patch: string;
  }>;
  totalChars: number;
  chunkIndex: number;
  totalChunks: number;
}

/**
 * Parse a unified diff into per-file sections.
 */
export function parseDiffByFile(diff: string): Array<{
  filename: string;
  status: string;
  patch: string;
}> {
  const files: Array<{ filename: string; status: string; patch: string }> = [];
  const filePattern = /^diff --git a\/(.+?) b\/(.+?)$/gm;

  const matches: Array<{ start: number; filename: string; status: string }> = [];
  let match;

  while ((match = filePattern.exec(diff)) !== null) {
    matches.push({
      start: match.index,
      filename: match[2],
      status: "modified",
    });
  }

  // Determine status from diff headers
  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].start : diff.length;
    const section = diff.slice(matches[i].start, end);

    // Detect status from new file / deleted file markers
    if (section.includes("new file mode")) {
      matches[i].status = "added";
    } else if (section.includes("deleted file mode")) {
      matches[i].status = "removed";
    } else if (section.includes("rename from")) {
      matches[i].status = "renamed";
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].start : diff.length;
    files.push({
      filename: matches[i].filename,
      status: matches[i].status,
      patch: diff.slice(matches[i].start, end).trim(),
    });
  }

  return files;
}

/**
 * Chunk a diff to fit within a character budget.
 * Prioritizes smaller files first, then truncates larger files with a marker.
 */
export function chunkDiff(
  diff: string,
  maxChars: number = 15000
): DiffChunk[] {
  const files = parseDiffByFile(diff);

  if (files.length === 0) {
    return [{
      files: [],
      totalChars: 0,
      chunkIndex: 0,
      totalChunks: 1,
    }];
  }

  const totalChars = files.reduce((sum, f) => sum + f.patch.length, 0);

  // If diff fits in one chunk, return as-is
  if (totalChars <= maxChars) {
    return [{
      files,
      totalChars,
      chunkIndex: 0,
      totalChunks: 1,
    }];
  }

  // Sort files by patch size (smallest first) to maximize coverage
  const sortedFiles = [...files].sort((a, b) => a.patch.length - b.patch.length);

  const chunks: DiffChunk[] = [];
  let currentChunk: DiffChunk["files"] = [];
  let currentSize = 0;

  for (const file of sortedFiles) {
    if (currentSize + file.patch.length <= maxChars) {
      currentChunk.push(file);
      currentSize += file.patch.length;
    } else if (currentChunk.length > 0) {
      // Save current chunk and start a new one
      chunks.push({
        files: currentChunk,
        totalChars: currentSize,
        chunkIndex: chunks.length,
        totalChunks: 0, // placeholder
      });
      currentChunk = [file];
      currentSize = file.patch.length;
    } else {
      // Single file exceeds budget — truncate with marker
      const truncated = file.patch.slice(0, maxChars - 100);
      currentChunk.push({
        ...file,
        patch: truncated + "\n\n[... TRUNCATED — full patch exceeds budget ...]",
      });
      currentSize = maxChars;
      chunks.push({
        files: currentChunk,
        totalChars: currentSize,
        chunkIndex: chunks.length,
        totalChunks: 0,
      });
      currentChunk = [];
      currentSize = 0;
    }
  }

  // Final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      files: currentChunk,
      totalChars: currentSize,
      chunkIndex: chunks.length,
      totalChunks: 0,
    });
  }

  // Fix totalChunks
  const total = chunks.length;
  for (const chunk of chunks) {
    chunk.totalChunks = total;
  }

  return chunks;
}

/**
 * Format a diff chunk for agent consumption.
 * Includes a file table of contents and per-file patches with line numbers.
 */
export function formatDiffChunk(chunk: DiffChunk): string {
  if (chunk.files.length === 0) {
    return "No code changes in this chunk.";
  }

  const toc = chunk.files
    .map((f) => `  - ${f.filename} (${f.status})`)
    .join("\n");

  const header = chunk.totalChunks > 1
    ? `[Chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks}]\n`
    : "";

  const files = chunk.files
    .map((f) => `\n## ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join("\n");

  return `${header}Files in this chunk:\n${toc}\n${files}`;
}

/**
 * Extract file names from a unified diff.
 */
export function extractFileNamesFromDiff(diff: string): string[] {
  const filePattern = /^diff --git a\/(.+?) b\/(.+?)$/gm;
  const files: string[] = [];
  let match;

  while ((match = filePattern.exec(diff)) !== null) {
    files.push(match[2]);
  }

  return files;
}
