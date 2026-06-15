"use client";

import React from "react";
import Link from "next/link";
import { 
  GitPullRequest, 
  Plus, 
  Calendar, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRecommendationDetails } from "@/lib/utils/review";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import type { Review } from "@/hooks/use-repository";

interface ReviewHistoryListProps {
  repoId: string;
  reviews: Review[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function ReviewHistoryList({
  repoId,
  reviews,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: ReviewHistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="border border-border/20 bg-zinc-950/15 rounded-xl p-5 animate-pulse space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 w-1/3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-5 bg-muted rounded-full w-20"></div>
            </div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="w-full border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-card/5">
        <GitPullRequest className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-sm font-semibold text-foreground/80 mb-1">No reviews found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
          You haven&apos;t run any automated reviews on this repository yet. Fetch a PR diff and request a review to get started.
        </p>
        <Link
          href={`/?repoId=${repoId}&tab=review`}
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "border border-border/40 text-xs flex items-center gap-1"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Analyze First PR
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-card/40">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-xs">
            <TableRow>
              <TableHead className="w-[80px] text-xs py-2 h-10 font-semibold text-muted-foreground">PR</TableHead>
              <TableHead className="min-w-[200px] text-xs py-2 h-10 font-semibold text-muted-foreground">Title & Source</TableHead>
              <TableHead className="w-[160px] text-xs py-2 h-10 font-semibold text-muted-foreground">Recommendation</TableHead>
              <TableHead className="w-[85px] text-center text-xs py-2 h-10 font-semibold text-muted-foreground">Score</TableHead>
              <TableHead className="w-[180px] hidden md:table-cell text-xs py-2 h-10 font-semibold text-muted-foreground">Metrics (A/Q/T)</TableHead>
              <TableHead className="w-[150px] hidden sm:table-cell text-xs py-2 h-10 font-semibold text-muted-foreground">Reviewed At</TableHead>
              <TableHead className="w-[60px] text-right h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {reviews.map((review) => {
              const resultObj = review.result;
              const coord = resultObj?.coordinatorReview || {};
              const recDetails = getRecommendationDetails(coord.recommendation);
              const RecIcon = recDetails.icon;

              // Parse PR name from url
              const prMatch = review.pr_url?.match(/\/pull\/(\d+)/);
              const prNumber = prMatch ? `#${prMatch[1]}` : "";
              const prTitle = review.issue_description?.split("\n")[0] || "Review";
              const cleanTitle = prTitle.replace(/^PR Title:\s*/i, "");

              return (
                <TableRow key={review.id} className="hover:bg-muted/10 group transition-colors">
                  <TableCell className="py-2.5 font-medium">
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {prNumber || "Review"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex flex-col gap-0.5 max-w-[400px]">
                      <Link 
                        href={`/reviews/${review.id}`}
                        className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate"
                      >
                        {cleanTitle}
                      </Link>
                      {review.pr_url && (
                        <a
                          href={review.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-0.5 w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub Link <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    {coord.recommendation ? (
                      <Badge className={cn("px-2 py-0.5 text-[9px] font-semibold border shadow-xs rounded-full gap-1 items-center flex w-fit bg-transparent", recDetails.color)}>
                        <RecIcon className="h-3 w-3 shrink-0" />
                        <span>{recDetails.label}</span>
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    {coord.overallScore !== undefined ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 px-2 text-[10px] font-bold rounded bg-transparent border shadow-xs",
                          coord.overallScore >= 80 
                            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : coord.overallScore >= 60
                            ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                            : "border-destructive/30 text-destructive"
                        )}
                      >
                        {coord.overallScore}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-mono text-[10px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 hidden md:table-cell">
                    <div className="flex gap-1.5 text-[9px] font-mono">
                      <div className="flex items-center gap-0.5 border border-border/40 px-1.5 py-0.5 rounded bg-muted/5">
                        <span className="text-muted-foreground">Arch:</span>
                        <span className="text-foreground font-semibold">{coord.architectureScore !== undefined ? coord.architectureScore : "—"}</span>
                      </div>
                      <div className="flex items-center gap-0.5 border border-border/40 px-1.5 py-0.5 rounded bg-muted/5">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="text-foreground font-semibold">{coord.codeQualityScore !== undefined ? coord.codeQualityScore : "—"}</span>
                      </div>
                      <div className="flex items-center gap-0.5 border border-border/40 px-1.5 py-0.5 rounded bg-muted/5">
                        <span className="text-muted-foreground">Test:</span>
                        <span className="text-foreground font-semibold">{coord.testingScore !== undefined ? coord.testingScore : "—"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 hidden sm:table-cell">
                    <div className="text-[10px] text-muted-foreground font-mono flex flex-col gap-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="pl-4 text-[9px] opacity-75">
                        {new Date(review.created_at).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <div className="flex justify-end">
                      <Link
                        href={`/reviews/${review.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        )}
                        title="View Report"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">View report</span>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="text-[10px] font-medium text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              className="h-8 w-8 border-border/40"
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              className="h-8 w-8 border-border/40"
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
