import { NextResponse } from "next/server";
import { buildDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const stories = await buildDigest();
    return NextResponse.json({ stories });
  } catch (err) {
    console.error("[api/digest] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch digest", details: String(err) },
      { status: 500 }
    );
  }
}
