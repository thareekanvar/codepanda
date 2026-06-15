import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: repo, error } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: repo,
    });
  } catch (error) {
    console.error("Repository details fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
