import { embed, embedMany } from "ai";
import { geminiEmbedding } from "@/lib/ai/model";

/**
 * Generate embeddings for multiple text values in batch.
 * Handles batching automatically with rate limiting.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Process in batches of 100 to avoid API limits
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const { embeddings } = await embedMany({
      model: geminiEmbedding,
      values: batch,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    });

    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

/**
 * Generate a single embedding for a query.
 * Used for similarity search queries.
 */
export async function generateQueryEmbedding(
  text: string
): Promise<number[]> {
  const { embedding } = await embed({
    model: geminiEmbedding,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  });

  return embedding;
}
