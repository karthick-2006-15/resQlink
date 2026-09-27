import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not logged in" },
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        avatar: true,
        volunteerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      },
      { status: 500 }
    );
  }
}
