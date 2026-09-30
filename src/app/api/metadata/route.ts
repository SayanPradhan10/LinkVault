import { NextRequest, NextResponse } from "next/server";
import { scrapeUrlMetadata } from "@/lib/metadata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await scrapeUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Metadata extraction error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to extract metadata" },
      { status: 500 }
    );
  }
}
