import type { Request, Response } from "express";
import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notifications.service.js";

export async function getMyNotificationsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await getMyNotifications(userId);
    const unreadCount = await getUnreadNotificationsCount(userId);

    return res.json({ notifications, unreadCount });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markNotificationAsReadHandler(
  req: Request,
  res: Response,
) {
  try {
    const userId = (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await markNotificationAsRead(id, userId);

    return res.json({ message: "Notification marked as read" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markAllNotificationsAsReadHandler(
  req: Request,
  res: Response,
) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await markAllNotificationsAsRead(userId);

    return res.json({ message: "All notifications marked as read" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}