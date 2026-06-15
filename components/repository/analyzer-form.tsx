"use client";

import { useApp } from "@/components/app-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PulsingDots } from "@/components/ui/loading-states";
import { Database } from "lucide-react";
import { AnalysisResults } from "./analysis-results";
import type { ArchitectureAnalysis } from "@/lib/ai/schemas";

interface AnalysisData {
  repositoryId: string;
  name: string;
  url: string;
  analysis: ArchitectureAnalysis;
}

export function AnalyzerForm() {
  const { fetchRepositories, setSelectedRepoId } = useApp();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [phase, setPhase] = useState("");

  async function handleAnalyze() {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPhase("Cloning repository...");

    try {
      // Simulate phase updates
      const phaseTimer = setInterval(() => {
        setPhase((prev) => {
          if (prev.includes("Cloning")) return "Scanning files...";
          if (prev.includes("Scanning")) return "Detecting architecture...";
          if (prev.includes("Detecting")) return "Generating AI analysis...";
          if (prev.includes("Generating AI")) return "Creating embeddings...";
          if (prev.includes("Creating")) return "Storing vectors...";
          return prev;
        });
      }, 8000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      clearInterval(phaseTimer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.data);
      setSelectedRepoId(data.data.repositoryId);
      await fetchRepositories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setPhase("");
    }
  }

  return (
    <div className="w-full h-full flex divide-x divide-border/40 overflow-hidden bg-background">
      {/* Left Column: Input Form (Fixed Sidebar) */}
      <div className="w-[340px] shrink-0 h-full flex flex-col bg-card/10">
        <div className="h-12 shrink-0 border-b border-border/40 px-5 flex items-center justify-between bg-muted/15">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-primary" />
            Indexing Configuration
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url-input" className="text-xs font-semibold text-foreground/80">GitHub Repository URL</Label>
              <Input
                id="repo-url-input"
                placeholder="https://github.com/owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyze()}
                disabled={loading}
                className="bg-background/50 border-border/40 h-10 text-xs font-mono"
              />
            </div>

            <Button
              id="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all font-semibold text-xs"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  Analyzing <PulsingDots />
                </span>
              ) : (
                "Analyze Repository"
              )}
            </Button>

            {/* Phase indicator */}
            {loading && phase && (
              <div className="rounded-lg border border-border/20 bg-muted/15 p-3.5 flex items-center gap-2.5 text-xs text-muted-foreground animate-in slide-in-from-bottom-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span>{phase}</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 animate-in slide-in-from-bottom-2">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Results Workspace */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-background">
        <div className="h-12 shrink-0 border-b border-border/40 px-6 flex items-center justify-between bg-muted/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
            {loading ? "Analyzer AST Compilation" : result ? "Architecture Report" : "Analysis Dashboard"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && !result && (
            <div className="max-w-2xl mx-auto py-8">
              <div className="border border-border/40 bg-zinc-950/20 backdrop-blur-md rounded-xl p-12 text-center shadow-xl flex flex-col items-center justify-center h-[350px]">
                <span className="relative flex h-10 w-10 mb-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-primary/10 border border-primary/30 items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </span>
                </span>
                <h3 className="text-sm font-semibold text-foreground/80 mb-2">Analyzing Repository Structure...</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  We are indexing file trees, parsing configuration rules, and scanning pattern ASTs.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in duration-300">
              <AnalysisResults data={result} />
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border/40 mb-4 shadow-sm">
                <Database className="h-5 w-5 text-muted-foreground/80" />
              </div>
              <h3 className="text-sm font-semibold text-foreground/80">No Active Index</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                Scan a public repository on the left panel to map its directory architecture and make it available for context.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
