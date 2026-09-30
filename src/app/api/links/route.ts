import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeUrlMetadata } from "@/lib/metadata";
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

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const favorite = searchParams.get("favorite");
    const sort = searchParams.get("sort") || "newest";

    const where: any = { userId };

    if (folderId === "unorganized") {
      where.folderId = null;
    } else if (folderId && folderId !== "all") {
      // Find subfolders belonging to the current user
      const subfolders = await prisma.folder.findMany({
        where: {
          parentId: folderId,
          userId,
        },
        select: {
          id: true,
        },
      });

      const folderIds = [
        folderId,
        ...subfolders.map((f) => f.id),
      ];

      where.folderId = {
        in: folderIds,
      };
    }

    if (platform && platform !== "all") {
      where.platform = platform;
    }

    if (favorite === "true") {
      where.isFavorite = true;
    }

    if (search && search.trim()) {
      const q = search.trim();

      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { url: { contains: q } },
        { notes: { contains: q } },
        { author: { contains: q } },
      ];
    }

    const links = await prisma.link.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        {
          createdAt: sort === "oldest" ? "asc" : "desc",
        },
      ],
    });

    return NextResponse.json(links);
  } catch (error: any) {
    console.error("GET /api/links error:", error);

    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    let {
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
      platform,
      contentType,
      author,
      notes,
      folderId,
      tags,
    } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Verify folder ownership
    // --------------------------------------------------

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found or unauthorized" },
          { status: 403 }
        );
      }
    }

    // --------------------------------------------------
    // Auto scrape metadata if missing
    // --------------------------------------------------

    if (!title || !imageUrl) {
      try {
        const meta = await scrapeUrlMetadata(url);

        if (!title) title = meta.title;
        if (!description) description = meta.description;
        if (!imageUrl) imageUrl = meta.imageUrl;
        if (!faviconUrl) faviconUrl = meta.faviconUrl;
        if (!platform) platform = meta.platform;
        if (!contentType) contentType = meta.contentType;
        if (!author && meta.author) author = meta.author;
      } catch (e) {
        console.warn(
          "Auto-scrape fallback warning:",
          e
        );
      }
    }

    if (!title) {
      try {
        title = new URL(url).hostname;
      } catch {
        title = url;
      }
    }

    // --------------------------------------------------
    // Create link
    // --------------------------------------------------

    const createdLink = await prisma.link.create({
      data: {
        url: url.trim(),
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        faviconUrl: faviconUrl || null,
        platform: platform || "web",
        contentType: contentType || "web",
        author: author || null,
        notes: notes?.trim() || null,
        folderId: folderId || null,

        // IMPORTANT:
        // Always use the authenticated user's ID.
        // Never use userId supplied by the client.
        userId,
      },

      include: {
        folder: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // --------------------------------------------------
    // Create / connect tags
    // --------------------------------------------------

    if (Array.isArray(tags) && tags.length > 0) {
      for (const rawTag of tags) {
        const tagName =
          typeof rawTag === "string"
            ? rawTag.trim().toLowerCase()
            : "";

        if (!tagName) continue;

        const tagRecord = await prisma.tag.upsert({
          where: {
            name: tagName,
          },
          update: {},
          create: {
            name: tagName,
          },
        });

        await prisma.linkTag
          .create({
            data: {
              linkId: createdLink.id,
              tagId: tagRecord.id,
            },
          })
          .catch(() => {});
      }
    }

    // --------------------------------------------------
    // Return final link
    // --------------------------------------------------

    const finalLink = await prisma.link.findUnique({
      where: {
        id: createdLink.id,
      },
      include: {
        folder: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(
      finalLink,
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/links error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}