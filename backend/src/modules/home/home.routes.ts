import { Router } from "express";
import {
  createHomeContentHandler,
  deleteHomeContentHandler,
  getAllHomeContentHandler,
  getPublishedHomeContentHandler,
  updateHomeContentHandler,
} from "./home.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/", getPublishedHomeContentHandler);

router.get(
  "/admin",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getAllHomeContentHandler,
);

router.post(
  "/admin",
  requireAuth,
  requireRole(["COMMITTEE"]),
  createHomeContentHandler,
);

router.patch(
  "/admin/:id",
  requireAuth,
  requireRole(["COMMITTEE"]),
  updateHomeContentHandler,
);

router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(["COMMITTEE"]),
  deleteHomeContentHandler,
);

export default router;