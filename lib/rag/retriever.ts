import { retrieveRelevantChunks } from "./vector-store";
import type { MatchedChunk } from "@/lib/supabase/types";
import { extractFileNamesFromDiff } from "@/lib/ai/diff-chunker";

export interface RetrievedContext {
  architectureContext: MatchedChunk[];
  codeContext: MatchedChunk[];
  conventionContext: MatchedChunk[];
  fileContext: MatchedChunk[];
  allChunks: MatchedChunk[];
  formattedContext: string;
}

/**
 * Retrieve relevant repository context for a review.
 * Combines multiple retrieval queries for comprehensive coverage:
 * - Architecture patterns from the issue description
 * - Code context from the actual diff content
 * - File-specific context for each changed file
 * - Naming conventions and patterns
 */
export async function retrieveContext(
  repositoryId: string,
  issueDescription: string,
  codeDiff: string
): Promise<RetrievedContext> {
  // Build focused queries for different aspects
  const architectureQuery = `architecture patterns conventions structure ${issueDescription}`;
  const codeQuery = `${codeDiff.slice(0, 2000)}`;
  const conventionQuery = `naming conventions hooks services components api patterns`;

  // Extract file names from diff for targeted retrieval
  const changedFiles = extractFileNamesFromDiff(codeDiff);

  // Run base retrievals in parallel
  const [architectureChunks, codeChunks, conventionChunks] = await Promise.all([
    retrieveRelevantChunks(repositoryId, architectureQuery, 5, 0.25),
    retrieveRelevantChunks(repositoryId, codeQuery, 5, 0.25),
    retrieveRelevantChunks(repositoryId, conventionQuery, 3, 0.25),
  ]);

  // Retrieve context for each changed file (parallel, top 3 per file, max 10 files)
  const fileQueries = changedFiles.slice(0, 10).map(async (filename) => {
    // Build a query from the filename parts
    const parts = filename.split("/").filter(Boolean);
    const query = parts.join(" ");
    const chunks = await retrieveRelevantChunks(repositoryId, query, 3, 0.2);
    return { filename, chunks };
  });

  const fileResults = await Promise.all(fileQueries);

  // Flatten file context
  const fileChunks: MatchedChunk[] = [];
  for (const result of fileResults) {
    for (const chunk of result.chunks) {
      // Tag the chunk with the file it relates to
      fileChunks.push({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          queriedFor: result.filename,
        },
      });
    }
  }

  // Deduplicate chunks by ID
  const seenIds = new Set<string>();
  const allChunks: MatchedChunk[] = [];

  for (const chunk of [
    ...architectureChunks,
    ...codeChunks,
    ...conventionChunks,
    ...fileChunks,
  ]) {
    if (!seenIds.has(chunk.id)) {
      seenIds.add(chunk.id);
      allChunks.push(chunk);
    }
  }

  // Sort by similarity
  allChunks.sort((a, b) => b.similarity - a.similarity);

  // Format context for injection into prompts
  const formattedContext = allChunks
    .map((chunk, i) => {
      const source =
        chunk.metadata.filePath ||
        chunk.metadata.folderPath ||
        chunk.metadata.type;
      const fileTag = chunk.metadata.queriedFor
        ? ` [related to ${chunk.metadata.queriedFor}]`
        : "";
      return `--- Context ${i + 1} [${chunk.metadata.type}]${fileTag} (similarity: ${chunk.similarity.toFixed(3)}) ---\nSource: ${source}\n${chunk.content}`;
    })
    .join("\n\n");

  return {
    architectureContext: architectureChunks,
    codeContext: codeChunks,
    conventionContext: conventionChunks,
    fileContext: fileChunks,
    allChunks,
    formattedContext,
  };
}
