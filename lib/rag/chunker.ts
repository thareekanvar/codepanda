import type { ChunkMetadata } from "@/lib/supabase/types";

export interface TextChunk {
  content: string;
  metadata: ChunkMetadata;
}

const CHUNK_SIZE = 1500; // ~500 tokens (1 token ≈ 3 chars)
const CHUNK_OVERLAP = 150; // ~50 tokens overlap

/**
 * Split text into overlapping chunks while preserving code block boundaries.
 */
function splitText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];

  if (text.length <= chunkSize) {
    return [text.trim()].filter(Boolean);
  }

  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      // Try to break at a natural boundary
      const searchFrom = Math.max(start + chunkSize - 200, start);
      const searchText = text.slice(searchFrom, end);

      // Prefer breaking at double newlines, then single newlines, then spaces
      const doubleNewline = searchText.lastIndexOf("\n\n");
      if (doubleNewline !== -1) {
        end = searchFrom + doubleNewline + 2;
      } else {
        const singleNewline = searchText.lastIndexOf("\n");
        if (singleNewline !== -1) {
          end = searchFrom + singleNewline + 1;
        }
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

/**
 * Chunk an architecture summary into retrievable pieces.
 */
export function chunkArchitectureSummary(summary: string): TextChunk[] {
  const parts = splitText(summary, CHUNK_SIZE, CHUNK_OVERLAP);

  return parts.map((content, index) => ({
    content,
    metadata: {
      type: "architecture_summary" as const,
      chunkIndex: index,
      description: "Repository architecture summary",
    },
  }));
}

/**
 * Chunk folder summaries into retrievable pieces.
 */
export function chunkFolderSummaries(
  summaries: Array<{ path: string; name: string; description: string }>
): TextChunk[] {
  return summaries.map((summary) => ({
    content: `## ${summary.name}\nPath: ${summary.path}\n${summary.description}`,
    metadata: {
      type: "folder_summary" as const,
      folderPath: summary.path,
      description: summary.description,
    },
  }));
}

/**
 * Chunk source file content into retrievable pieces.
 */
export function chunkSourceFile(
  filePath: string,
  content: string
): TextChunk[] {
  const parts = splitText(content, CHUNK_SIZE, CHUNK_OVERLAP);

  return parts.map((chunk, index) => ({
    content: `// File: ${filePath}\n${chunk}`,
    metadata: {
      type: "source_file" as const,
      filePath,
      chunkIndex: index,
    },
  }));
}

/**
 * Chunk convention descriptions.
 */
export function chunkConventions(conventions: {
  hooks: string;
  services: string;
  components: string;
  api: string;
  files: string;
}): TextChunk[] {
  const content = [
    `## Naming Conventions`,
    `- Hook naming: ${conventions.hooks}`,
    `- Service naming: ${conventions.services}`,
    `- Component naming: ${conventions.components}`,
    `- API naming: ${conventions.api}`,
    `- File naming: ${conventions.files}`,
  ].join("\n");

  return [
    {
      content,
      metadata: {
        type: "convention" as const,
        description: "Project naming conventions",
      },
    },
  ];
}
