import { google } from "@ai-sdk/google";

/**
 * Primary language model for all agent tasks.
 * Gemini 2.5 Flash — fast, capable, cost-effective.
 */
export const geminiFlash = google("gemini-2.5-flash");

/**
 * Embedding model for RAG pipeline.
 * gemini-embedding-001 — 768 dimensions, 100+ languages.
 */
export const geminiEmbedding = google.embedding("gemini-embedding-001");

/**
 * Embedding dimensions used across the application.
 * Must match the vector(N) in the Supabase schema.
 */
export const EMBEDDING_DIMENSIONS = 768;
