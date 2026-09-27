import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { RequestService } from "@/lib/services/request.service";
import { z } from "zod";

const disputeSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = disputeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const dispute = await RequestService.reportDispute({
      requestId: params.id,
      reporterId: user.id,
      reporterName: user.name,
      reason: validated.data.reason,
    });

    return NextResponse.json({
      success: true,
      data: { dispute },
      message: "Dispute reported to command center. An admin will review shortly.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
