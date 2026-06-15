import { runAgent } from "@/lib/ai/agent-runner";
import { testingReviewSchema, type TestingReview } from "@/lib/ai/schemas";

/**
 * Testing Agent — Identifies missing test scenarios.
 * Acts as a Staff QA Engineer.
 */
export async function runTestingAgent(input: {
  diff: string;
  retrievedContext: string;
}): Promise<TestingReview> {
  const { output } = await runAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    systemPrompt: `You are a Staff QA Engineer reviewing a pull request for test coverage.

Your role is to identify every test scenario that should exist but doesn't. You think like a tester who tries to break things — edge cases, error paths, race conditions, security boundaries.

You MUST wrap up your analysis with a self-reflection on your confidence level, any uncertainty you had, and what additional context would improve your analysis.`,
    taskPrompt: `## Your Task
Generate a comprehensive list of missing test scenarios for the code changes.

For each missing test, provide:
1. **Test type** — unit, integration, e2e, edge_case, performance, or security
2. **Scenario** — Clear description of what should be tested
3. **Reason** — Why this test is important
4. **Priority** — critical, high, medium, or low
5. **Suggested code** — A brief skeleton of the test (optional)

Consider:
- Happy path tests
- Error handling tests
- Edge cases (empty inputs, null values, boundary conditions)
- Integration tests for interactions between components
- Security tests (input validation, authorization)
- Performance implications (N+1 queries, memory leaks)

Also assess the current test coverage based on what's visible in the diff.
Provide a testing completeness score from 0-100.`,
    outputSchema: testingReviewSchema,
  });

  return output;
}
