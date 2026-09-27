import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { MatchingService } from "@/lib/services/matching.service";

export async function GET(
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

    const matches = await MatchingService.findMatchesForRequest(params.id);

    return NextResponse.json({
      success: true,
      data: { matches },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "MATCHING_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
