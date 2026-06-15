import { NextResponse } from "next/server";
import { runReview } from "@/lib/agents/review-orchestrator";
import { reviewRequestSchema } from "@/lib/ai/schemas";
import { supabase } from "@/lib/supabase/client";

export const maxDuration = 180; // 3 minutes for 6-agent review

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = reviewRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await runReview({
      repositoryId: parsed.data.repositoryId,
      issueDescription: parsed.data.issueDescription,
      codeDiff: parsed.data.codeDiff,
      prUrl: parsed.data.prUrl,
    });

    // Save review to database
    let savedReviewId = null;
    try {
      const { data: saved, error: saveError } = await supabase
        .from("reviews")
        .insert({
          repository_id: parsed.data.repositoryId,
          pr_url: parsed.data.prUrl || "",
          issue_description: parsed.data.issueDescription,
          code_diff: parsed.data.codeDiff,
          result: result,
        })
        .select("id")
        .single();

      if (saveError) {
        console.error("Failed to save review:", saveError.message);
      } else if (saved) {
        savedReviewId = saved.id;
      }
    } catch (dbError) {
      console.error("Database execution error saving review:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        id: savedReviewId,
      },
    });
  } catch (error) {
    console.error("Review error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
