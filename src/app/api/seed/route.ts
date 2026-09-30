import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { subDays, subHours } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const existing = await prisma.link.count({
      where: { userId },
    });

    if (existing > 0) {
      return NextResponse.json({
        message: "Your vault already has links. Demo seed skipped.",
        count: existing,
      });
    }

    // 1. Create User Folders
    const csFolder = await prisma.folder.create({
      data: {
        name: "Computer Science",
        color: "#3b82f6",
        icon: "code",
        userId,
      },
    });

    const sysDesignFolder = await prisma.folder.create({
      data: {
        name: "System Design & Architecture",
        color: "#8b5cf6",
        icon: "server",
        parentId: csFolder.id,
        userId,
      },
    });

    const aiFolder = await prisma.folder.create({
      data: {
        name: "AI & Machine Learning",
        color: "#ec4899",
        icon: "brain",
        parentId: csFolder.id,
        userId,
      },
    });

    const designFolder = await prisma.folder.create({
      data: {
        name: "UI/UX & Product Design",
        color: "#f59e0b",
        icon: "palette",
        userId,
      },
    });

    const now = new Date();

    // 2. Sample Links spanning multiple dates
    const sampleLinks = [
      {
        url: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
        title: "System Design Interview: How to Design YouTube",
        description:
          "A comprehensive breakdown of distributed video streaming, CDN architecture, encoding pipelines, and metadata storage at massive scale.",
        imageUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        platform: "youtube",
        contentType: "video",
        author: "Tech Dummies",
        notes:
          "Crucial concepts: chunked upload, CDN caching hierarchies, Cassandra for comments.",
        isFavorite: true,
        isPinned: true,
        folderId: sysDesignFolder.id,
        userId,
        createdAt: now,
      },
      {
        url: "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
        title: "Building Microservices with Go and gRPC",
        description:
          "Learn how to build high-performance microservices communicating via HTTP/2 and Protocol Buffers.",
        imageUrl:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        platform: "youtube",
        contentType: "video",
        author: "Nic Jackson",
        notes: "Great guide on Protobuf reflection and streaming RPCs.",
        isFavorite: false,
        folderId: sysDesignFolder.id,
        userId,
        createdAt: subHours(now, 4),
      },
      {
        url: "https://www.instagram.com/reel/C8_UI_UX_Mock",
        title: "10 Visual Hierarchy Secrets Every UI Designer Needs",
        description:
          "Typography scales, contrast ratios, and whitespace rules that immediately elevate modern web interfaces.",
        imageUrl:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
        platform: "instagram",
        contentType: "post",
        author: "@design.gems",
        notes: "Check slide 4 on subtle 4px grid spacing.",
        isFavorite: true,
        folderId: designFolder.id,
        userId,
        createdAt: subDays(now, 1),
      },
      {
        url: "https://github.com/shadcn-ui/ui",
        title:
          "shadcn/ui - Beautifully designed components that you can copy and paste",
        description:
          "Accessible and customizable components that you can copy and paste into your apps. Free. Open Source. Built with Radix UI and Tailwind CSS.",
        imageUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
        platform: "github",
        contentType: "code",
        author: "shadcn",
        notes: "Favorite UI library. Use CLI to add components.",
        isFavorite: true,
        folderId: designFolder.id,
        userId,
        createdAt: subDays(now, 2),
      },
      {
        url: "https://arxiv.org/abs/1706.03762",
        title: "Attention Is All You Need (Transformer Architecture)",
        description:
          "The seminal research paper proposing the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism.",
        imageUrl:
          "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        platform: "web",
        contentType: "article",
        author: "Vaswani et al.",
        notes: "Fundamental reading for all modern LLM systems.",
        isFavorite: true,
        folderId: aiFolder.id,
        userId,
        createdAt: subDays(now, 5),
      },
      {
        url: "https://x.com/karpathy/status/1626081446800109569",
        title: "Andrej Karpathy on Neural Networks and Software 2.0",
        description:
          "Insights on the shift from explicitly programmed algorithms to optimization-driven neural weights.",
        imageUrl:
          "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
        platform: "twitter",
        contentType: "post",
        author: "Andrej Karpathy",
        notes: "Key takeaway: weights are the code of Software 2.0.",
        isFavorite: false,
        folderId: aiFolder.id,
        userId,
        createdAt: subDays(now, 12),
      },
    ];

    for (const item of sampleLinks) {
      await prisma.link.create({
        data: item,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Personal demo vault loaded successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);

    return NextResponse.json(
      { error: "Failed to seed demo data" },
      { status: 500 }
    );
  }
}