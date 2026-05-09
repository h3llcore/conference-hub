import type { Request, Response } from "express";
import { SubmissionStatus } from "@prisma/client";
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  updateSubmission,
  getReviewerSubmissions,
  getCommitteeSubmissions,
  getReviewerSubmissionById,
  updateSubmissionStatus,
  publishSubmission,
} from "./submissions.service.js";

export async function createSubmissionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file as Express.Multer.File | undefined;

    const status =
      req.body?.status === "DRAFT"
        ? SubmissionStatus.DRAFT
        : SubmissionStatus.SUBMITTED;

    const submission = await createSubmission(
      userId,
      {
        ...req.body,
        fileName: file?.filename || req.body.fileName || null,
      },
      status,
    );

    return res.status(201).json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getMySubmissionsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submissions = await getMySubmissions(userId);

    return res.json({ submissions });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getSubmissionByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submission = await getSubmissionById(id, userId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function updateSubmissionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file as Express.Multer.File | undefined;

    const submission = await updateSubmission(id, userId, {
      ...req.body,
      fileName: file?.filename || req.body.fileName || null,
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getReviewerSubmissionsHandler(req: Request, res: Response) {
  try {
    const submissions = await getReviewerSubmissions();
    return res.json({ submissions });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getCommitteeSubmissionsHandler(req: Request, res: Response) {
  try {
    const submissions = await getCommitteeSubmissions();
    return res.json({ submissions });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getReviewerSubmissionByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const submission = await getReviewerSubmissionById(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function updateSubmissionStatusHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { status } = req.body as {
      status?:
        | "UNDER_REVIEW"
        | "ACCEPTED"
        | "REJECTED"
        | "REVISION_REQUIRED"
        | "RESUBMITTED"
        | "PUBLISHED";
    };

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    if (
      ![
        "UNDER_REVIEW",
        "ACCEPTED",
        "REJECTED",
        "REVISION_REQUIRED",
        "RESUBMITTED",
        "PUBLISHED",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "invalid status" });
    }

    const submission = await updateSubmissionStatus(id, status as SubmissionStatus);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function publishSubmissionHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const submission = await publishSubmission(id);

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);

    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}