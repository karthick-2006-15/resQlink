import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "pending", "verified", "all"

    const where: any = {};
    if (filter === "pending") {
      where.isVerified = false;
      where.rejectedAt = null;
    } else if (filter === "verified") {
      where.isVerified = true;
    }

    const profiles = await prisma.volunteerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = profiles.map((p) => {
      let caps = [];
      try {
        caps = JSON.parse(p.capabilities);
      } catch {
        caps = [];
      }
      return {
        ...p,
        capabilities: caps,
      };
    });

    return NextResponse.json({
      success: true,
      data: { volunteers: formatted },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
