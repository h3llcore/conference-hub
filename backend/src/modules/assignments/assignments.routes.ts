import { Router } from "express";
import {
  assignReviewersHandler,
  getAssignmentsBySubmissionHandler,
  getMyReviewerAssignmentsHandler,
  takeAssignmentIntoWorkHandler,
} from "./assignments.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["COMMITTEE"]),
  assignReviewersHandler,
);

router.get(
  "/submission/:submissionId",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getAssignmentsBySubmissionHandler,
);

router.get(
  "/my",
  requireAuth,
  requireRole(["REVIEWER"]),
  getMyReviewerAssignmentsHandler,
);

router.patch(
  "/:assignmentId/take",
  requireAuth,
  requireRole(["REVIEWER"]),
  takeAssignmentIntoWorkHandler,
);

export default router;