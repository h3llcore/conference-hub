import type { Request, Response } from "express";
import {
  createOrUpdateReview,
  getSubmissionReviewsForCommittee,
  getSubmissionReviewsForAuthor,
  getMyReviewBySubmission,
} from "./reviews.service.js";

export async function createOrUpdateReviewHandler(
  req: Request,
  res: Response,
) {
  try {
    const reviewerId = (req as any).user?.sub;

    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await createOrUpdateReview(reviewerId, req.body);

    return res.status(201).json({ review });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getSubmissionReviewsForCommitteeHandler(
  req: Request,
  res: Response,
) {
  try {
    const { submissionId } = req.params;
    const reviews = await getSubmissionReviewsForCommittee(submissionId);

    return res.json({ reviews });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getSubmissionReviewsForAuthorHandler(
  req: Request,
  res: Response,
) {
  try {
    const { submissionId } = req.params;
    const reviews = await getSubmissionReviewsForAuthor(submissionId);

    return res.json({ reviews });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMyReviewBySubmissionHandler(
  req: Request,
  res: Response,
) {
  try {
    const reviewerId = (req as any).user?.sub;

    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { submissionId } = req.params;
    const review = await getMyReviewBySubmission(submissionId, reviewerId);

    return res.json({ review });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}