"use client";

import React, { useState } from "react";
import { ChevronRight, Layers } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import type { ArchitectureReview as ArchitectureReviewType } from "@/lib/ai/schemas";

interface ArchitectureReviewProps {
  overallAssessment: string;
  findings: ArchitectureReviewType["findings"];
}

export function ArchitectureReview({ overallAssessment, findings }: ArchitectureReviewProps) {
  // Initialize expanded state: critical findings are open by default, or the first finding if none are critical
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    const hasCritical = findings.some((f) => f.severity === "critical");
    findings.forEach((finding, idx) => {
      initial[idx] = hasCritical ? finding.severity === "critical" : idx === 0;
    });
    return initial;
  });

  const toggleFinding = (idx: number) => {
    setExpandedFindings((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground/80">Architectural Assessment</h3>
        <Message from="assistant" className="max-w-full">
          <MessageContent className="w-full bg-muted/15 border border-border/80 p-5 rounded-2xl text-sm leading-relaxed text-foreground/90">
            <MessageResponse>{overallAssessment}</MessageResponse>
          </MessageContent>
        </Message>
      </div>

      <Separator className="bg-border/20" />

      <div>
        <h4 className="text-sm font-semibold mb-4 text-foreground/85">Architectural Findings</h4>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No architectural concerns detected.</p>
        ) : (
          <div className="space-y-3 w-full max-w-full">
            {findings.map((finding, idx) => {
              const isExpanded = expandedFindings[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="border border-border/40 rounded-lg overflow-hidden bg-muted/5 transition-all duration-200 w-full max-w-full"
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleFinding(idx)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <Layers className="h-4 w-4 text-violet-500 shrink-0" />
                      <span className="font-sans text-xs font-semibold text-foreground/90 truncate">
                        {finding.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ml-2 ${getSeverityBadgeClass(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-border/20 bg-card/40 p-4 space-y-3 text-xs w-full max-w-full overflow-hidden">
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {finding.description}
                      </p>
                      {finding.location && (
                        <div className="text-[10px] text-muted-foreground font-mono bg-muted/40 rounded px-2.5 py-1 w-fit">
                          Location: {finding.location}
                        </div>
                      )}
                      <div className="text-xs text-violet-700 dark:text-violet-400 pt-2.5 border-t border-border/10 leading-relaxed w-full max-w-full">
                        <strong className="text-foreground/75 dark:text-foreground/90">Recommendation:</strong>{" "}
                        {finding.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
