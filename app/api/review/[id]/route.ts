import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: review, error } = await supabase
      .from("reviews")
      .select("*, repositories(id, name, url)")
      .eq("id", id)
      .single();

    if (error || !review) {
      return NextResponse.json({ error: "Review report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Review report fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
