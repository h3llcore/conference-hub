import type { Request, Response } from "express";
import {
  assignReviewersToSubmission,
  getAssignmentsBySubmission,
  getMyReviewerAssignments,
  takeAssignmentIntoWork,
} from "./assignments.service.js";

export async function assignReviewersHandler(req: Request, res: Response) {
  try {
    const { submissionId, reviewerIds } = req.body as {
      submissionId?: string;
      reviewerIds?: string[];
    };

    if (!submissionId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      return res.status(400).json({
        message: "submissionId and reviewerIds are required",
      });
    }

    const assignments = await assignReviewersToSubmission(
      submissionId,
      reviewerIds,
    );

    return res.status(201).json({ assignments });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getAssignmentsBySubmissionHandler(
  req: Request,
  res: Response,
) {
  try {
    const { submissionId } = req.params;

    const assignments = await getAssignmentsBySubmission(submissionId);

    return res.json({ assignments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMyReviewerAssignmentsHandler(
  req: Request,
  res: Response,
) {
  try {
    const reviewerId = (req as any).user?.sub;

    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const assignments = await getMyReviewerAssignments(reviewerId);

    return res.json({ assignments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function takeAssignmentIntoWorkHandler(
  req: Request,
  res: Response,
) {
  try {
    const reviewerId = (req as any).user?.sub;

    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { assignmentId } = req.params;

    const assignment = await takeAssignmentIntoWork(assignmentId, reviewerId);

    return res.json({ assignment });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}