import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestService } from "@/lib/services/request.service";
import { AuditService } from "@/lib/services/audit.service";
import { NotificationService } from "@/lib/services/notification.service";
import { PriorityService } from "@/lib/services/priority.service";

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

    // Action: Edit / Update Request Details
    if (action === "EDIT" || body.title !== undefined || body.quantity !== undefined || body.urgency !== undefined) {
      if (request.requesterId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Only the requester can edit this emergency request" } },
          { status: 403 }
        );
      }

      if (request.status === "DELIVERED" || request.status === "CLOSED" || request.status === "CANCELLED") {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_STATE", message: "Cannot edit a request that is already delivered, resolved, or cancelled" } },
          { status: 400 }
        );
      }

      const {
        title,
        description,
        quantity,
        peopleAffected,
        urgency,
        resourceType,
        address,
        latitude,
        longitude,
      } = body;

      const newUrgency = urgency || request.urgency;
      const newPeople = peopleAffected !== undefined ? Number(peopleAffected) : request.peopleAffected;
      const newResource = resourceType || request.resourceType;

      const priorityResult = PriorityService.calculate({
        urgency: newUrgency,
        peopleAffected: newPeople,
        resourceType: newResource,
        createdAt: request.createdAt,
      });

      const updated = await prisma.emergencyRequest.update({
        where: { id: requestId },
        data: {
          ...(title && { title: title.trim() }),
          ...(description && { description: description.trim() }),
          ...(quantity && { quantity: quantity.trim() }),
          ...(peopleAffected !== undefined && { peopleAffected: newPeople }),
          ...(urgency && { urgency: newUrgency }),
          ...(resourceType && { resourceType: newResource }),
          priorityScore: priorityResult.priorityScore,
          priorityLevel: priorityResult.priorityLevel,
          ...(address && { address: address.trim() }),
          ...(latitude !== undefined && { latitude: Number(latitude) }),
          ...(longitude !== undefined && { longitude: Number(longitude) }),
        },
      });

      await AuditService.log({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: "REQUEST_EDITED",
        entity: "EmergencyRequest",
        entityId: requestId,
        oldValue: JSON.stringify({
          title: request.title,
          urgency: request.urgency,
          quantity: request.quantity,
          peopleAffected: request.peopleAffected,
        }),
        newValue: JSON.stringify({
          title: updated.title,
          urgency: updated.urgency,
          quantity: updated.quantity,
          peopleAffected: updated.peopleAffected,
        }),
      });

      // If assigned volunteer exists, notify them of updated parameters
      const activeAssignment = await prisma.assignment.findFirst({
        where: { requestId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      });
      if (activeAssignment) {
        await NotificationService.send({
          userId: activeAssignment.volunteerId,
          title: "Assigned Request Details Updated",
          message: `The citizen updated request details for "${updated.title}". Please review requirements.`,
          type: "INFO",
          link: "/volunteer/assignments",
        });
      }

      return NextResponse.json({
        success: true,
        data: { request: updated },
        message: "Emergency request updated successfully.",
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

export async function DELETE(
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
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: {
        assignments: {
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Emergency request not found" } },
        { status: 404 }
      );
    }

    if (request.requesterId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You are not authorized to delete this request" } },
        { status: 403 }
      );
    }

    if (request.status === "DELIVERED" || request.status === "CLOSED") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATE", message: "Delivered or completed requests cannot be deleted to preserve audit integrity" } },
        { status: 400 }
      );
    }

    // Notify assigned volunteer if any
    for (const assignment of request.assignments) {
      await NotificationService.send({
        userId: assignment.volunteerId,
        title: "Assigned Request Cancelled & Removed",
        message: `The requester has removed emergency request "${request.title}". You have been unassigned.`,
        type: "WARNING",
        link: "/volunteer/nearby",
      });
    }

    await AuditService.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "REQUEST_DELETED",
      entity: "EmergencyRequest",
      entityId: requestId,
      oldValue: JSON.stringify({ title: request.title, status: request.status }),
      newValue: "DELETED",
    });

    // Delete request (cascade will clean up assignments and disputes)
    await prisma.emergencyRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
      message: "Emergency request deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
