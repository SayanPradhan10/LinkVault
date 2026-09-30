import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const data = await req.json();
    const { folders = [], links = [] } = data;

    if (!Array.isArray(folders) || !Array.isArray(links)) {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      );
    }

    const folderIdMap = new Map<string, string>();

    // 1. Import folders
    const sortedFolders = [...folders].sort((a, b) => {
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      return 0;
    });

    for (const f of sortedFolders) {
      if (!f || typeof f !== "object") {
        continue;
      }

      if (!f.id || typeof f.id !== "string") {
        continue;
      }

      const parentId = f.parentId
        ? folderIdMap.get(f.parentId) || null
        : null;

      const created = await prisma.folder.create({
        data: {
          name:
            typeof f.name === "string" && f.name.trim()
              ? f.name.trim()
              : "Imported Folder",

          color:
            typeof f.color === "string"
              ? f.color
              : "#3b82f6",

          icon:
            typeof f.icon === "string"
              ? f.icon
              : "folder",

          parentId,
          userId,
        },
      });

      folderIdMap.set(f.id, created.id);
    }

    // 2. Import links
    let importedLinksCount = 0;

    for (const l of links) {
      if (!l || typeof l !== "object") {
        continue;
      }

      if (!l.url || typeof l.url !== "string") {
        continue;
      }

      const targetFolderId = l.folderId
        ? folderIdMap.get(l.folderId) || null
        : null;

      await prisma.link.create({
        data: {
          url: l.url,
          title:
            typeof l.title === "string" && l.title.trim()
              ? l.title.trim()
              : l.url,

          description:
            typeof l.description === "string"
              ? l.description
              : null,

          imageUrl:
            typeof l.imageUrl === "string"
              ? l.imageUrl
              : null,

          faviconUrl:
            typeof l.faviconUrl === "string"
              ? l.faviconUrl
              : null,

          platform:
            typeof l.platform === "string"
              ? l.platform
              : "web",

          contentType:
            typeof l.contentType === "string"
              ? l.contentType
              : "web",

          author:
            typeof l.author === "string"
              ? l.author
              : null,

          notes:
            typeof l.notes === "string"
              ? l.notes
              : null,

          isFavorite: Boolean(l.isFavorite),
          isPinned: Boolean(l.isPinned),

          folderId: targetFolderId,
          userId,

          createdAt:
            l.createdAt &&
            !Number.isNaN(new Date(l.createdAt).getTime())
              ? new Date(l.createdAt)
              : new Date(),
        },
      });

      importedLinksCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${folderIdMap.size} folders and ${importedLinksCount} links successfully!`,
      importedFolders: folderIdMap.size,
      importedLinks: importedLinksCount,
    });
  } catch (error: any) {
    console.error("POST /api/vault/import error:", error);

    return NextResponse.json(
      { error: "Failed to import vault" },
      { status: 500 }
    );
  }
}