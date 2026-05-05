import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  getMyNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
} from "./notifications.controller.js";

const router = Router();

router.get("/", requireAuth, getMyNotificationsHandler);

router.patch("/:id/read", requireAuth, markNotificationAsReadHandler);

router.patch("/read-all", requireAuth, markAllNotificationsAsReadHandler);

export default router;