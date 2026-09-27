import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/lib/services/audit.service";
import { NotificationService } from "@/lib/services/notification.service";
import { z } from "zod";

const verifySchema = z.object({
  action: z.enum(["VERIFY", "REJECT"]),
  notes: z.string().optional(),
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
    const validated = verifySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { action } = validated.data;
    const profileIdOrUserId = params.id;

    // Find profile
    const profile = await prisma.volunteerProfile.findFirst({
      where: {
        OR: [{ id: profileIdOrUserId }, { userId: profileIdOrUserId }],
      },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Volunteer profile not found" } },
        { status: 404 }
      );
    }

    let updatedProfile;
    if (action === "VERIFY") {
      updatedProfile = await prisma.volunteerProfile.update({
        where: { id: profile.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          rejectedAt: null,
        },
      });

      await AuditService.log({
        actorId: user.id,
        actorName: user.name,
        actorRole: "ADMIN",
        action: "VOLUNTEER_VERIFIED",
        entity: "VolunteerProfile",
        entityId: profile.id,
        newValue: "VERIFIED",
      });

      await NotificationService.send({
        userId: profile.userId,
        title: "Account Verified! You are now an active responder",
        message: "Congratulations! Your volunteer profile has been approved. You can now accept emergency requests nearby.",
        type: "SUCCESS",
        link: "/volunteer/nearby",
      });
    } else {
      updatedProfile = await prisma.volunteerProfile.update({
        where: { id: profile.id },
        data: {
          isVerified: false,
          rejectedAt: new Date(),
        },
      });

      await AuditService.log({
        actorId: user.id,
        actorName: user.name,
        actorRole: "ADMIN",
        action: "VOLUNTEER_REJECTED",
        entity: "VolunteerProfile",
        entityId: profile.id,
        newValue: "REJECTED",
      });

      await NotificationService.send({
        userId: profile.userId,
        title: "Volunteer Application Update",
        message: "Your volunteer application could not be approved at this time. Please contact support or update your credentials.",
        type: "WARNING",
      });
    }

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: action === "VERIFY" ? "Volunteer verified successfully" : "Volunteer application rejected",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ACTION_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
