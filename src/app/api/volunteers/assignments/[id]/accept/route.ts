import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { RequestService } from "@/lib/services/request.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== "VOLUNTEER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only registered volunteers can accept requests" } },
        { status: 403 }
      );
    }

    const requestId = params.id;
    const result = await RequestService.volunteerAcceptRequest(requestId, user.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Request accepted successfully. You are now assigned to coordinate delivery.",
    });
  } catch (error: any) {
    console.error("Volunteer accept error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ACCEPT_FAILED",
          message: error.message || "Failed to accept request",
        },
      },
      { status: 400 }
    );
  }
}
