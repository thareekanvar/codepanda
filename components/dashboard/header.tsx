"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-background/80">
      {/* Animated mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/10%,transparent)]" />
        <div className="absolute top-0 left-1/4 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-0 right-1/4 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl [animation-delay:1s]" />
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <h1 className={cn(
                 "text-3xl font-bold tracking-tight",
                 "bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
              )}>
                AI Pair Engineer
              </h1>
              <span className="rounded-full bg-gradient-to-r from-primary/10 to-primary/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
                Beta
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
          Repository-aware AI code review powered by architecture understanding,
          issue alignment, and multi-agent analysis. Review code like a Staff Engineer.
        </p>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { label: "Architecture Analysis", icon: "🏗️" },
            { label: "Multi-Agent Review", icon: "🤖" },
            { label: "RAG-Powered", icon: "🔍" },
            { label: "PR Integration", icon: "🔗" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
            >
              <span>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
