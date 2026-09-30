import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    // Authentication is required
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const [
      totalLinks,
      totalFolders,
      favoritesCount,
      unorganizedCount,
      platformCounts,
    ] = await Promise.all([
      prisma.link.count({
        where: { userId },
      }),

      prisma.folder.count({
        where: { userId },
      }),

      prisma.link.count({
        where: {
          userId,
          isFavorite: true,
        },
      }),

      prisma.link.count({
        where: {
          userId,
          folderId: null,
        },
      }),

      prisma.link.groupBy({
        by: ["platform"],
        where: { userId },
        _count: {
          _all: true,
        },
      }),
    ]);

    const platformsMap: Record<string, number> = {};

    for (const item of platformCounts) {
      platformsMap[item.platform] = item._count._all;
    }

    return NextResponse.json({
      totalLinks,
      totalFolders,
      favoritesCount,
      unorganizedCount,
      platforms: platformsMap,
    });
  } catch (error: any) {
    console.error("GET /api/stats error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}