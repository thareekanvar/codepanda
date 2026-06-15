"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/components/app-context";
import { AnalyzerForm } from "@/components/repository/analyzer-form";
import { ReviewForm } from "@/components/review/review-form";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Code, GitPullRequest, Database } from "lucide-react";

function UrlStateSync() {
  const searchParams = useSearchParams();
  const { setSelectedRepoId, setActiveTab } = useApp();

  useEffect(() => {
    const repoId = searchParams.get("repoId");
    if (repoId) {
      setSelectedRepoId(repoId);
    }
    const tab = searchParams.get("tab");
    if (tab === "review" || tab === "analyze") {
      setActiveTab(tab as "review" | "analyze");
    }
  }, [searchParams, setSelectedRepoId, setActiveTab]);

  return null;
}

export default function Home() {
  const { activeTab } = useApp();

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <UrlStateSync />
      </Suspense>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
        {/* Workspace Toolbar Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/10 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-muted" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Code className="h-3.5 w-3.5" />
                    AI Pair Engineer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {activeTab === "review" ? (
                      <>
                        <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                        <span>PR Reviewer</span>
                      </>
                    ) : (
                      <>
                        <Database className="h-3.5 w-3.5 text-primary" />
                        <span>Repository Analyzer</span>
                      </>
                    )}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
              Beta
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-1 w-full overflow-hidden">
          {activeTab === "review" ? (
            <ReviewForm />
          ) : (
            <AnalyzerForm />
          )}
        </main>

        {/* IDE Status Bar Footer */}
        <footer className="h-7 shrink-0 flex items-center justify-between px-6 border-t border-border/40 bg-muted/30 text-[10px] font-mono text-muted-foreground select-none z-40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-500/95 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
            <span className="text-border/40">|</span>
            <span>Target: {activeTab === "review" ? "Pull Request Review" : "Repository Indexing"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Model: gemini-2.5-pro</span>
            <span className="text-border/40">|</span>
            <span>Context: Repository-Aware</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
