import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { RequestService } from "@/lib/services/request.service";
import { PriorityLevel } from "@/types";
import { z } from "zod";

const prioritySchema = z.object({
  priority: z.enum(["NORMAL", "HIGH", "CRITICAL"]),
});

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

    const body = await req.json();
    const validated = prioritySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid priority value" } },
        { status: 400 }
      );
    }

    const updated = await RequestService.changePriority(
      params.id,
      validated.data.priority as PriorityLevel,
      user.id,
      user.name
    );

    return NextResponse.json({
      success: true,
      data: { request: updated },
      message: `Priority updated to ${validated.data.priority}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
