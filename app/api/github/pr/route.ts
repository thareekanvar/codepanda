import { NextResponse } from "next/server";
import { fetchPrData } from "@/lib/github/pr-fetcher";
import { githubPrRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = githubPrRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const prData = await fetchPrData(parsed.data.url);

    return NextResponse.json({
      success: true,
      data: prData,
    });
  } catch (error) {
    console.error("GitHub PR fetch error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Check for GitHub API rate limiting
    if (message.includes("403")) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded. Set GITHUB_TOKEN in environment variables for higher limits.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
