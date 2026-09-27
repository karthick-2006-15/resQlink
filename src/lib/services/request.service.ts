import { prisma } from "../prisma";
import { PriorityService } from "./priority.service";
import { AuditService } from "./audit.service";
import { NotificationService } from "./notification.service";
import { PriorityLevel, RequestStatus, ResourceType, UrgencyLevel } from "@/types";

export interface CreateRequestInput {
  requesterId: string;
  resourceType: ResourceType;
  title: string;
  description: string;
  quantity: string;
  peopleAffected: number;
  urgency: UrgencyLevel;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

// Valid state machine transitions
const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  PENDING: ["VERIFIED", "REJECTED", "CANCELLED"],
  VERIFIED: ["MATCHING", "ASSIGNED", "CANCELLED"],
  MATCHING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED", "MATCHING"],
  IN_PROGRESS: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CONFIRMED", "CLOSED", "IN_PROGRESS"],
  CONFIRMED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

export class RequestService {
  /**
   * Creates a new emergency request with calculated priority
   */
  public static async createRequest(input: CreateRequestInput, actorName?: string) {
    const { priorityScore, priorityLevel } = PriorityService.calculate({
      urgency: input.urgency,
      peopleAffected: input.peopleAffected,
      resourceType: input.resourceType,
    });

    const request = await prisma.emergencyRequest.create({
      data: {
        requesterId: input.requesterId,
        resourceType: input.resourceType,
        title: input.title,
        description: input.description,
        quantity: input.quantity,
        peopleAffected: input.peopleAffected,
        urgency: input.urgency,
        priorityScore,
        priorityLevel,
        status: "PENDING",
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        imageUrl: input.imageUrl,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit log
    await AuditService.log({
      actorId: input.requesterId,
      actorName: actorName || request.requester.name,
      actorRole: "CITIZEN",
      action: "REQUEST_CREATED",
      entity: "EmergencyRequest",
      entityId: request.id,
      newValue: JSON.stringify({
        resourceType: input.resourceType,
        priorityLevel,
        urgency: input.urgency,
      }),
    });

    // Notify admins about new request (urgent if critical or high)
    await NotificationService.broadcastToAdmins({
      title: `${priorityLevel === "CRITICAL" ? "🔴 URGENT: " : "⚠️ "}New Emergency Request`,
      message: `${request.requester.name} requested ${input.quantity} of ${input.resourceType} for ${input.peopleAffected} people.`,
      type: priorityLevel === "CRITICAL" ? "URGENT" : "WARNING",
      link: `/admin/requests?id=${request.id}`,
    });

    return request;
  }

  /**
   * Admin verifies an emergency request
   */
  public static async verifyRequest(requestId: string, adminId: string, adminName: string) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { requester: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.status !== "PENDING") {
      throw new Error(`Cannot verify request with current status '${request.status}'`);
    }

    const updated = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        status: "VERIFIED",
        verifiedByAdminId: adminId,
        verifiedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: adminId,
      actorName: adminName,
      actorRole: "ADMIN",
      action: "REQUEST_VERIFIED",
      entity: "EmergencyRequest",
      entityId: requestId,
      oldValue: "PENDING",
      newValue: "VERIFIED",
    });

    await NotificationService.send({
      userId: request.requesterId,
      title: "Request Verified",
      message: `Your emergency request for ${request.resourceType} has been verified by the coordination team. Finding volunteers nearby.`,
      type: "SUCCESS",
      link: `/citizen/requests/${requestId}`,
    });

    return updated;
  }

  /**
   * Admin changes request priority level
   */
  public static async changePriority(
    requestId: string,
    newPriority: PriorityLevel,
    adminId: string,
    adminName: string
  ) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Request not found");

    const oldPriority = request.priorityLevel;
    const scoreMap = { NORMAL: 40, HIGH: 70, CRITICAL: 95 };

