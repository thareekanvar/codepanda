"use client";

import React, { useState } from "react";
import { ChevronRight, Database, Layers, BarChart2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RetrievalDebugProps {
  debug: {
    totalChunksRetrieved: number;
    chunks: Array<{
      type: string;
      source: string;
      content: string;
      similarity: number;
    }>;
  };
}

function getSimilarityTier(score: number): {
  label: string;
  labelClass: string;
  bar: string;
  scoreColor: string;
  border: string;
  glow: string;
} {
  if (score >= 0.8)
    return {
      label: "Excellent",
      labelClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      bar: "bg-emerald-500",
      scoreColor: "text-emerald-500",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    };
  if (score >= 0.7)
    return {
      label: "Good",
      labelClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      bar: "bg-cyan-500",
      scoreColor: "text-cyan-500",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
    };
  if (score >= 0.6)
    return {
      label: "Fair",
      labelClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      bar: "bg-amber-500",
      scoreColor: "text-amber-500",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    };
  return {
    label: "Low",
    labelClass: "bg-red-500/10 text-red-500 border-red-500/20",
    bar: "bg-red-500",
    scoreColor: "text-red-500",
    border: "border-red-500/20",
    glow: "shadow-red-500/10",
  };
}

function getTypeBadgeClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("convention") || t.includes("style"))
    return "bg-violet-500/10 text-violet-500 border-violet-500/20";
  if (t.includes("folder") || t.includes("summary") || t.includes("arch"))
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (t.includes("test"))
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (t.includes("api") || t.includes("endpoint"))
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  return "bg-muted text-muted-foreground border-border/40";
}

export function RetrievalDebug({ debug }: RetrievalDebugProps) {
  const [expandedChunks, setExpandedChunks] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      debug.chunks.forEach((_, idx) => {
        initial[idx] = idx < 2;
      });
      return initial;
    }
  );

  const toggleChunk = (idx: number) => {
    setExpandedChunks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-500 shrink-0" />
            RAG Context Debugger
          </h3>
          <p className="text-xs text-muted-foreground mt-1 pl-6">
            Review the database vector chunks the AI agent injected into context.
          </p>
        </div>
        {/* Stat pill */}
        <div className="shrink-0 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
          <BarChart2 className="h-3.5 w-3.5 text-cyan-500" />
          <span className="text-[11px] font-bold font-mono text-cyan-500">
            {debug.totalChunksRetrieved}
          </span>
          <span className="text-[10px] text-cyan-500/70 font-medium">chunks</span>
        </div>
      </div>

      {debug.chunks.length === 0 ? (
        <div className="border border-dashed border-border/40 rounded-xl p-10 text-center bg-muted/5">
          <Database className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No chunks retrieved for this analysis.</p>
        </div>
      ) : (
        <ScrollArea className="h-[520px] w-full max-w-full pr-1">
          <div className="space-y-2.5 w-full max-w-full overflow-hidden pb-4 pr-3">
            {debug.chunks.map((chunk, idx) => {
              const isExpanded = expandedChunks[idx] ?? false;
              const tier = getSimilarityTier(chunk.similarity);
              const typeBadgeClass = getTypeBadgeClass(chunk.type);
              const pct = Math.round(chunk.similarity * 100);

              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg border overflow-hidden transition-all duration-200 w-full",
                    "bg-card/40",
                    tier.border,
                    isExpanded && `shadow-md ${tier.glow}`
                  )}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleChunk(idx)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/10 transition-colors text-left group"
                  >
                    {/* Expand icon */}
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/50 shrink-0 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />

                    {/* DB icon */}
                    <Database className="h-3.5 w-3.5 text-cyan-500/70 shrink-0" />

                    {/* Type badge */}
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border shrink-0",
                        typeBadgeClass
                      )}
                    >
                      {chunk.type}
                    </span>

                    {/* Source path */}
                    <span className="font-mono text-[11px] text-muted-foreground/80 truncate flex-1 min-w-0">
                      {chunk.source}
                    </span>

                    {/* Right: mini bar + score + tier label */}
                    <div className="shrink-0 flex items-center gap-2 ml-2">
                      {/* Mini progress bar */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        <div className="w-14 h-1 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", tier.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-mono font-bold tabular-nums", tier.scoreColor)}>
                        {chunk.similarity.toFixed(4)}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                          tier.labelClass
                        )}
                      >
                        {tier.label}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border/20 bg-muted/10">
                      {/* Similarity meter */}
                      <div className="px-4 pt-3 pb-2.5 flex items-center gap-3 border-b border-border/10">
                        <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider shrink-0">
                          Similarity
                        </span>
                        <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", tier.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn("text-[11px] font-mono font-bold tabular-nums shrink-0", tier.scoreColor)}>
                          {pct}%
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="px-4 py-3">
                        <pre className="font-mono text-[11px] leading-relaxed text-foreground/75 bg-muted/20 rounded-lg p-3.5 border border-border/30 whitespace-pre-wrap break-words overflow-x-auto max-h-56 select-text">
                          {chunk.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
