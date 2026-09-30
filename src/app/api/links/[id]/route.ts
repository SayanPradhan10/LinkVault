import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const link = await prisma.link.findFirst({
      where: {
        id: params.id,
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

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(link);
  } catch (error: any) {
    console.error(
      "GET /api/links/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify that this link belongs to the logged-in user
    const existing = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      title,
      notes,
      folderId,
      isFavorite,
      isPinned,
      tags,
    } = body;

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string") {
        return NextResponse.json(
          { error: "Invalid title" },
          { status: 400 }
        );
      }

      updateData.title = title.trim();
    }

    if (notes !== undefined) {
      updateData.notes =
        typeof notes === "string"
          ? notes.trim() || null
          : null;
    }

    // --------------------------------------------------
    // Verify folder ownership
    // --------------------------------------------------

    if (folderId !== undefined) {
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
            {
              error:
                "Folder not found or unauthorized",
            },
            { status: 403 }
          );
        }

        updateData.folderId = folderId;
      } else {
        // null / empty folder means unorganized
        updateData.folderId = null;
      }
    }

    if (isFavorite !== undefined) {
      updateData.isFavorite = Boolean(isFavorite);
    }

    if (isPinned !== undefined) {
      updateData.isPinned = Boolean(isPinned);
    }

    // --------------------------------------------------
    // Update link
    // --------------------------------------------------

    await prisma.link.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    // --------------------------------------------------
    // Update tags
    // --------------------------------------------------

    if (Array.isArray(tags)) {
      await prisma.linkTag.deleteMany({
        where: {
          linkId: params.id,
        },
      });

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
              linkId: params.id,
              tagId: tagRecord.id,
            },
          })
          .catch(() => {});
      }
    }

    // --------------------------------------------------
    // Return updated link
    // --------------------------------------------------

    const updated = await prisma.link.findUnique({
      where: {
        id: params.id,
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(
      "PUT /api/links/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify that this link belongs to the logged-in user
    const existing = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.link.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      id: params.id,
    });
  } catch (error: any) {
    console.error(
      "DELETE /api/links/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}