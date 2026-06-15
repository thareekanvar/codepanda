import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: reviews, count, error } = await supabase
      .from("reviews")
      .select("id, pr_url, issue_description, result, created_at", { count: "exact" })
      .eq("repository_id", id)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: reviews || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
