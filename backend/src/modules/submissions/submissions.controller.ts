import type { Request, Response } from "express";
import { SubmissionStatus } from "@prisma/client";
import { createSubmission, getMySubmissions } from "./submissions.service.js";

export async function createSubmissionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const status =
      req.body?.status === "DRAFT"
        ? SubmissionStatus.DRAFT
        : SubmissionStatus.SUBMITTED;

    const submission = await createSubmission(userId, req.body, status);

    return res.status(201).json({ submission });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
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
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}
