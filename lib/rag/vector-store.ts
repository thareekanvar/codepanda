import { supabase } from "@/lib/supabase/client";
import type { MatchedChunk, ChunkMetadata } from "@/lib/supabase/types";
import { generateEmbeddings, generateQueryEmbedding } from "./embeddings";
import type { TextChunk } from "./chunker";

/**
 * Store text chunks with embeddings in Supabase pgvector.
 * Generates embeddings in batch and performs a bulk insert.
 */
export async function storeChunks(
  repositoryId: string,
  chunks: TextChunk[]
): Promise<void> {
  if (chunks.length === 0) return;

  // Generate embeddings for all chunks
  const texts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(texts);

  // Prepare records for insertion
  const records = chunks.map((chunk, i) => ({
    repository_id: repositoryId,
    content: chunk.content,
    metadata: chunk.metadata,
    embedding: JSON.stringify(embeddings[i]),
  }));

  // Insert in batches of 50 to avoid request size limits
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase
      .from("repository_chunks")
      .insert(batch);

    if (error) {
      throw new Error(`Failed to store chunks: ${error.message}`);
    }
  }
}

/**
 * Delete all chunks for a repository (used before re-analysis).
 */
export async function deleteRepositoryChunks(
  repositoryId: string
): Promise<void> {
  const { error } = await supabase
    .from("repository_chunks")
    .delete()
    .eq("repository_id", repositoryId);

  if (error) {
    throw new Error(`Failed to delete chunks: ${error.message}`);
  }
}

/**
 * Retrieve the most relevant chunks for a given query.
 * Uses pgvector cosine similarity via the match_repository_chunks RPC.
 */
export async function retrieveRelevantChunks(
  repositoryId: string,
  query: string,
  topK: number = 10,
  threshold: number = 0.3
): Promise<MatchedChunk[]> {
  const queryEmbedding = await generateQueryEmbedding(query);

  const { data, error } = await supabase.rpc("match_repository_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: threshold,
    match_count: topK,
    filter_repository_id: repositoryId,
  });

  if (error) {
    throw new Error(`Failed to retrieve chunks: ${error.message}`);
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    metadata: row.metadata as ChunkMetadata,
    similarity: row.similarity as number,
  }));
}