    const updated = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        priorityLevel: newPriority,
        priorityScore: scoreMap[newPriority],
      },
    });

    await AuditService.log({
      actorId: adminId,
      actorName: adminName,
      actorRole: "ADMIN",
      action: "PRIORITY_CHANGED",
      entity: "EmergencyRequest",
      entityId: requestId,
      oldValue: oldPriority,
      newValue: newPriority,
    });

    return updated;
  }

  /**
   * Volunteer accepts an emergency request with strict transactional locking
   */
  public static async volunteerAcceptRequest(requestId: string, volunteerId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Check request exists and is assignable
      const request = await tx.emergencyRequest.findUnique({
        where: { id: requestId },
        include: { requester: true },
      });

      if (!request) {
        throw new Error("Request not found");
      }

      if (request.status !== "VERIFIED" && request.status !== "MATCHING" && request.status !== "PENDING") {
        throw new Error(`This request is no longer available (current status: ${request.status})`);
      }

      // 2. Check volunteer profile
      const profile = await tx.volunteerProfile.findUnique({
        where: { userId: volunteerId },
        include: { user: true },
      });

      if (!profile) {
        throw new Error("Volunteer profile not found");
      }

      if (!profile.isVerified) {
        throw new Error("Your volunteer account is pending admin verification before accepting requests.");
      }

      if (!profile.isAvailable) {
        throw new Error("Your status is set to Unavailable. Please toggle availability to accept requests.");
      }

      // 3. Check existing active assignment for this request
      const existingAssignment = await tx.assignment.findFirst({
        where: {
          requestId,
          status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        },
      });

      if (existingAssignment) {
        throw new Error("This request has already been assigned to another volunteer.");
      }

      // 4. Create assignment
      const assignment = await tx.assignment.create({
        data: {
          requestId,
          volunteerId,
          status: "ASSIGNED",
          acceptedAt: new Date(),
        },
      });

      // 5. Update request status to ASSIGNED
      const updatedRequest = await tx.emergencyRequest.update({
        where: { id: requestId },
        data: {
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          actorId: volunteerId,
          actorName: profile.user.name,
          actorRole: "VOLUNTEER",
          action: "VOLUNTEER_ACCEPTED",
          entity: "Assignment",
          entityId: assignment.id,
          newValue: JSON.stringify({ requestId, volunteerId }),
        },
      });

      // 7. Notify Citizen
      await tx.notification.create({
        data: {
          userId: request.requesterId,
          title: "Volunteer Matched & Assigned!",
          message: `${profile.user.name} has accepted your request for ${request.resourceType} and is preparing to assist you.`,
          type: "SUCCESS",
          link: `/citizen/requests/${requestId}`,
        },
      });

      return { assignment, request: updatedRequest };
    });
  }

  /**
   * Volunteer starts delivery
   */
  public static async startDelivery(assignmentId: string, volunteerId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        request: { include: { requester: true } },
        volunteer: true,
      },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (assignment.volunteerId !== volunteerId) throw new Error("Unauthorized");
    if (assignment.status !== "ASSIGNED") {
      throw new Error(`Cannot start delivery from status '${assignment.status}'`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      await tx.emergencyRequest.update({
        where: { id: assignment.requestId },
        data: { status: "IN_PROGRESS" },
      });

      await tx.auditLog.create({
        data: {
          actorId: volunteerId,
          actorName: assignment.volunteer.name,
          actorRole: "VOLUNTEER",
          action: "DELIVERY_STARTED",
          entity: "Assignment",
          entityId: assignmentId,
        },
      });

      await tx.notification.create({
        data: {
          userId: assignment.request.requesterId,
          title: "Delivery In Progress",
          message: `${assignment.volunteer.name} has started transit with your emergency resources!`,
          type: "INFO",
          link: `/citizen/requests/${assignment.requestId}`,
        },
      });

      return a;
    });

    return updated;
  }

  /**
   * Volunteer marks delivery as complete
   */
  public static async markDelivered(assignmentId: string, volunteerId: string, notes?: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        request: { include: { requester: true } },
        volunteer: true,
      },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (assignment.volunteerId !== volunteerId) throw new Error("Unauthorized");

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          notes: notes || assignment.notes,
        },
      });

      await tx.emergencyRequest.update({
        where: { id: assignment.requestId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: volunteerId,
          actorName: assignment.volunteer.name,
          actorRole: "VOLUNTEER",
          action: "MARKED_DELIVERED",
          entity: "Assignment",
          entityId: assignmentId,
        },
      });

      await tx.notification.create({
        data: {
          userId: assignment.request.requesterId,
          title: "Supplies Delivered - Please Confirm",
          message: `${assignment.volunteer.name} marked your emergency resources as delivered. Please confirm receipt to resolve.`,
          type: "URGENT",
          link: `/citizen/requests/${assignment.requestId}`,
        },
      });

      return a;
    });

    return updated;
  }

  /**
   * Citizen confirms delivery receipt -> Closes request and increments volunteer stats
   */
  public static async confirmDelivery(requestId: string, citizenId: string) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        assignments: {
          where: { status: "DELIVERED" },
          include: { volunteer: true },
        },
      },
    });

    if (!request) throw new Error("Request not found");
    if (request.requesterId !== citizenId) throw new Error("Unauthorized");
    if (request.status !== "DELIVERED") {
      throw new Error(`Cannot confirm receipt for request in '${request.status}' state`);
    }

    const latestAssignment = request.assignments[0];

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Request to CLOSED
      const updatedReq = await tx.emergencyRequest.update({
        where: { id: requestId },
        data: {
          status: "CLOSED",
          confirmedAt: new Date(),
          closedAt: new Date(),
        },
      });

      // 2. Update Assignment to CONFIRMED
      if (latestAssignment) {
        await tx.assignment.update({
          where: { id: latestAssignment.id },
          data: {
            status: "CONFIRMED",
            completedAt: new Date(),
          },
        });

        // 3. Increment volunteer completed assignments count
        await tx.volunteerProfile.updateMany({
          where: { userId: latestAssignment.volunteerId },
          data: {
            completedAssignments: { increment: 1 },
          },
        });

        // 4. Notify volunteer of successful completion
        await tx.notification.create({
          data: {
            userId: latestAssignment.volunteerId,
            title: "Delivery Confirmed & Resolved! 🎉",
            message: `The citizen confirmed receipt of ${request.resourceType}. Thank you for your service to the community!`,
            type: "SUCCESS",
            link: `/volunteer/assignments`,
          },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: citizenId,
          actorName: request.requester.name,
          actorRole: "CITIZEN",
          action: "REQUEST_CONFIRMED_CLOSED",
          entity: "EmergencyRequest",
          entityId: requestId,
          oldValue: "DELIVERED",
          newValue: "CLOSED",
        },
      });

      return updatedReq;
    });

    return result;
  }

  /**
   * Citizen or Admin reports a delivery dispute
   */
  public static async reportDispute(params: {
    requestId: string;
    reporterId: string;
    reporterName: string;
    reason: string;
  }) {
    const dispute = await prisma.deliveryDispute.create({
      data: {
        requestId: params.requestId,
        reporterId: params.reporterId,
        reason: params.reason,
        status: "PENDING",
      },
    });

    await AuditService.log({
      actorId: params.reporterId,
      actorName: params.reporterName,
      actorRole: "CITIZEN",
      action: "DISPUTE_REPORTED",
      entity: "DeliveryDispute",
      entityId: dispute.id,
      newValue: params.reason,
    });

    await NotificationService.broadcastToAdmins({
      title: "🚨 Delivery Dispute Reported",
      message: `Citizen reported an issue with request ${params.requestId}: "${params.reason}"`,
      type: "URGENT",
      link: `/admin/requests?id=${params.requestId}`,
    });

    return dispute;
  }
}
