import { Router } from "express";
import {
  createSubmissionHandler,
  getMySubmissionsHandler,
  getSubmissionByIdHandler,
  updateSubmissionHandler,
  getReviewerSubmissionsHandler,
  getCommitteeSubmissionsHandler,
  getReviewerSubmissionByIdHandler,
  updateSubmissionStatusHandler,
} from "./submissions.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/", requireAuth, createSubmissionHandler);
router.get("/me", requireAuth, getMySubmissionsHandler);

router.get(
  "/reviewer",
  requireAuth,
  requireRole(["REVIEWER"]),
  getReviewerSubmissionsHandler,
);

router.get(
  "/committee",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getCommitteeSubmissionsHandler,
);

router.get(
  "/reviewer/:id",
  requireAuth,
  requireRole(["REVIEWER"]),
  getReviewerSubmissionByIdHandler,
);

router.patch("/:id", requireAuth, updateSubmissionHandler);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["REVIEWER", "COMMITTEE"]),
  updateSubmissionStatusHandler,
);

router.get("/:id", requireAuth, getSubmissionByIdHandler);

export default router;