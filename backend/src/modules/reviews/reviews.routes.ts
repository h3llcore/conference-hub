import { Router } from "express";
import {
  createOrUpdateReviewHandler,
  getSubmissionReviewsForCommitteeHandler,
  getSubmissionReviewsForAuthorHandler,
  getMyReviewBySubmissionHandler,
} from "./reviews.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["REVIEWER"]),
  createOrUpdateReviewHandler,
);

router.get(
  "/submission/:submissionId/committee",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getSubmissionReviewsForCommitteeHandler,
);

router.get(
  "/submission/:submissionId/author",
  requireAuth,
  requireRole(["AUTHOR"]),
  getSubmissionReviewsForAuthorHandler,
);

router.get(
  "/submission/:submissionId/my",
  requireAuth,
  requireRole(["REVIEWER"]),
  getMyReviewBySubmissionHandler,
);

export default router;