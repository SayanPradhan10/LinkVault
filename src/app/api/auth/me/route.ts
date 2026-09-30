import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null });
  }
}
