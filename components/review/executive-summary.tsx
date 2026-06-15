"use client";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { AlertOctagon, AlertTriangle, Star } from "lucide-react";

interface ExecutiveSummaryProps {
  summary: string;
  criticalFindings: string[];
  warnings: string[];
  positiveFeedback: string[];
}

export function ExecutiveSummary({
  summary,
  criticalFindings,
  warnings,
  positiveFeedback,
}: ExecutiveSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground/80">Review Summary</h3>
        <Message from="assistant" className="max-w-full">
          <MessageContent className="w-full bg-muted/15 border border-border/80 p-5 rounded-2xl text-sm leading-relaxed text-foreground/90">
            <MessageResponse>{summary}</MessageResponse>
          </MessageContent>
        </Message>
      </div>

      {criticalFindings.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
            <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
            Critical Findings (Must Fix)
          </h3>
          <div className="space-y-2">
            {criticalFindings.map((finding, idx) => (
              <div key={idx} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                {finding}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Warnings & Optimizations
          </h3>
          <ul className="space-y-2">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                <span className="mt-0.5 text-amber-500 shrink-0">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {positiveFeedback.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Positive Feedback
          </h3>
          <ul className="space-y-2">
            {positiveFeedback.map((feedback, idx) => (
              <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                <span className="mt-0.5 text-emerald-500 shrink-0">•</span>
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
