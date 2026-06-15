"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

import { Loader2, CheckCircle2, Clock, AlertCircle, Cpu } from "lucide-react";

export function AgentProgress({
  agents,
}: {
  agents: Array<{ name: string; status: "pending" | "running" | "done" | "error" }>;
}) {
  const isAnyRunning = agents.some((a) => a.status === "running" || a.status === "pending");
  const activeAgent = agents.find((a) => a.status === "running")?.name || "Review Coordinator";
  
  const agentDescriptions: Record<string, string> = {
    "Principal Architect Agent": "Analyzing system architecture, DB schema integrity, and overall design patterns.",
    "Senior Product Engineer Agent": "Reviewing code implementation, performance efficiency, and functional logic flows.",
    "Staff QA Engineer Agent": "Assessing validation structures, security exposures, and test coverage rules.",
    "Senior Code Quality Agent": "Scanning code styling guidelines, syntax standard formatting, and TS rules.",
    "Review Coordinator": "Synthesizing individual specialist findings into a unified, actionable review report."
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4 mb-2">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
          <Cpu className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground/95 flex items-center gap-2">
            Orchestrating Review Agents
            {isAnyRunning && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10 animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Live
              </span>
            )}
          </h3>
          <p className="text-[11px] text-muted-foreground truncate">
            {isAnyRunning ? `Running: ${activeAgent}` : "Review synthesis complete."}
          </p>
        </div>
      </div>

      {/* Agents Status Stack */}
      <div className="space-y-2.5">
        {agents.map((agent) => {
          const desc = agentDescriptions[agent.name] || "Processing changes...";

          const isRunning = agent.status === "running";
          const isDone = agent.status === "done";
          const isError = agent.status === "error";

          return (
            <div
              key={agent.name}
              className={cn(
                "flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-355",
                isRunning
                  ? "bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/5 scale-[1.01]"
                  : isDone
                  ? "bg-card/40 border-border/20 opacity-90"
                  : isError
                  ? "bg-destructive/5 border-destructive/25"
                  : "bg-muted/5 border-border/10 opacity-50"
              )}
            >
              {/* Status Indicator Icon */}
              <div className="mt-0.5 shrink-0">
                {isRunning ? (
                  <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center text-primary relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/30 opacity-75" />
                    <Loader2 className="h-3 w-3 animate-spin relative" />
                  </div>
                ) : isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : isError ? (
                  <AlertCircle className="h-5 w-5 text-destructive animate-bounce" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>

              {/* Agent Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn(
                    "text-xs font-semibold tracking-tight",
                    isRunning ? "text-primary" : "text-foreground/90"
                  )}>
                    {agent.name}
                  </h4>
                  
                  {/* Status Badge */}
                  <span className={cn(
                    "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border",
                    isRunning
                      ? "bg-primary/15 text-primary border-primary/25"
                      : isDone
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : isError
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-muted/40 text-muted-foreground/60 border-border/10"
                  )}>
                    {isRunning ? "RUNNING" : isDone ? "COMPLETED" : isError ? "FAILED" : "WAITING"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 max-w-md font-sans">
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-foreground/80">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

export function PulsingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
    </span>
  );
}
