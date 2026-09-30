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

    const folders = await prisma.folder.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            links: true,
            children: true,
          },
        },
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
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(folders);
  } catch (error: any) {
    console.error(
      "GET /api/folders error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch folders" },
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

    const {
      name,
      color,
      icon,
      parentId,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Folder name cannot be empty" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Verify parent folder ownership
    // --------------------------------------------------

    if (parentId) {
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

    // --------------------------------------------------
    // Create folder
    // --------------------------------------------------

    const folder = await prisma.folder.create({
      data: {
        name: trimmedName,
        color: color || "#3b82f6",
        icon: icon || "folder",
        parentId: parentId || null,

        // IMPORTANT:
        // Always use the authenticated user's ID.
        userId,
      },
    });

    return NextResponse.json(
      folder,
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/folders error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}