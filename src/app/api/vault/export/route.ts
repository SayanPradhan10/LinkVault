import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const [folders, links] = await Promise.all([
      prisma.folder.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          parentId: true,
          createdAt: true,
        },
      }),

      prisma.link.findMany({
        where: { userId },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        name: user.name,
      },
      stats: {
        totalFolders: folders.length,
        totalLinks: links.length,
      },
      folders,
      links,
    };

    const fileName = `linkvault-backup-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.json`;

    return new NextResponse(
      JSON.stringify(backupData, null, 2),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/vault/export error:", error);

    return NextResponse.json(
      { error: "Failed to export vault" },
      { status: 500 }
    );
  }
}