import { runAgent } from "@/lib/ai/agent-runner";
import { issueAlignmentSchema, type IssueAlignment } from "@/lib/ai/schemas";

/**
 * Issue Alignment Agent — Compares implementation against issue requirements.
 * Acts as a Senior Product Engineer.
 */
export async function runIssueAgent(input: {
  diff: string;
  issueDescription: string;
  retrievedContext: string;
}): Promise<IssueAlignment> {
  const { output } = await runAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    extraContext: `## Issue / Requirements\n${input.issueDescription}`,
    systemPrompt: `You are a Senior Product Engineer reviewing whether a pull request fully satisfies the issue requirements.

Your role is to map every requirement from the issue to evidence in the code changes. You must be thorough — don't assume a requirement is met without explicit code evidence.

You MUST wrap up your analysis with a self-reflection on your confidence level, any uncertainty you had, and what additional context would improve your analysis.`,
    taskPrompt: `## Your Task
Carefully analyze whether the implementation fully satisfies all requirements from the issue.

For each requirement you identify:
1. Determine if it is **implemented**, **partially_implemented**, **not_implemented**, or **over_implemented**
2. Provide specific evidence from the diff
3. Explain how the requirement is or isn't met

Also identify:
- **Missing requirements** — Things mentioned in the issue that aren't addressed
- **Edge cases** — Scenarios that should be handled but aren't
- Any **over-engineering** that goes beyond what was asked

Provide an overall assessment and a score from 0-100.`,
    outputSchema: issueAlignmentSchema,
  });

  return output;
}
