import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data: repositories, error } = await supabase
      .from("repositories")
      .select("id, name, url, architecture_summary, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: repositories || [],
    });
  } catch (error) {
    console.error("Repositories fetch error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
