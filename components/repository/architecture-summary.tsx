"use client";

import React from "react";
import { FileText } from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";

interface ArchitectureSummaryProps {
  summary?: string;
}

export function ArchitectureSummary({ summary }: ArchitectureSummaryProps) {
  if (!summary) {
    return (
      <div className="h-[calc(100vh-220px)] flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-card/5 p-6 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
        <h3 className="text-sm font-semibold text-foreground/80">No architecture summary generated</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          An architecture analysis is built during repository indexing. Re-indexing will generate this report.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card/40 flex flex-col h-[calc(100vh-220px)]">
      <div className="flex items-center gap-2 text-foreground font-semibold text-xs px-4 py-2.5 bg-muted/90 backdrop-blur-xs border-b border-border/40 shrink-0">
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span>Architecture Summary Report</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
        <MessageResponse>{summary}</MessageResponse>
      </div>
    </div>
  );
}
