import { runArchitectureAgent } from "./architecture-agent";
import { runIssueAgent } from "./issue-agent";
import { runTestingAgent } from "./testing-agent";
import { runQualityAgent } from "./quality-agent";
import { runSecurityAgent } from "./security-agent";
import { runPerformanceAgent } from "./performance-agent";
import { runCoordinatorAgent } from "./coordinator-agent";
import { retrieveContext, type RetrievedContext } from "@/lib/rag/retriever";
import { fetchPrHistoryContext } from "@/lib/github/git-history";
import { parseDiffByFile } from "@/lib/ai/diff-chunker";
import { supabase } from "@/lib/supabase/client";
import type { ToolContext } from "@/lib/tools/review-tools";
import type {
  ArchitectureReview,
  IssueAlignment,
  TestingReview,
  CodeQuality,
  SecurityReview,
  PerformanceReview,
  CoordinatorReview,
} from "@/lib/ai/schemas";

export interface ReviewResult {
  architectureReview: ArchitectureReview;
  issueAlignment: IssueAlignment;
  testingReview: TestingReview;
  codeQuality: CodeQuality;
  securityReview: SecurityReview;
  performanceReview: PerformanceReview;
  coordinatorReview: CoordinatorReview;
  retrievalDebug: {
    totalChunksRetrieved: number;
    chunks: Array<{
      content: string;
      similarity: number;
      type: string;
      source: string;
    }>;
  };
}

/**
 * Parse a GitHub PR URL into owner, repo, and PR number.
 */
function parsePrUrl(url: string): { owner: string; repo: string; prNumber: number } | null {
  const match = url.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/
  );
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    prNumber: parseInt(match[3], 10),
  };
}

/**
 * Full review orchestrator:
 * 1. Retrieve context via RAG (diff-aware)
 * 2. Build tool context from PR URL
 * 3. Run 6 specialist agents with tool-calling in parallel
 * 4. Feed results to coordinator
 * 5. Return complete review with debug info
 */
export async function runReview(input: {
  repositoryId: string;
  issueDescription: string;
  codeDiff: string;
  prUrl?: string;
}): Promise<ReviewResult> {
  // Step 1: Get repository architecture summary
  const { data: repo } = await supabase
    .from("repositories")
    .select("architecture_summary")
    .eq("id", input.repositoryId)
    .single();

  if (!repo) {
    throw new Error("Repository not found. Please analyze the repository first.");
  }

  const architectureSummary = repo.architecture_summary || "No architecture summary available.";

  // Step 2: Retrieve relevant context via RAG (diff-aware)
  let retrievedCtx: RetrievedContext;
  try {
    retrievedCtx = await retrieveContext(
      input.repositoryId,
      input.issueDescription,
      input.codeDiff
    );
  } catch (error) {
    console.error("RAG retrieval failed, continuing without context:", error);
    retrievedCtx = {
      architectureContext: [],
      codeContext: [],
      conventionContext: [],
      fileContext: [],
      allChunks: [],
      formattedContext: "No additional context available.",
    };
  }

  // Step 2.5: Fetch git history context for changed files
  let gitHistoryContext = "";
  if (input.prUrl) {
    try {
      const changedFiles = parseDiffByFile(input.codeDiff);
      gitHistoryContext = await fetchPrHistoryContext(
        input.prUrl,
        changedFiles.map((f) => ({ filename: f.filename }))
      );
    } catch (error) {
      console.error("Git history fetch failed, continuing without history:", error);
    }
  }

  // Combine RAG context with git history
  const combinedContext = [
    retrievedCtx.formattedContext,
    gitHistoryContext ? `\n\n## Git History Context\n${gitHistoryContext}` : "",
  ].filter(Boolean).join("");

  // Step 2.6: Build tool context from PR URL
  const prInfo = input.prUrl ? parsePrUrl(input.prUrl) : null;
  const toolContext: ToolContext = {
    owner: prInfo?.owner,
    repo: prInfo?.repo,
    prNumber: prInfo?.prNumber,
  };

  // Step 3: Run 6 specialist agents in parallel with tool-calling
  const [architectureReview, issueAlignment, testingReview, codeQuality, securityReview, performanceReview] =
    await Promise.all([
      runArchitectureAgent({
        diff: input.codeDiff,
        architectureSummary,
        retrievedContext: combinedContext,
      }),
      runIssueAgent({
        diff: input.codeDiff,
        issueDescription: input.issueDescription,
        retrievedContext: combinedContext,
      }),
      runTestingAgent({
        diff: input.codeDiff,
        retrievedContext: combinedContext,
      }),
      runQualityAgent({
        diff: input.codeDiff,
        retrievedContext: combinedContext,
        toolContext,
      }),
      runSecurityAgent({
        diff: input.codeDiff,
        retrievedContext: combinedContext,
        toolContext,
      }),
      runPerformanceAgent({
        diff: input.codeDiff,
        retrievedContext: combinedContext,
        toolContext,
      }),
    ]);

  // Step 4: Run coordinator agent
  const coordinatorReview = await runCoordinatorAgent({
    architectureReview,
    issueAlignment,
    testingReview,
    codeQuality,
    securityReview,
    performanceReview,
  });

  // Build retrieval debug info
  const retrievalDebug = {
    totalChunksRetrieved: retrievedCtx.allChunks.length,
    chunks: retrievedCtx.allChunks.map((chunk) => ({
      content: chunk.content.slice(0, 300) + (chunk.content.length > 300 ? "..." : ""),
      similarity: chunk.similarity,
      type: chunk.metadata.type,
      source: chunk.metadata.filePath || chunk.metadata.folderPath || chunk.metadata.type,
    })),
  };

  return {
    architectureReview,
    issueAlignment,
    testingReview,
    codeQuality,
    securityReview,
    performanceReview,
    coordinatorReview,
    retrievalDebug,
  };
}
