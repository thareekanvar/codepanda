import { runAgent } from "@/lib/ai/agent-runner";
import { architectureReviewSchema, type ArchitectureReview } from "@/lib/ai/schemas";

/**
 * Architecture Agent — Reviews code changes against repository conventions.
 * Acts as a Principal Software Architect.
 */
export async function runArchitectureAgent(input: {
  diff: string;
  architectureSummary: string;
  retrievedContext: string;
}): Promise<ArchitectureReview> {
  const { output } = await runAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    extraContext: `## Repository Architecture\n${input.architectureSummary}`,
    systemPrompt: `You are a Principal Software Architect conducting a thorough architecture review.

Your role is to evaluate code changes against the repository's established architecture and conventions. You must be specific — reference exact file paths, function names, and line numbers from the diff.

You MUST wrap up your analysis with a self-reflection on your confidence level, any uncertainty you had, and what additional context would improve your analysis.`,
    taskPrompt: `## Your Task
Review the code changes against the repository's established architecture and conventions.

Specifically check for:
1. **Architecture violations** — Does the code follow the established architecture pattern?
2. **Folder placement** — Are files in the correct directories based on project conventions?
3. **Naming convention violations** — Do new files, functions, and variables follow naming patterns?
4. **Service layer violations** — Is business logic properly separated from presentation?
5. **Repository pattern violations** — Is data access properly abstracted?
6. **Import patterns** — Do imports follow established conventions?
7. **Module boundaries** — Are module boundaries respected?

For each finding, provide:
- Clear title
- Detailed description with specific references to the diff
- Severity (critical, warning, info, or positive for good practices)
- Actionable recommendation

Also include positive findings where the code follows best practices.
Provide an overall assessment and a score from 0-100.`,
    outputSchema: architectureReviewSchema,
  });

  return output;
}
