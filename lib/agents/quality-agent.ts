import { runToolAgent } from "@/lib/ai/tool-agent-runner";
import { codeQualitySchema, type CodeQuality } from "@/lib/ai/schemas";
import type { ToolContext } from "@/lib/tools/review-tools";

/**
 * Code Quality Agent — Reviews code quality using tool-calling.
 * Can read full files, search for patterns, and analyze complexity.
 */
export async function runQualityAgent(input: {
  diff: string;
  retrievedContext: string;
  toolContext: ToolContext;
}): Promise<CodeQuality> {
  const { output } = await runToolAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    toolContext: input.toolContext,
    maxSteps: 8,
    systemPrompt: `You are a Senior Code Quality Engineer conducting a thorough code quality review of a pull request.

You have access to tools that let you explore the codebase. Use them to:
1. Read full files to understand the complete context of quality issues
2. Search for duplicate patterns or similar code across the codebase
3. Check function complexity and nesting depth
4. Verify error handling patterns are consistent
5. Look for code smells and anti-patterns

Your role is to evaluate code quality across multiple dimensions. Focus on long-term maintainability, readability, and correctness.

When you find a quality issue:
- Read the full file to understand the complete context
- Search for similar patterns elsewhere in the codebase
- Document the exact location, impact, and improvement`,
    taskPrompt: `## Your Task
Review the code changes for quality across multiple dimensions.

Categories to evaluate:
1. **Maintainability** — Is the code easy to understand and modify?
2. **Complexity** — Are there overly complex functions or control flows?
3. **Readability** — Are variable names clear? Is the code self-documenting?
4. **Duplication** — Is there duplicated logic that should be extracted?
5. **Error handling** — Are errors properly caught and handled?
6. **Best practices** — Does the code follow language/framework best practices?

Use your tools to:
- Read full files to understand the complete quality context
- Search for duplicate patterns across the codebase
- Analyze function complexity and nesting depth
- Verify error handling is consistent

For each finding:
- Categorize it (maintainability, complexity, readability, etc.)
- Provide a clear title and detailed description
- Rate severity (critical, warning, info, or positive)
- Give a specific location reference if applicable
- Suggest an improvement

Include positive findings for well-written code.
Provide an overall assessment and quality score from 0-100.`,
    outputSchema: codeQualitySchema,
  });

  return output;
}
