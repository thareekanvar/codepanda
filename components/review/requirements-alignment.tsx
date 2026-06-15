"use client";

import React, { useState } from "react";
import { ChevronRight, Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { DiffViewer } from "./diff-viewer";
import type { IssueAlignment as IssueAlignmentType } from "@/lib/ai/schemas";

function isGitDiff(evidence: string): boolean {
  const clean = evidence.trim();
  return (
    clean.includes("diff --git") ||
    clean.includes("@@ -") ||
    clean.startsWith("```diff")
  );
}

function getCleanPatch(evidence: string): string {
  let patch = evidence.trim();
  if (patch.startsWith("```")) {
    const lines = patch.split("\n");
    if (lines.length > 2) {
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
      if (firstLine.startsWith("```") && lastLine === "```") {
        patch = lines.slice(1, -1).join("\n");
      }
    }
  }
  return patch;
}

interface RequirementsAlignmentProps {
  overallAssessment: string;
  requirements: IssueAlignmentType["requirements"];
  missingRequirements: string[];
  edgeCases: string[];
}

export function RequirementsAlignment({
  overallAssessment,
  requirements,
  missingRequirements,
  edgeCases,
}: RequirementsAlignmentProps) {
  // Initialize expanded state: not_implemented or partially_implemented requirements are open by default, or the first one if none match
  const [expandedReqs, setExpandedReqs] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    const hasUnimplemented = requirements.some(
      (r) => r.status === "not_implemented" || r.status === "partially_implemented"
    );
    requirements.forEach((req, idx) => {
      initial[idx] = hasUnimplemented
        ? req.status === "not_implemented" || req.status === "partially_implemented"
        : idx === 0;
    });
    return initial;
  });

  const toggleReq = (idx: number) => {
    setExpandedReqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "implemented":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "partially_implemented":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "not_implemented":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground/80">Requirement Coverage</h3>
        <Message from="assistant" className="max-w-full">
          <MessageContent className="w-full bg-muted/15 border border-border/80 p-5 rounded-2xl text-sm leading-relaxed text-foreground/90">
            <MessageResponse>{overallAssessment}</MessageResponse>
          </MessageContent>
        </Message>
      </div>

      <Separator className="bg-border/20" />

      <div className="space-y-3 w-full max-w-full">
        {requirements.map((req, idx) => {
          const isExpanded = expandedReqs[idx] ?? false;
          return (
            <div
              key={idx}
              className="border border-border/40 rounded-lg overflow-hidden bg-muted/5 transition-all duration-200 w-full max-w-full"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleReq(idx)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  <Target className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="font-sans text-xs font-semibold text-foreground/90 truncate">
                    {req.requirement}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ml-2 ${getStatusBadgeClass(
                    req.status
                  )}`}
                >
                  {getStatusLabel(req.status)}
                </span>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-border/20 bg-card/40 p-4 space-y-3 text-xs w-full max-w-full overflow-hidden">
                  <p className="text-xs text-foreground/85 leading-relaxed">{req.explanation}</p>
                  {req.evidence && (
                    <div className="space-y-2 w-full max-w-full overflow-hidden mt-2">
                      <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                        Evidence
                      </h4>
                      {isGitDiff(req.evidence) ? (
                        <div className="border border-border/40 rounded-lg bg-zinc-950/80 dark:bg-zinc-950/40 select-text overflow-auto w-full min-h-[200px] max-h-[360px] scrollbar-thin">
                          <DiffViewer patch={getCleanPatch(req.evidence)} />
                        </div>
                      ) : (
                        <pre className="text-[10px] text-zinc-700 dark:text-zinc-300 font-mono bg-muted/40 rounded p-2.5 leading-relaxed w-full max-w-full overflow-auto whitespace-pre-wrap min-h-[120px] max-h-[280px] scrollbar-thin">
                          {req.evidence}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {missingRequirements.length > 0 && (
        <>
          <Separator className="bg-border/20" />
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Missing Requirements</h4>
            <ul className="space-y-1.5">
              {missingRequirements.map((r, i) => (
                <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {edgeCases.length > 0 && (
        <>
          <Separator className="bg-border/20" />
          <div>
            <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Unhandled Edge Cases</h4>
            <ul className="space-y-1.5">
              {edgeCases.map((e, i) => (
                <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
