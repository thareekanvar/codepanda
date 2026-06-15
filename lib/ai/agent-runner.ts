/**
 * Agent Runner — Shared utilities for all specialist agents.
 * Includes self-reflection, confidence calibration, and chunked diff handling.
 */

import { generateText, Output } from "ai";
import { geminiFlash } from "./model";
import { chunkDiff, formatDiffChunk } from "./diff-chunker";
import { z } from "zod";

export const MAX_DIFF_CHARS = 15000;

// Self-reflection schema — every agent outputs this alongside their findings
export const selfReflectionSchema = z.object({
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("How confident you are in your findings (0-100)"),
  uncertaintyFlags: z
    .array(z.string())
    .describe("Areas where you were uncertain and why"),
  contextGaps: z
    .array(z.string())
    .describe("Information that would improve your analysis but wasn't available"),
  falsePositiveRisk: z
    .enum(["low", "medium", "high"])
    .describe("Risk that some findings may be false positives"),
});

export type SelfReflection = z.infer<typeof selfReflectionSchema>;

/**
 * Prepare diff for agent consumption — chunks if needed, formats nicely.
 * Returns either a single formatted diff or multiple chunks with metadata.
 */
export function prepareDiffForAgent(
  diff: string,
  maxChars: number = MAX_DIFF_CHARS
): { formatted: string; chunkCount: number } {
  const chunks = chunkDiff(diff, maxChars);

  if (chunks.length === 1) {
    return {
      formatted: formatDiffChunk(chunks[0]),
      chunkCount: 1,
    };
  }

  // Multiple chunks — format with clear separators
  const formatted = chunks
    .map((chunk) => formatDiffChunk(chunk))
    .join("\n\n---\n\n");

  return {
    formatted,
    chunkCount: chunks.length,
  };
}

/**
 * Parse files from a diff for targeted retrieval queries.
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

/**
 * Format retrieved context for injection into agent prompts.
 */
export function formatRetrievedContext(context: string): string {
  if (!context || context.trim() === "") {
    return "No additional repository context available.";
  }
  return `## Retrieved Repository Context\n${context}`;
}

/**
 * Run an agent with the standard pattern: prompt + output schema + self-reflection.
 */
export async function runAgent<T extends z.ZodType>(
  input: {
    diff: string;
    retrievedContext: string;
    systemPrompt: string;
    taskPrompt: string;
    outputSchema: T;
    extraContext?: string;
  }
): Promise<{ output: z.infer<T>; reflection: SelfReflection }> {
  const { formatted: formattedDiff, chunkCount } = prepareDiffForAgent(input.diff);

  const reflectionSchema = z.object({
    output: input.outputSchema,
    reflection: selfReflectionSchema,
  });

  const { output } = await generateText({
    model: geminiFlash,
    output: Output.object({ schema: reflectionSchema }),
    system: input.systemPrompt,
    prompt: `${input.extraContext ? input.extraContext + "\n\n" : ""}${formatRetrievedContext(input.retrievedContext)}

## Code Changes (Diff)
${formattedDiff}

${chunkCount > 1 ? `[Note: Diff was split into ${chunkCount} chunks due to size. Analyze all provided chunks.]\n\n` : ""}${input.taskPrompt}`,
  });

  if (!output) throw new Error("Agent failed to generate output");
  return output as { output: z.infer<T>; reflection: SelfReflection };
}
