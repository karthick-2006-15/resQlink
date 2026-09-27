import { prisma } from "../prisma";

export interface CreateAuditLogParams {
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
}

export class AuditService {
  public static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          actorName: params.actorName,
          actorRole: params.actorRole,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          oldValue: params.oldValue || null,
          newValue: params.newValue || null,
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  }

  public static async getRecentLogs(limit = 50) {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }
}
