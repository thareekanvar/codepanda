/**
 * Tool Agent Runner — Runs agents with tool-calling capabilities.
 * Agents can now read files, search git, query GitHub, and more.
 */

import { generateText, Output, stepCountIs } from "ai";
import { geminiFlash } from "./model";
import { buildReviewTools, type ToolContext } from "@/lib/tools/review-tools";
import { prepareDiffForAgent, type SelfReflection } from "./agent-runner";
import { z } from "zod";

const MAX_STEPS = 8;

export interface ToolAgentResult<T> {
  output: T;
  reflection: SelfReflection;
  toolCalls: Array<{
    toolName: string;
    input: Record<string, unknown>;
    output: unknown;
  }>;
}

/**
 * Run an agent with tool-calling capabilities.
 * The agent can call tools to explore the repo, read files, search git, etc.
 * It runs in a loop: prompt → tool call → result → prompt → ... until done.
 */
export async function runToolAgent<T extends z.ZodType>(
  input: {
    diff: string;
    retrievedContext: string;
    systemPrompt: string;
    taskPrompt: string;
    outputSchema: T;
    extraContext?: string;
    toolContext: ToolContext;
    maxSteps?: number;
  }
): Promise<ToolAgentResult<z.infer<T>>> {
  const { formatted: formattedDiff, chunkCount } = prepareDiffForAgent(input.diff);
  const tools = buildReviewTools(input.toolContext);

  const reflectionSchema = z.object({
    output: input.outputSchema,
    reflection: selfReflectionSchema,
  });

  const { output, steps } = await generateText({
    model: geminiFlash,
    tools,
    stopWhen: stepCountIs(input.maxSteps || MAX_STEPS),
    output: Output.object({ schema: reflectionSchema }),
    system: input.systemPrompt,
    prompt: `${input.extraContext ? input.extraContext + "\n\n" : ""}## Retrieved Repository Context
${input.retrievedContext}

## Code Changes (Diff)
${formattedDiff}

${chunkCount > 1 ? `[Note: Diff was split into ${chunkCount} chunks due to size. Analyze all provided chunks.]\n\n` : ""}${input.taskPrompt}

## Tool Usage Guidelines
You have access to tools that let you explore the codebase. Use them to:
1. Read full files when the diff is unclear or you need more context
2. Search for usages of changed functions/classes
3. Check git history when you see deleted or refactored code
4. Look up external APIs or libraries when verifying claims
5. Get the full list of changed files to understand PR scope

Call tools as needed, then produce your final structured output.`,
  });

  if (!output) throw new Error("Agent failed to generate output");

  // Extract tool calls from all steps
  const toolCalls = steps.flatMap((step) =>
    step.toolCalls.map((tc) => {
      const toolResult = step.toolResults.find(
        (tr) => tr.toolCallId === tc.toolCallId
      );
      return {
        toolName: tc.toolName,
        input: tc.input as Record<string, unknown>,
        output: toolResult
          ? ("result" in toolResult ? toolResult.result : ("output" in toolResult ? (toolResult as { output: unknown }).output : toolResult))
          : undefined,
      };
    })
  );

  const result = output as { output: z.infer<T>; reflection: SelfReflection };
  return {
    output: result.output,
    reflection: result.reflection,
    toolCalls,
  };
}

// Self-reflection schema (reused from agent-runner)
const selfReflectionSchema = z.object({
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
    .describe(
      "Information that would improve your analysis but wasn't available"
    ),
  falsePositiveRisk: z
    .enum(["low", "medium", "high"])
    .describe("Risk that some findings may be false positives"),
});
