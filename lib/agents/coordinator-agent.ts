import { generateText, Output } from "ai";
import { geminiFlash } from "@/lib/ai/model";
import {
  coordinatorSchema,
  type CoordinatorReview,
  type ArchitectureReview,
  type IssueAlignment,
  type TestingReview,
  type CodeQuality,
  type SecurityReview,
  type PerformanceReview,
} from "@/lib/ai/schemas";

/**
 * Coordinator Agent — Aggregates all specialist agent outputs into a final review.
 * Acts as the Engineering Manager making the final call.
 */
export async function runCoordinatorAgent(input: {
  architectureReview: ArchitectureReview;
  issueAlignment: IssueAlignment;
  testingReview: TestingReview;
  codeQuality: CodeQuality;
  securityReview: SecurityReview;
  performanceReview: PerformanceReview;
}): Promise<CoordinatorReview> {
  const { output } = await generateText({
    model: geminiFlash,
    output: Output.object({ schema: coordinatorSchema }),
    system: `You are a Staff Engineering Manager making the final review decision on a pull request.

You have received reports from six specialist reviewers. Synthesize their findings into a final, actionable review.

Your job is NOT to repeat what the specialists said. Your job is to:
1. Identify the most critical issues across ALL reviews
2. Resolve any conflicting signals between reviewers
3. Weight findings by severity and impact
4. Provide a clear, decisive recommendation
5. Calibrate your confidence based on the quality and agreement of the inputs`,
    prompt: `## Architecture Review (Score: ${input.architectureReview.score}/100)
Assessment: ${input.architectureReview.overallAssessment}
Findings:
${input.architectureReview.findings
  .map((f) => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`)
  .join("\n")}

## Issue Alignment Review (Score: ${input.issueAlignment.score}/100)
Assessment: ${input.issueAlignment.overallAssessment}
Requirements:
${input.issueAlignment.requirements
  .map((r) => `- [${r.status.toUpperCase()}] ${r.requirement}: ${r.explanation}`)
  .join("\n")}
Missing Requirements: ${input.issueAlignment.missingRequirements.join(", ") || "None"}
Edge Cases: ${input.issueAlignment.edgeCases.join(", ") || "None"}

## Testing Review (Score: ${input.testingReview.score}/100)
Coverage Assessment: ${input.testingReview.testCoverage}
Missing Tests:
${input.testingReview.missingTests
  .map((t) => `- [${t.priority.toUpperCase()}] ${t.type}: ${t.scenario} — ${t.reason}`)
  .join("\n")}

## Code Quality Review (Score: ${input.codeQuality.score}/100)
Assessment: ${input.codeQuality.overallAssessment}
Findings:
${input.codeQuality.findings
  .map((f) => `- [${f.severity.toUpperCase()}] ${f.category}: ${f.title} — ${f.description}`)
  .join("\n")}

## Security Review (Score: ${input.securityReview.score}/100)
Assessment: ${input.securityReview.overallAssessment}
Secrets Found: ${input.securityReview.secretsFound.join(", ") || "None"}
Findings:
${input.securityReview.findings
  .map((f) => `- [${f.severity.toUpperCase()}] ${f.vulnType}: ${f.title} — ${f.description}\n  Impact: ${f.impact}\n  Fix: ${f.remediation}`)
  .join("\n")}

## Performance Review (Score: ${input.performanceReview.score}/100)
Assessment: ${input.performanceReview.overallAssessment}
Bundle Impact: ${input.performanceReview.bundleImpact || "N/A"}
Findings:
${input.performanceReview.findings
  .map((f) => `- [${f.severity.toUpperCase()}] ${f.issueType}: ${f.title} — ${f.description}\n  Impact: ${f.impact}\n  Fix: ${f.suggestedFix}`)
  .join("\n")}

## Your Task
1. Calculate weighted scores for each area (use the specialist scores as inputs)
2. Identify the most critical findings across all reviews — prioritize security and correctness
3. Compile warnings that aren't blocking but should be noted
4. Highlight things done well (positive feedback)
5. Write a concise executive summary (3-5 sentences max)
6. Make a final recommendation: approve, approve_with_comments, or request_changes

Guidelines for recommendation:
- **approve**: No critical issues, all requirements met, code quality is good
- **approve_with_comments**: Minor issues that don't block merging, some improvements suggested
- **request_changes**: Critical issues, missing requirements, security concerns, or major quality problems

Also provide a confidence score (0-100) for how confident you are in this review.`,
  });

  if (!output) throw new Error("Coordinator agent failed to generate output");
  return output;
}
