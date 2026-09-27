import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { RequestService } from "@/lib/services/request.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required" } },
        { status: 403 }
      );
    }

    const requestId = params.id;
    const updated = await RequestService.verifyRequest(requestId, user.id, user.name);

    return NextResponse.json({
      success: true,
      data: { request: updated },
      message: "Emergency request verified. Matching engine activated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VERIFY_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
