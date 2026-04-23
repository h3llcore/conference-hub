import { prisma } from "../../config/prisma.js";
import {
  AssignmentStatus,
  ReviewDecision,
  ReviewScore,
} from "@prisma/client";

type ReviewPayload = {
  submissionId: string;
  titleScore: ReviewScore;
  relevanceScore: ReviewScore;
  abstractScore: ReviewScore;
  structureScore: ReviewScore;
  methodologyScore: ReviewScore;
  formattingScore: ReviewScore;
  referencesScore: ReviewScore;
  overallScore: ReviewScore;
  comments?: string;
  recommendations?: string;
  conclusion?: string;
  decision: ReviewDecision;
};

async function findReviewerActiveAssignment(
  submissionId: string,
  reviewerId: string,
) {
  const activeAssignment = await prisma.submissionReviewer.findFirst({
    where: {
      submissionId,
      reviewerId,
      status: {
        not: AssignmentStatus.COMPLETED,
      },
    },
    orderBy: [{ round: "desc" }, { assignedAt: "desc" }],
  });

  if (activeAssignment) return activeAssignment;

  return prisma.submissionReviewer.findFirst({
    where: {
      submissionId,
      reviewerId,
    },
    orderBy: [{ round: "desc" }, { assignedAt: "desc" }],
  });
}

export async function createOrUpdateReview(
  reviewerId: string,
  payload: ReviewPayload,
) {
  const assignment = await findReviewerActiveAssignment(
    payload.submissionId,
    reviewerId,
  );

  if (!assignment) {
    const error = new Error("Reviewer is not assigned to this submission");
    (error as any).status = 403;
    throw error;
  }

  const review = await prisma.review.upsert({
    where: {
      submissionId_reviewerId_round: {
        submissionId: payload.submissionId,
        reviewerId,
        round: assignment.round,
      },
    },
    update: {
      titleScore: payload.titleScore,
      relevanceScore: payload.relevanceScore,
      abstractScore: payload.abstractScore,
      structureScore: payload.structureScore,
      methodologyScore: payload.methodologyScore,
      formattingScore: payload.formattingScore,
      referencesScore: payload.referencesScore,
      overallScore: payload.overallScore,
      comments: payload.comments || null,
      recommendations: payload.recommendations || null,
      conclusion: payload.conclusion || null,
      decision: payload.decision,
    },
    create: {
      submissionId: payload.submissionId,
      reviewerId,
      round: assignment.round,
      titleScore: payload.titleScore,
      relevanceScore: payload.relevanceScore,
      abstractScore: payload.abstractScore,
      structureScore: payload.structureScore,
      methodologyScore: payload.methodologyScore,
      formattingScore: payload.formattingScore,
      referencesScore: payload.referencesScore,
      overallScore: payload.overallScore,
      comments: payload.comments || null,
      recommendations: payload.recommendations || null,
      conclusion: payload.conclusion || null,
      decision: payload.decision,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  await prisma.submissionReviewer.update({
    where: { id: assignment.id },
    data: {
      status: AssignmentStatus.COMPLETED,
    },
  });

  return review;
}

export async function getSubmissionReviewsForCommittee(submissionId: string) {
  return prisma.review.findMany({
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
        },
      },
    },
    orderBy: [{ round: "desc" }, { createdAt: "desc" }],
  });
}

export async function getSubmissionReviewsForAuthor(submissionId: string) {
  return prisma.review.findMany({
    where: { submissionId },
    select: {
      id: true,
      round: true,
      titleScore: true,
      relevanceScore: true,
      abstractScore: true,
      structureScore: true,
      methodologyScore: true,
      formattingScore: true,
      referencesScore: true,
      overallScore: true,
      comments: true,
      recommendations: true,
      conclusion: true,
      decision: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ round: "desc" }, { createdAt: "desc" }],
  });
}

export async function getMyReviewBySubmission(
  submissionId: string,
  reviewerId: string,
) {
  const assignment = await findReviewerActiveAssignment(submissionId, reviewerId);

  if (!assignment) {
    return null;
  }

  return prisma.review.findUnique({
    where: {
      submissionId_reviewerId_round: {
        submissionId,
        reviewerId,
        round: assignment.round,
      },
    },
  });
}