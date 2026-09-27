import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { RequestService } from "@/lib/services/request.service";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum(["IN_PROGRESS", "DELIVERED"]),
  notes: z.string().optional(),
});

export async function PATCH(
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

    const assignmentId = params.id;
    const body = await req.json();
    const validated = statusUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    let updatedAssignment;
    if (validated.data.status === "IN_PROGRESS") {
      updatedAssignment = await RequestService.startDelivery(assignmentId, user.id);
    } else if (validated.data.status === "DELIVERED") {
      updatedAssignment = await RequestService.markDelivered(
        assignmentId,
        user.id,
        validated.data.notes
      );
    }

    return NextResponse.json({
      success: true,
      data: { assignment: updatedAssignment },
      message:
        validated.data.status === "IN_PROGRESS"
          ? "Delivery started. Requester notified."
          : "Delivery marked as complete. Requester notified to confirm receipt.",
    });
  } catch (error: any) {
    console.error("Assignment status update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
