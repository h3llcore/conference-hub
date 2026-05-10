import { Router } from "express";
import {
  addSubmissionToIssueHandler,
  createPublicationIssueHandler,
  deletePublicationIssueHandler,
  getPublicationIssueByIdHandler,
  getPublicationIssuesHandler,
  getPublishedSubmissionsWithoutIssueHandler,
  publishPublicationIssueHandler,
  removeSubmissionFromIssueHandler,
  updatePublicationIssueHandler,
} from "./publication-issues.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/", getPublicationIssuesHandler);

router.get(
  "/available-submissions",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getPublishedSubmissionsWithoutIssueHandler,
);

router.get("/:id", getPublicationIssueByIdHandler);

router.post(
  "/",
  requireAuth,
  requireRole(["COMMITTEE"]),
  createPublicationIssueHandler,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["COMMITTEE"]),
  updatePublicationIssueHandler,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["COMMITTEE"]),
  deletePublicationIssueHandler,
);

router.post(
  "/:id/submissions",
  requireAuth,
  requireRole(["COMMITTEE"]),
  addSubmissionToIssueHandler,
);

router.delete(
  "/submissions/:submissionId",
  requireAuth,
  requireRole(["COMMITTEE"]),
  removeSubmissionFromIssueHandler,
);

router.patch(
  "/:id/publish",
  requireAuth,
  requireRole(["COMMITTEE"]),
  publishPublicationIssueHandler,
);

export default router;