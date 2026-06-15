"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { ReviewResults } from "@/components/review/review-results";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { 
  Code, 
  Folder, 
  GitPullRequest, 
  Calendar, 
  Plus, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewResult } from "@/hooks/use-repository";

interface Repository {
  id: string;
  name: string;
  url: string;
}

interface Review {
  id: string;
  pr_url?: string;
  issue_description?: string;
  result: ReviewResult;
  created_at: string;
  repositories: Repository;
}

function ReviewDetailsPageContent() {
  const params = useParams();
  const reviewId = params.id as string;

  // Fetch review details using TanStack Query
  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review-details", reviewId],
    queryFn: async () => {
      const res = await fetch(`/api/review/${reviewId}`);
      if (!res.ok) throw new Error("Failed to fetch review details");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Review not found");
      return json.data as Review;
    },
    enabled: !!reviewId,
  });

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background flex flex-col min-h-screen">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/10 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <Code className="h-3.5 w-3.5" />
                      AI Pair Engineer
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 flex items-center justify-center p-6 bg-background">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-md">
              <h3 className="text-sm font-semibold text-destructive mb-1">Error Loading Review</h3>
              <p className="text-xs text-muted-foreground mb-4">{error instanceof Error ? error.message : "Failed to load review"}</p>
              <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>
                Go Back Home
              </Link>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isLoading || !review) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background flex flex-col min-h-screen">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/10 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <Code className="h-3.5 w-3.5" />
                      AI Pair Engineer
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 flex flex-col items-center justify-center bg-background h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
            <span className="text-xs text-muted-foreground">Loading review report...</span>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const repo = review.repositories;
  const resultObj = review.result;

  // Extract PR title or PR number
  const prMatch = review.pr_url?.match(/\/pull\/(\d+)/);
  const prNumber = prMatch ? `#${prMatch[1]}` : "";
  const prTitle = review.issue_description?.split("\n")[0] || "Review";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/10 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Code className="h-3.5 w-3.5" />
                    AI Pair Engineer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/repositories/${repo.id}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Folder className="h-3.5 w-3.5" />
                    {repo.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                    <span>PR {prNumber || "Review Details"}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/?repoId=${repo.id}&tab=review`} className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold flex items-center gap-1.5")}>
              <Plus className="h-3.5 w-3.5" />
              Review PR
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* PR Info Header Panel */}
        <div className="w-full shrink-0 border-b border-border/40 bg-muted/15 px-6 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-wider text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                  PR {prNumber || "Report"}
                </span>
                <h1 className="text-sm font-bold tracking-tight text-foreground/95">
                  {prTitle.replace(/^PR Title:\s*/i, "")}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                  REVIEWED ON: {new Date(review.created_at).toLocaleString()}
                </span>
                {review.pr_url && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <a
                      href={review.pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-primary inline-flex items-center gap-0.5 font-medium"
                    >
                      GITHUB PR LINK <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Content */}
        <main className="flex-1 w-full p-6 overflow-y-auto space-y-6 min-w-0 max-w-full">
          {/* Review Results Render */}
          <ReviewResults result={resultObj} issueDescription={review.issue_description} />
        </main>

        {/* Footer */}
        <footer className="h-7 shrink-0 flex items-center justify-between px-6 border-t border-border/40 bg-muted/30 text-[10px] font-mono text-muted-foreground select-none z-40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-500/95 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
            <span className="text-border/40">|</span>
            <span>View: Review Details</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Review ID: {review.id}</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ReviewDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-background h-screen w-screen">
        <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
        <span className="text-xs text-zinc-400 font-mono">INITIALIZING REVIEW DETAILS...</span>
      </div>
    }>
      <ReviewDetailsPageContent />
    </Suspense>
  );
}
