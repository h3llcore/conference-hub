import { prisma } from "../../config/prisma.js";
import { AssignmentStatus, SubmissionStatus } from "@prisma/client";

export async function assignReviewersToSubmission(
  submissionId: string,
  reviewerIds: string[],
) {
  const uniqueReviewerIds = [...new Set(reviewerIds)].filter(Boolean);

  if (uniqueReviewerIds.length === 0) {
    throw new Error("At least one reviewer is required");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    (error as any).status = 404;
    throw error;
  }

  const reviewers = await prisma.user.findMany({
    where: {
      id: { in: uniqueReviewerIds },
      role: "REVIEWER",
    },
    select: {
      id: true,
    },
  });

  if (reviewers.length !== uniqueReviewerIds.length) {
    const error = new Error("Some reviewers are invalid");
    (error as any).status = 400;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    for (const reviewerId of uniqueReviewerIds) {
      await tx.submissionReviewer.upsert({
        where: {
          submissionId_reviewerId_round: {
            submissionId,
            reviewerId,
            round: submission.currentRound,
          },
        },
        update: {
          status: AssignmentStatus.ASSIGNED,
          assignedAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          submissionId,
          reviewerId,
          round: submission.currentRound,
          status: AssignmentStatus.ASSIGNED,
        },
      });
    }

    await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.UNDER_REVIEW,
      },
    });
  });

  return prisma.submissionReviewer.findMany({
    where: {
      submissionId,
      round: submission.currentRound,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
          role: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });
}

export async function getAssignmentsBySubmission(submissionId: string) {
  return prisma.submissionReviewer.findMany({
    where: { submissionId },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
          role: true,
        },
      },
    },
    orderBy: [{ round: "desc" }, { assignedAt: "desc" }],
  });
}

export async function getMyReviewerAssignments(reviewerId: string) {
  return prisma.submissionReviewer.findMany({
    where: { reviewerId },
    include: {
      submission: {
        select: {
          id: true,
          title: true,
          abstract: true,
          keywords: true,
          venueType: true,
          venue: true,
          coAuthors: true,
          notes: true,
          fileName: true,
          status: true,
          version: true,
          currentRound: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [{ round: "desc" }, { assignedAt: "desc" }],
  });
}

export async function takeAssignmentIntoWork(
  assignmentId: string,
  reviewerId: string,
) {
  const assignment = await prisma.submissionReviewer.findFirst({
    where: {
      id: assignmentId,
      reviewerId,
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found");
    (error as any).status = 404;
    throw error;
  }

  return prisma.submissionReviewer.update({
    where: { id: assignmentId },
    data: {
      status: AssignmentStatus.IN_PROGRESS,
    },
  });
}