import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const data = await AnalyticsService.getOverviewMetrics();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
