"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
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
  Plus, 
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Queries & Components
import { useRepositoryQuery, useRepositoryReviewsQuery } from "@/hooks/use-repository";
import { RepoInfoPanel } from "@/components/repository/repo-info-panel";
import { WorkspaceTabs } from "@/components/repository/workspace-tabs";
import { ReviewHistoryList } from "@/components/repository/review-history-list";
import { ArchitectureSummary } from "@/components/repository/architecture-summary";



function RepositoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;

  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const pageVal = parseInt(searchParams.get("page") || "1", 10);
      return isNaN(pageVal) || pageVal < 1 ? 1 : pageVal;
    }
    return 1;
  });
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"history" | "summary">("history");

  const limit = 5;

  // Use modular queries
  const { data: repo, isLoading: loadingRepo, error: repoError } = useRepositoryQuery(repoId);
  const { data: reviewsData, isLoading: loadingReviews } = useRepositoryReviewsQuery(repoId, page, limit);

  const reviews = reviewsData?.data || [];
  const totalCount = reviewsData?.count || 0;
  const totalPages = reviewsData?.totalPages || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/repositories/${repoId}?page=${newPage}`);
  };

  if (repoError) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
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
              <h3 className="text-sm font-semibold text-destructive mb-1">Error Loading Repository</h3>
              <p className="text-xs text-muted-foreground mb-4">{repoError instanceof Error ? repoError.message : "Failed to load repo"}</p>
              <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>
                Go Back Home
              </Link>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
        {/* Unified Header */}
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
                  <BreadcrumbPage className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-primary" />
                    <span>{loadingRepo ? "Loading..." : repo?.name}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {repo && (
              <Link href={`/?repoId=${repo.id}&tab=review`} className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold flex items-center gap-1.5")}>
                <Plus className="h-3.5 w-3.5" />
                Review PR
              </Link>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Repository Workspace Panel */}
        {loadingRepo ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-background h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
            <span className="text-xs text-muted-foreground">Loading workspace metadata...</span>
          </div>
        ) : repo ? (
          <div className="flex-1 w-full flex flex-col overflow-hidden bg-background">
            <RepoInfoPanel repo={repo} />
            <WorkspaceTabs
              activeTab={activeWorkspaceTab}
              setActiveTab={setActiveWorkspaceTab}
              reviewCount={totalCount}
              hasSummary={!!repo.architecture_summary}
            />

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeWorkspaceTab === "history" ? (
                <ReviewHistoryList
                  repoId={repo.id}
                  reviews={reviews}
                  isLoading={loadingReviews}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              ) : (
                <ArchitectureSummary summary={repo.architecture_summary} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background h-full text-center">
            <Folder className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Workspace Not Found</h3>
            <p className="text-xs text-muted-foreground mb-4">The requested repository workspace is no longer active.</p>
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>
              Go Home
            </Link>
          </div>
        )}

        {/* Unified IDE Footer */}
        <footer className="h-7 shrink-0 flex items-center justify-between px-6 border-t border-border/40 bg-muted/30 text-[10px] font-mono text-muted-foreground select-none z-40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-500/95 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
            <span className="text-border/40">|</span>
            <span>View: Repo History</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Context: Repository-Aware</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function RepositoryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-background h-screen w-screen">
        <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
        <span className="text-xs text-zinc-400 font-mono">INITIALIZING WORKSPACE...</span>
      </div>
    }>
      <RepositoryPageContent />
    </Suspense>
  );
}
