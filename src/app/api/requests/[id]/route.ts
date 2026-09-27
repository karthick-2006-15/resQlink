import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestService } from "@/lib/services/request.service";
import { AuditService } from "@/lib/services/audit.service";
import { NotificationService } from "@/lib/services/notification.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: { id: true, name: true, email: true, phone: true, address: true },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                volunteerProfile: true,
              },
            },
          },
        },
        disputes: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Emergency request not found" } },
        { status: 404 }
      );
    }

    // Fetch related audit logs for timeline
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: "EmergencyRequest",
        entityId: requestId,
      },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        request: {
          ...request,
          currentAssignment: request.assignments.find((a) => a.status !== "CANCELLED") || null,
        },
        auditLogs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

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

    const requestId = params.id;
    const body = await req.json();
    const { action } = body;

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Request not found" } },
        { status: 404 }
      );
    }

    // Action: Confirm Delivery (Citizen marks receipt confirmed -> CLOSED)
    if (action === "CONFIRM_DELIVERY") {
      if (request.requesterId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Only the requester can confirm delivery" } },
          { status: 403 }
        );
      }

      const updated = await RequestService.confirmDelivery(requestId, request.requesterId);
      return NextResponse.json({
        success: true,
        data: { request: updated },
        message: "Delivery confirmed and emergency request resolved! Thank you.",
      });
    }

    // Action: Cancel Request
    if (action === "CANCEL") {
      if (request.requesterId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Unauthorized to cancel request" } },
          { status: 403 }
        );
      }

      if (request.status === "DELIVERED" || request.status === "CLOSED") {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_STATE", message: "Delivered or resolved requests cannot be cancelled" } },
          { status: 400 }
        );
      }

      const updated = await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED" },
      });

      // Cancel any active assignments
      await prisma.assignment.updateMany({
        where: { requestId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        data: { status: "CANCELLED" },
      });

      await AuditService.log({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "REQUEST_CANCELLED",
        entity: "EmergencyRequest",
        entityId: requestId,
        oldValue: request.status,
        newValue: "CANCELLED",
      });

      return NextResponse.json({
        success: true,
        data: { request: updated },
        message: "Emergency request cancelled.",
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: `Unsupported action: ${action}` } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Patch request error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
