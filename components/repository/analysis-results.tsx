"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ArchitectureAnalysis } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

interface AnalysisData {
  repositoryId: string;
  name: string;
  url: string;
  analysis: ArchitectureAnalysis;
}

const frameworkLabels: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  express: "Express",
  nestjs: "NestJS",
  vue: "Vue",
  angular: "Angular",
  nuxt: "Nuxt",
  fastify: "Fastify",
  other: "Other",
};

const patternLabels: Record<string, string> = {
  feature_based: "Feature-Based",
  layered: "Layered Architecture",
  service_layer: "Service Layer",
  repository_pattern: "Repository Pattern",
  mvc: "MVC",
  clean_architecture: "Clean Architecture",
  monolithic: "Monolithic",
  microservices: "Microservices",
  other: "Other",
};

function ScoreRing({ score, label, size = "lg" }: { score: number; label: string; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 45 : 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const viewBox = size === "lg" ? "0 0 100 100" : "0 0 64 64";
  const center = size === "lg" ? 50 : 32;

  const color =
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const bgColor =
    score >= 80 ? "stroke-emerald-500/10" : score >= 60 ? "stroke-amber-500/10" : "stroke-red-500/10";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg className={cn("transform -rotate-90", size === "lg" ? "w-24 h-24" : "w-16 h-16")} viewBox={viewBox}>
        <circle cx={center} cy={center} r={radius} fill="none" className={bgColor} strokeWidth={size === "lg" ? 6 : 4} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={color}
          stroke="currentColor"
          strokeWidth={size === "lg" ? 6 : 4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("fill-foreground font-bold transform rotate-90", size === "lg" ? "text-lg" : "text-xs")}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {score}
        </text>
      </svg>
      <span className={cn("font-medium text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>
        {label}
      </span>
    </div>
  );
}

export function AnalysisResults({ data }: { data: AnalysisData }) {
  const { analysis } = data;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Scorecard header */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-cyan-600/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{data.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono mt-1">{data.url}</p>
            </div>
            <ScoreRing score={analysis.healthScore} label="Health Score" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Detection badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
              {frameworkLabels[analysis.framework] || analysis.framework}
            </Badge>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              {analysis.language}
            </Badge>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              {patternLabels[analysis.architecturePattern] || analysis.architecturePattern}
            </Badge>
          </div>

          <Separator className="my-4 bg-border/30" />

          {/* Architecture summary */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-foreground/80">Architecture Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.architectureSummary}
            </p>
          </div>

          <Separator className="my-4 bg-border/30" />

          {/* Naming conventions */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-foreground/80">Naming Conventions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.namingConventions).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border/30 bg-muted/20 p-2.5 text-xs">
                  <span className="font-semibold text-foreground/70 capitalize">{key}:</span>{" "}
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4 bg-border/30" />

          {/* Folder summaries */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-foreground/80">Module Structure</h4>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {analysis.folderSummaries.map((folder, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/30 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">📁</span>
                      <span className="font-semibold text-sm text-foreground/80">{folder.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{folder.path}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{folder.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator className="my-4 bg-border/30" />

          {/* Strengths & Concerns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-emerald-400 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-0.5 text-emerald-500/60">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-amber-400 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Concerns
              </h4>
              <ul className="space-y-1.5">
                {analysis.concerns.map((c, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-0.5 text-amber-500/60">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
