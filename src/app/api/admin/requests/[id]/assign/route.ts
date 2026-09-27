import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/lib/services/audit.service";
import { NotificationService } from "@/lib/services/notification.service";
import { z } from "zod";

const assignSchema = z.object({
  volunteerId: z.string().min(1, "Volunteer ID required"),
  notes: z.string().optional(),
});

export async function POST(
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
    const body = await req.json();
    const validated = assignSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { volunteerId, notes } = validated.data;

    // Verify volunteer
    const volunteer = await prisma.user.findUnique({
      where: { id: volunteerId },
      include: { volunteerProfile: true },
    });

    if (!volunteer || !volunteer.volunteerProfile) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Volunteer profile not found" } },
        { status: 404 }
      );
    }

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { requester: true },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Request not found" } },
        { status: 404 }
      );
    }

    const assignment = await prisma.$transaction(async (tx) => {
      // Cancel any prior active assignment
      await tx.assignment.updateMany({
        where: { requestId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        data: { status: "CANCELLED" },
      });

      const newAssignment = await tx.assignment.create({
        data: {
          requestId,
          volunteerId,
          status: "ASSIGNED",
          notes: notes || `Directly assigned by Admin ${user.name}`,
          acceptedAt: new Date(),
        },
      });

      await tx.emergencyRequest.update({
        where: { id: requestId },
        data: {
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          actorRole: "ADMIN",
          action: "VOLUNTEER_ASSIGNED_BY_ADMIN",
          entity: "Assignment",
          entityId: newAssignment.id,
          newValue: JSON.stringify({ requestId, volunteerId }),
        },
      });

      return newAssignment;
    });

    // Notify volunteer & citizen
    await NotificationService.send({
      userId: volunteerId,
      title: "New Emergency Assignment",
      message: `Admin ${user.name} assigned you to an emergency request: ${request.title} (${request.resourceType}).`,
      type: "URGENT",
      link: `/volunteer/assignments`,
    });

    await NotificationService.send({
      userId: request.requesterId,
      title: "Volunteer Assigned to Your Request",
      message: `${volunteer.name} has been assigned to provide ${request.resourceType}.`,
      type: "SUCCESS",
      link: `/citizen/requests/${requestId}`,
    });

    return NextResponse.json({
      success: true,
      data: { assignment },
      message: `Volunteer ${volunteer.name} successfully assigned to request.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ASSIGN_FAILED", message: error.message } },
      { status: 400 }
    );
  }
}
