import type { Request, Response } from "express";
import { PublicationIssueStatus, PublicationIssueType } from "@prisma/client";
import {
  addSubmissionToIssue,
  createPublicationIssue,
  deletePublicationIssue,
  getPublicationIssueById,
  getPublicationIssues,
  getPublishedSubmissionsWithoutIssue,
  publishPublicationIssue,
  removeSubmissionFromIssue,
  updatePublicationIssue,
} from "./publication-issues.service.js";

export async function getPublicationIssuesHandler(req: Request, res: Response) {
  try {
    const issues = await getPublicationIssues();
    return res.json({ issues });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getPublicationIssueByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const issue = await getPublicationIssueById(id);

    if (!issue) {
      return res.status(404).json({ message: "Publication issue not found" });
    }

    return res.json({ issue });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function createPublicationIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const user = (req as any).user as { sub: string };

    const {
      title,
      description,
      type,
      venueId,
      volume,
      issueNumber,
      year,
      publishedAt,
    } = req.body;

    if (!title || !type || !venueId) {
      return res.status(400).json({
        message: "title, type and venueId are required",
      });
    }

    if (!Object.values(PublicationIssueType).includes(type)) {
      return res.status(400).json({ message: "Invalid issue type" });
    }

    const issue = await createPublicationIssue({
      title,
      description,
      type,
      venueId,
      volume: volume ? Number(volume) : undefined,
      issueNumber: issueNumber ? Number(issueNumber) : undefined,
      year: year ? Number(year) : undefined,
      publishedAt,
      createdById: user.sub,
    });

    return res.status(201).json({ issue });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function updatePublicationIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      type,
      venueId,
      volume,
      issueNumber,
      year,
      publishedAt,
      status,
    } = req.body;

    if (type && !Object.values(PublicationIssueType).includes(type)) {
      return res.status(400).json({ message: "Invalid issue type" });
    }

    if (status && !Object.values(PublicationIssueStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid issue status" });
    }

    const issue = await updatePublicationIssue(id, {
      title,
      description,
      type,
      venueId,
      volume: volume ? Number(volume) : undefined,
      issueNumber: issueNumber ? Number(issueNumber) : undefined,
      year: year ? Number(year) : undefined,
      publishedAt,
      status,
    });

    return res.json({ issue });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function deletePublicationIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    await deletePublicationIssue(id);

    return res.json({ message: "Publication issue deleted" });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function addSubmissionToIssueHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { submissionId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ message: "submissionId is required" });
    }

    const submission = await addSubmissionToIssue(id, submissionId);

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function removeSubmissionFromIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const { submissionId } = req.params;

    const submission = await removeSubmissionFromIssue(submissionId);

    return res.json({ submission });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function publishPublicationIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const issue = await publishPublicationIssue(id);

    return res.json({ issue });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getPublishedSubmissionsWithoutIssueHandler(
  req: Request,
  res: Response,
) {
  try {
    const submissions = await getPublishedSubmissionsWithoutIssue();

    return res.json({ submissions });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}