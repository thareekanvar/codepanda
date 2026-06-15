import { useQuery } from "@tanstack/react-query";

export interface Repository {
  id: string;
  name: string;
  url: string;
  architecture_summary?: string;
  created_at: string;
}

export interface ReviewResult {
  coordinatorReview?: {
    recommendation?: string;
    overallScore?: number;
    architectureScore?: number;
    codeQualityScore?: number;
    testingScore?: number;
    securityScore?: number;
    performanceScore?: number;
    summary?: string;
    [key: string]: unknown;
  };
  securityReview?: {
    findings?: Array<{
      vulnType: string;
      title: string;
      severity: string;
      [key: string]: unknown;
    }>;
    score?: number;
    [key: string]: unknown;
  };
  performanceReview?: {
    findings?: Array<{
      issueType: string;
      title: string;
      severity: string;
      [key: string]: unknown;
    }>;
    score?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Review {
  id: string;
  pr_url?: string;
  issue_description?: string;
  result: ReviewResult;
  created_at: string;
  repositories?: Repository;
}

export function useRepositoryQuery(repoId: string | undefined) {
  return useQuery({
    queryKey: ["repository", repoId],
    queryFn: async () => {
      if (!repoId) throw new Error("No repository ID provided");
      const res = await fetch(`/api/repositories/${repoId}`);
      if (!res.ok) throw new Error("Failed to fetch repository details");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load repository");
      return json.data as Repository;
    },
    enabled: !!repoId,
  });
}

export function useRepositoryReviewsQuery(repoId: string | undefined, page: number, limit = 5) {
  return useQuery({
    queryKey: ["repository-reviews", repoId, page],
    queryFn: async () => {
      if (!repoId) throw new Error("No repository ID provided");
      const res = await fetch(`/api/repositories/${repoId}/reviews?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load reviews");
      return json as { data: Review[]; count: number; totalPages: number };
    },
    enabled: !!repoId,
  });
}

export function useReviewDetailsQuery(reviewId: string | undefined) {
  return useQuery({
    queryKey: ["review-details", reviewId],
    queryFn: async () => {
      if (!reviewId) throw new Error("No review ID provided");
      const res = await fetch(`/api/review/${reviewId}`);
      if (!res.ok) throw new Error("Failed to fetch review details");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Review not found");
      return json.data as Review;
    },
    enabled: !!reviewId,
  });
}
