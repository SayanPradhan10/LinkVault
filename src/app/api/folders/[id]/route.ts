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

    const folder = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        parent: true,
        children: {
          where: {
            userId,
          },
          include: {
            _count: {
              select: {
                links: true,
              },
            },
          },
        },
        _count: {
          select: {
            links: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(folder);
  } catch (error: any) {
    console.error(
      "GET /api/folders/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch folder" },
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

    // Verify that the folder belongs to the
    // authenticated user
    const existing = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      name,
      color,
      icon,
      parentId,
    } = body;

    // --------------------------------------------------
    // Verify parent folder ownership
    // --------------------------------------------------

    if (parentId) {
      // Prevent a folder from being its own parent
      if (parentId === params.id) {
        return NextResponse.json(
          {
            error:
              "A folder cannot be its own parent",
          },
          { status: 400 }
        );
      }

      const parentFolder =
        await prisma.folder.findFirst({
          where: {
            id: parentId,
            userId,
          },
          select: {
            id: true,
          },
        });

      if (!parentFolder) {
        return NextResponse.json(
          {
            error:
              "Parent folder not found or unauthorized",
          },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.folder.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name !== undefined && {
          name:
            typeof name === "string"
              ? name.trim()
              : existing.name,
        }),

        ...(color !== undefined && {
          color,
        }),

        ...(icon !== undefined && {
          icon,
        }),

        ...(parentId !== undefined && {
          parentId: parentId || null,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(
      "PUT /api/folders/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update folder" },
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

    // Verify that the folder belongs to
    // the authenticated user
    const existing = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.folder.delete({
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
      "DELETE /api/folders/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}