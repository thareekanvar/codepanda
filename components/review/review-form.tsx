"use client";

import { useApp } from "@/components/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgentProgress, PulsingDots } from "@/components/ui/loading-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  GitPullRequest,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewResults } from "./review-results";
import { DiffAccordion } from "./diff-accordion";
import { EmptyState } from "./empty-state";

export function ReviewForm() {
  const router = useRouter();
  const {
    repositories,
    selectedRepoId,
    setSelectedRepoId,
    prUrl,
    setPrUrl,
    fetchingPr,
    setFetchingPr,
    changedFiles,
    setChangedFiles,
    setSelectedFile,
    prError,
    setPrError,
    issueDescription,
    setIssueDescription,
    codeDiff,
    setCodeDiff,
    loading,
    setLoading,
    error,
    setError,
    result,
    setResult,
    agents,
    setAgents,
  } = useApp();

  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(
    {},
  );
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    "diff" | "review"
  >("diff");

  const toggleFileExpanded = (filename: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [filename]: !prev[filename],
    }));
  };

  // Fetch PR data from GitHub API and populate fields automatically
  async function handleFetchPr() {
    if (!prUrl.trim()) return;

    setFetchingPr(true);
    setPrError(null);
    setError(null);
    setChangedFiles([]);
    setSelectedFile(null);
    setExpandedFiles({});

    try {
      const response = await fetch("/api/github/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: prUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch PR details");
      }

      const { metadata, diff, files } = data.data;

      // Auto-populate form fields
      setIssueDescription(
        `PR Title: ${metadata.title}\n\nPR Description:\n${metadata.body || "No description provided."}`,
      );
      setCodeDiff(diff);
      setChangedFiles(files || []);
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        setExpandedFiles({ [files[0].filename]: true });
      }
      setActiveWorkspaceTab("diff");

      // Auto-match repo if user hasn't selected one
      const match = prUrl.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/);
      if (match) {
        const repoName = match[1].toLowerCase();
        const found = repositories.find(
          (r) =>
            r.name.toLowerCase() === repoName ||
            r.url.toLowerCase().includes(repoName),
        );
        if (found) {
          setSelectedRepoId(found.id);
        }
      }
    } catch (err) {
      setPrError(err instanceof Error ? err.message : "Failed to fetch PR");
    } finally {
      setFetchingPr(false);
    }
  }

  async function handleReview() {
    if (!selectedRepoId || !issueDescription.trim() || !codeDiff.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveWorkspaceTab("review");

    // Reset agents to pending / running
    setAgents([
      { name: "Principal Architect Agent", status: "running" },
      { name: "Senior Product Engineer Agent", status: "running" },
      { name: "Staff QA Engineer Agent", status: "running" },
      { name: "Senior Code Quality Agent", status: "running" },
      { name: "Review Coordinator", status: "pending" },
    ]);

    try {
      const reviewPromise = fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: selectedRepoId,
          issueDescription: issueDescription.trim(),
          codeDiff: codeDiff.trim(),
          prUrl: prUrl.trim() || undefined,
        }),
      });

      // Update coordinator once agents finish (simulated transition, final state determined by actual response)
      const agentTimer = setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) =>
            a.name === "Review Coordinator"
              ? { ...a, status: "running" }
              : { ...a, status: "done" },
          ),
        );
      }, 12000);

      const response = await reviewPromise;
      clearTimeout(agentTimer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Review execution failed");
      }

      setAgents((prev) => prev.map((a) => ({ ...a, status: "done" })));
      setResult(data.data);
      if (data.data && data.data.id) {
        setTimeout(() => {
          router.push(`/reviews/${data.data.id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAgents((prev) =>
        prev.map((a) =>
          a.status === "running" ? { ...a, status: "error" } : a,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex divide-x divide-border/40 overflow-hidden bg-background">
      {/* Left Column: Input Form (Fixed Sidebar) */}
      <div className="w-[340px] shrink-0 h-full flex flex-col bg-card/10">
        <div className="h-12 shrink-0 border-b border-border/40 px-5 flex items-center justify-between bg-muted/15">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-primary" />
            Review Configuration
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* GitHub Auto-Fetch Section */}
          <div className="space-y-2.5 rounded-lg border border-border/30 bg-muted/20 p-4">
            <Label
              htmlFor="pr-url"
              className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              Quick-Fetch GitHub Pull Request
            </Label>
            <div className="flex gap-2">
              <Input
                id="pr-url"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                disabled={fetchingPr || loading}
                className="bg-background/50 border-border/40 font-mono text-[11px] h-9"
              />
              <Button
                id="fetch-pr-button"
                onClick={handleFetchPr}
                disabled={fetchingPr || loading || !prUrl.trim()}
                variant="secondary"
                className="h-9 border border-border/40 hover:bg-muted text-xs px-3 shrink-0"
              >
                {fetchingPr ? (
                  <span className="flex items-center gap-1.5">
                    Fetching <PulsingDots />
                  </span>
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
            {prError && (
              <p className="text-[10px] text-red-400 mt-1">
                <strong>Fetch Error:</strong> {prError}
              </p>
            )}
          </div>

          {/* Repository Selector */}
          <div className="space-y-1.5">
            <Label
              htmlFor="repo-select"
              className="text-xs font-semibold text-foreground/80"
            >
              Select Target Index
            </Label>
            <Select
              value={selectedRepoId}
              onValueChange={(val) => setSelectedRepoId(val || "")}
              disabled={loading}
            >
              <SelectTrigger
                id="repo-select"
                className="w-full text-xs"
              >
                <SelectValue placeholder="Select repository...">
                  {selectedRepoId ? (repositories.find((r) => r.id === selectedRepoId)?.name || "Loading repository...") : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {repositories.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No analyzed repositories.
                  </SelectItem>
                ) : (
                  repositories.map((repo) => (
                    <SelectItem
                      key={repo.id}
                      value={repo.id}
                      className="text-xs"
                    >
                      {repo.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {/* Issue Description / Requirements */}
          <div className="space-y-1.5">
            <Label
              htmlFor="issue-desc"
              className="text-xs font-semibold text-foreground/80"
            >
              Review Directives & Context
            </Label>
            <Textarea
              id="issue-desc"
              placeholder="Explain requirements, bug description, or target rules for this review."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={4}
              disabled={loading}
              className="bg-background/50 border-border/40 text-xs resize-none"
            />
          </div>

          {/* Submit button */}
          <Button
            id="review-button"
            onClick={handleReview}
            disabled={
              loading ||
              !selectedRepoId ||
              !issueDescription.trim() ||
              !codeDiff.trim()
            }
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all font-semibold text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                Running Review Agents <PulsingDots />
              </span>
            ) : (
              "Submit Code for Review"
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Execution Workspace */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-background">
        <div className="h-12 shrink-0 border-b border-border/40 px-6 flex items-center justify-between bg-muted/5">
          <div className="flex gap-4 items-center h-full">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab("diff")}
              className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center ${
                activeWorkspaceTab === "diff"
                  ? "border-primary text-foreground font-extrabold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              PR Diff Explorer {changedFiles.length > 0 ? `(${changedFiles.length})` : ""}
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab("review")}
              className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center ${
                activeWorkspaceTab === "review"
                  ? "border-primary text-foreground font-extrabold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Review Agent {result ? "(Report)" : ""}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeWorkspaceTab === "diff" ? (
            fetchingPr ? (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <span className="relative flex h-10 w-10 mb-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-primary/10 border border-primary/30 items-center justify-center">
                    <GitPullRequest className="h-5 w-5 text-primary animate-pulse" />
                  </span>
                </span>
                <h3 className="text-sm font-semibold text-foreground/80 mb-2">
                  Fetching Pull Request Details...
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-sans">
                  Connecting to GitHub API to retrieve metadata, unified diff branches, and change payloads.
                </p>
              </div>
            ) : changedFiles.length > 0 ? (
              <DiffAccordion
                changedFiles={changedFiles}
                expandedFiles={expandedFiles}
                toggleFileExpanded={toggleFileExpanded}
              />
            ) : (
              <EmptyState
                icon={GitPullRequest}
                title="No Active PR Changes"
                description="Paste a GitHub PR link on the left and click 'Fetch' to populate the file change explorer here."
                className="h-full min-h-[400px]"
              />
            )
          ) : (
            <div className="h-full flex flex-col justify-center">
              {loading && (
                <div className="flex-1 flex flex-col justify-center items-center py-6 w-full max-w-lg mx-auto">
                  <AgentProgress agents={agents} />
                </div>
              )}

              {result && !loading && (
                <div className="animate-in fade-in duration-300 flex-1">
                  <ReviewResults result={result} />
                </div>
              )}

              {!result && !loading && (
                <EmptyState
                  icon={Bot}
                  title="No Active Review"
                  description="Submit target changes on the left panel to orchestrate review agents and visualize architectural feedback."
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
