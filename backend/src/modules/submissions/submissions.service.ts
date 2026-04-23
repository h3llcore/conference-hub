import { prisma } from "../../config/prisma.js";
import {
  AssignmentStatus,
  SubmissionStatus,
  VenueType,
} from "@prisma/client";

export async function createSubmission(
  userId: string,
  data: any,
  status: SubmissionStatus = SubmissionStatus.SUBMITTED,
) {
  return prisma.submission.create({
    data: {
      title: data.title,
      abstract: data.abstract,
      keywords: data.keywords,
      venueType: data.venueType as VenueType,
      venue: data.venue,
      coAuthors: data.coAuthors || null,
      notes: data.notes || null,
      fileName: data.fileName || null,
      status,
      authorId: userId,
    },
  });
}

export async function getMySubmissions(userId: string) {
  return prisma.submission.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubmissionById(submissionId: string, userId: string) {
  return prisma.submission.findFirst({
    where: {
      id: submissionId,
      authorId: userId,
    },
  });
}

export async function updateSubmission(
  submissionId: string,
  userId: string,
  data: any,
) {
  const existing = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      authorId: userId,
    },
  });

  if (!existing) {
    return null;
  }

  let nextStatus: SubmissionStatus = SubmissionStatus.SUBMITTED;
  let nextVersion = existing.version;
  let nextRound = existing.currentRound;

  if (data?.status === "DRAFT") {
    nextStatus = SubmissionStatus.DRAFT;
  } else if (
    existing.status === SubmissionStatus.REVISION_REQUIRED &&
    (data?.status === "RESUBMITTED" || data?.status === "SUBMITTED")
  ) {
    nextStatus = SubmissionStatus.RESUBMITTED;
    nextVersion = existing.version + 1;
    nextRound = existing.currentRound + 1;
  } else {
    nextStatus = SubmissionStatus.SUBMITTED;
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      title: data.title,
      abstract: data.abstract,
      keywords: data.keywords,
      venueType: data.venueType as VenueType,
      venue: data.venue,
      coAuthors: data.coAuthors || null,
      notes: data.notes || null,
      fileName: data.fileName || null,
      status: nextStatus,
      version: nextVersion,
      currentRound: nextRound,
    },
  });
}

export async function getReviewerSubmissions() {
  return prisma.submission.findMany({
    where: {
      status: {
        in: [
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.ACCEPTED,
          SubmissionStatus.REJECTED,
          SubmissionStatus.REVISION_REQUIRED,
          SubmissionStatus.RESUBMITTED,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
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
  });
}

export async function getCommitteeSubmissions() {
  return prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
        },
      },
    },
  });
}

export async function getReviewerSubmissionById(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
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
  });
}

async function assertCurrentRoundIsCompleted(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      currentRound: true,
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    (error as any).status = 404;
    throw error;
  }

  const currentRoundAssignments = await prisma.submissionReviewer.findMany({
    where: {
      submissionId,
      round: submission.currentRound,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (currentRoundAssignments.length === 0) {
    const error = new Error(
      "Cannot make a final decision before assigning reviewers",
    );
    (error as any).status = 409;
    throw error;
  }

  const hasIncompleteReview = currentRoundAssignments.some(
    (assignment) => assignment.status !== AssignmentStatus.COMPLETED,
  );

  if (hasIncompleteReview) {
    const error = new Error(
      "Cannot make a final decision until all reviewers complete the current round",
    );
    (error as any).status = 409;
    throw error;
  }
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
) {
  const existing = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
        },
      },
    },
  });

  if (!existing) {
    return null;
  }

  if (
    status === SubmissionStatus.REVISION_REQUIRED ||
    status === SubmissionStatus.ACCEPTED ||
    status === SubmissionStatus.REJECTED ||
    status === SubmissionStatus.PUBLISHED
  ) {
    await assertCurrentRoundIsCompleted(submissionId);
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      finalDecisionAt:
        status === SubmissionStatus.ACCEPTED ||
        status === SubmissionStatus.REJECTED
          ? new Date()
          : existing.finalDecisionAt,
      publishedAt:
        status === SubmissionStatus.PUBLISHED
          ? new Date()
          : existing.publishedAt,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
        },
      },
    },
  });
}