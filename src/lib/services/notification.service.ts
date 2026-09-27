import { prisma } from "../prisma";

export class NotificationService {
  /**
   * Send a targeted in-app notification to a user.
   */
  public static async send(params: {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "URGENT";
    link?: string;
  }): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || "INFO",
          link: params.link || null,
        },
      });
    } catch (err) {
      console.error("Failed to deliver notification:", err);
    }
  }

  /**
   * Broadcast an alert to all system administrators.
   */
  public static async broadcastToAdmins(params: {
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "URGENT";
    link?: string;
  }): Promise<void> {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (admins.length === 0) return;

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: params.title,
          message: params.message,
          type: params.type || "URGENT",
          link: params.link || null,
        })),
      });
    } catch (err) {
      console.error("Failed to broadcast notification to admins:", err);
    }
  }

  /**
   * Mark user notification as read.
   */
  public static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all unread notifications for a user as read.
   */
  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
