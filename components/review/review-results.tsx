"use client";

import { useState } from "react";
import { ScoreDashboard } from "./score-dashboard";
import { RetrievalDebug } from "./retrieval-debug";
import { ReviewScope } from "./review-scope";
import { ExecutiveSummary } from "./executive-summary";
import { ArchitectureReview } from "./architecture-review";
import { RequirementsAlignment } from "./requirements-alignment";
import { TestingReview } from "./testing-review";
import { CodeQuality } from "./code-quality";
import {
  ClipboardList,
  Layers,
  Target,
  FlaskConical,
  Gem,
  Settings2,
  FileText
} from "lucide-react";

interface ReviewResultData {
  [key: string]: unknown;
  architectureReview?: Record<string, unknown>;
  issueAlignment?: Record<string, unknown>;
  testingReview?: Record<string, unknown>;
  codeQuality?: Record<string, unknown>;
  securityReview?: Record<string, unknown>;
  performanceReview?: Record<string, unknown>;
  coordinatorReview?: Record<string, unknown>;
  retrievalDebug?: {
    totalChunksRetrieved: number;
    chunks: Array<{
      content: string;
      similarity: number;
      type: string;
      source: string;
    }>;
  };
}

interface ReviewResultsProps {
  result: ReviewResultData;
  issueDescription?: string;
}

export function ReviewResults({ result, issueDescription }: ReviewResultsProps) {
  const architectureReview = result.architectureReview as Record<string, unknown> | undefined;
  const issueAlignment = result.issueAlignment as Record<string, unknown> | undefined;
  const testingReview = result.testingReview as Record<string, unknown> | undefined;
  const codeQuality = result.codeQuality as Record<string, unknown> | undefined;
  const coordinatorReview = result.coordinatorReview as Record<string, unknown> | undefined;

  const [activeTab, setActiveTab] = useState<string>(
    issueDescription ? "scope" : "coordinator"
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 w-full max-w-full overflow-hidden">
      {/* Visual score dashboard header */}
      <ScoreDashboard
        overallScore={(coordinatorReview?.overallScore as number) || 0}
        architectureScore={(coordinatorReview?.architectureScore as number) || 0}
        issueAlignmentScore={(coordinatorReview?.issueAlignmentScore as number) || 0}
        codeQualityScore={(coordinatorReview?.codeQualityScore as number) || 0}
        testingScore={(coordinatorReview?.testingScore as number) || 0}
        recommendation={(coordinatorReview?.recommendation as "approve" | "approve_with_comments" | "request_changes") || "approve"}
      />

      <div className="w-full max-w-full overflow-hidden">
        {/* Workspace-aligned Tab List Header */}
        <div className="w-full border-b border-border/45 bg-muted/5 p-0 h-12 overflow-x-auto overflow-y-hidden px-6 flex items-center gap-4">
          {issueDescription && (
            <button
              type="button"
              onClick={() => setActiveTab("scope")}
              className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
                activeTab === "scope"
                  ? "border-primary text-foreground font-extrabold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              Review Scope
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("coordinator")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "coordinator"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
            Executive Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("architecture")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "architecture"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("issue")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "issue"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5 shrink-0" />
            Requirements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("testing")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "testing"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            Testing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quality")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "quality"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gem className="h-3.5 w-3.5 shrink-0" />
            Code Quality
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("debug")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === "debug"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings2 className="h-3.5 w-3.5 shrink-0" />
            Retrieval Debug
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="py-6 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
          {activeTab === "scope" && issueDescription && (
            <ReviewScope issueDescription={issueDescription} />
          )}

          {activeTab === "coordinator" && (
            <ExecutiveSummary
              summary={(coordinatorReview?.summary as string) || "No summary available."}
              criticalFindings={(coordinatorReview?.criticalFindings as string[]) || []}
              warnings={(coordinatorReview?.warnings as string[]) || []}
              positiveFeedback={(coordinatorReview?.positiveFeedback as string[]) || []}
            />
          )}

          {activeTab === "architecture" && (
            <ArchitectureReview
              overallAssessment={(architectureReview?.overallAssessment as string) || "No assessment available."}
              findings={(architectureReview?.findings as Array<{title: string; description: string; severity: "critical" | "warning" | "info" | "positive"; recommendation: string; location?: string}>) || []}
            />
          )}

          {activeTab === "issue" && (
            <RequirementsAlignment
              overallAssessment={(issueAlignment?.overallAssessment as string) || "No assessment available."}
              requirements={(issueAlignment?.requirements as Array<{requirement: string; status: "implemented" | "partially_implemented" | "not_implemented" | "over_implemented"; explanation: string; evidence?: string}>) || []}
              missingRequirements={(issueAlignment?.missingRequirements as string[]) || []}
              edgeCases={(issueAlignment?.edgeCases as string[]) || []}
            />
          )}

          {activeTab === "testing" && (
            <TestingReview
              testCoverage={(testingReview?.testCoverage as string) || "No coverage assessment available."}
              missingTests={(testingReview?.missingTests as Array<{type: "unit" | "integration" | "e2e" | "edge_case" | "performance" | "security"; scenario: string; reason: string; priority: "critical" | "high" | "medium" | "low"; suggestedCode?: string}>) || []}
            />
          )}

          {activeTab === "quality" && (
            <CodeQuality
              overallAssessment={(codeQuality?.overallAssessment as string) || "No assessment available."}
              findings={(codeQuality?.findings as Array<{category: "performance" | "security" | "maintainability" | "complexity" | "readability" | "duplication" | "error_handling" | "best_practices"; title: string; description: string; severity: "critical" | "warning" | "info" | "positive"; suggestion: string; location?: string}>) || []}
            />
          )}

          {activeTab === "debug" && result.retrievalDebug && (
            <RetrievalDebug debug={result.retrievalDebug} />
          )}
        </div>
      </div>
    </div>
  );
}
