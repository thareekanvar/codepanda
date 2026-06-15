"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Target,
  FlaskConical,
  Gem,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ScoreDashboardProps {
  overallScore: number;
  architectureScore: number;
  issueAlignmentScore: number;
  codeQualityScore: number;
  testingScore: number;
  recommendation: "approve" | "approve_with_comments" | "request_changes";
}

const recommendationLabels = {
  approve: {
    label: "Approved",
    sub: "Matches all standards. Safe to merge.",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle,
  },
  approve_with_comments: {
    label: "Approve with comments",
    sub: "Minor suggestions identified. Review changes.",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  request_changes: {
    label: "Request changes",
    sub: "Critical findings must be resolved before merge.",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: XCircle,
  },
};

function BentoCard({
  title,
  score,
  icon: Icon,
  description,
  colorClass,
}: {
  title: string;
  score: number;
  icon: React.ElementType;
  description: string;
  colorClass: string;
}) {
  const barColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="group border border-border/40 bg-card/20 hover:bg-card/45 hover:border-border/80 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-sm">
      {/* Hover glow effect */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <p className="text-2xl font-extrabold tracking-tight text-foreground/90">
            {score}%
          </p>
        </div>
        <div className={cn("p-2 rounded-xl border shrink-0 bg-muted/10", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ScoreDashboard({
  overallScore,
  architectureScore,
  issueAlignmentScore,
  codeQualityScore,
  testingScore,
  recommendation,
}: ScoreDashboardProps) {
  const rec = recommendationLabels[recommendation];
  const RecIcon = rec.icon;

  // Circular progress calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Hero Bento Card - Overall Score */}
      <div className="md:col-span-2 md:row-span-2 border border-border/40 bg-card/20 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[240px] relative overflow-hidden backdrop-blur-sm text-center">
        {/* Subtle radial gloss gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Overall review score
        </span>

        {/* Dynamic Circular SVG Progress */}
        <div className="relative flex items-center justify-center w-28 h-28 my-3">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circular track */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-muted/15"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Foreground animated dynamic path */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={cn(
                "transition-all duration-1000 ease-out",
                overallScore >= 80
                  ? "stroke-emerald-500"
                  : overallScore >= 60
                  ? "stroke-amber-500"
                  : "stroke-red-500"
              )}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black tracking-tight text-foreground">
              {overallScore}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Score
            </span>
          </div>
        </div>

        {/* Recommendation capsule */}
        <div className="space-y-1.5 mt-1 w-full flex flex-col items-center">
          <Badge variant="outline" className={cn("text-xs px-3 py-1 font-bold tracking-wide flex items-center gap-1.5 border", rec.color)}>
            <RecIcon className="h-3.5 w-3.5" />
            {rec.label}
          </Badge>
          <p className="text-[10px] text-muted-foreground max-w-[220px] leading-normal font-medium">
            {rec.sub}
          </p>
        </div>
      </div>

      {/* Bento sub-score item 1: Architecture */}
      <div className="md:col-span-1">
        <BentoCard
          title="Architecture Compliance"
          score={architectureScore}
          icon={Layers}
          description="Modularity, pattern compliance, and convention adherence."
          colorClass="text-violet-400 border-violet-500/10 bg-violet-500/5"
        />
      </div>

      {/* Bento sub-score item 2: Requirements */}
      <div className="md:col-span-1">
        <BentoCard
          title="Issue Requirements Alignment"
          score={issueAlignmentScore}
          icon={Target}
          description="Verification of implemented issue features and scope coverage."
          colorClass="text-sky-400 border-sky-500/10 bg-sky-500/5"
        />
      </div>

      {/* Bento sub-score item 3: Code Quality */}
      <div className="md:col-span-1">
        <BentoCard
          title="Code Quality & Complexity"
          score={codeQualityScore}
          icon={Gem}
          description="Readability, best practices, and code complexity scores."
          colorClass="text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
        />
      </div>

      {/* Bento sub-score item 4: Testing Completeness */}
      <div className="md:col-span-1">
        <BentoCard
          title="Testing Coverage"
          score={testingScore}
          icon={FlaskConical}
          description="Presence of relevant tests and edge cases coverage validation."
          colorClass="text-rose-400 border-rose-500/10 bg-rose-500/5"
        />
      </div>
    </div>
  );
}
