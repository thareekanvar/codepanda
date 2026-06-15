import { NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/repository/analyzer";
import { analyzeRequestSchema } from "@/lib/ai/schemas";

export const maxDuration = 300; // 5 minutes for cloning + analysis

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await analyzeRepository(parsed.data.url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
